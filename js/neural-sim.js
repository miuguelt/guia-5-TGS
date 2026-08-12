/* =========================================================================
   Guía 5 · TGS → Arquitectura → IA
   neural-sim.js — caja de arena sistémica.

   Red multicapa 2 → H → 1 (tanh + sigmoide, entropía cruzada binaria),
   con paso hacia adelante, retropropagación y descenso de gradiente
   implementados a mano: el objetivo pedagógico es que el bucle de control
   sea visible, no que la red sea eficiente.

   Lectura sistémica de cada elemento:
     · pérdida        → señal del SENSOR (desviación medida)
     · gradiente      → COMPARADOR (dirección y magnitud de la corrección)
     · actualización  → ACTUADOR (acción sobre la planta)
     · pesos          → PLANTA (el sistema controlado)
   ========================================================================= */
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const mainCanvas = $("sim-canvas");
  if (!mainCanvas || !mainCanvas.getContext) return;

  const netCanvas = $("net-canvas");
  const lossCanvas = $("loss-canvas");
  const logBox = $("sim-log");

  const REDUCED = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  const COL = {
    c1: [34, 211, 238],
    c0: [167, 139, 250],
    grid: "#111d29",
    axis: "#1e2c3b",
    txt: "#64768c",
    ok: "#34d399",
    warn: "#fbbf24",
    bad: "#fb7185",
    cyan: "#22d3ee",
  };

  /* =====================================================================
     Aleatoriedad reproducible
     ===================================================================== */
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  let rnd = mulberry32(20260807);
  const gauss = () => {
    let u = 0;
    let v = 0;
    while (u === 0) u = rnd();
    while (v === 0) v = rnd();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };

  /* =====================================================================
     Entorno: generación de datos
     ===================================================================== */
  const N_POINTS = 280;

  function makeData(kind, sigma) {
    const pts = [];
    const flip = sigma * 0.2; // entropía irreducible: etiquetas contradictorias
    const jitter = (v) => v + gauss() * sigma * 0.28;

    for (let i = 0; i < N_POINTS; i++) {
      let x;
      let y;
      let label;

      if (kind === "xor") {
        x = rnd() * 1.8 - 0.9;
        y = rnd() * 1.8 - 0.9;
        if (Math.abs(x) < 0.12) x += x >= 0 ? 0.12 : -0.12;
        if (Math.abs(y) < 0.12) y += y >= 0 ? 0.12 : -0.12;
        label = x * y > 0 ? 1 : 0;
      } else if (kind === "spiral") {
        const arm = i % 2;
        const t = (i / N_POINTS) * 1.0;
        const r = 0.1 + 0.85 * t;
        const th = t * 2.1 * Math.PI + arm * Math.PI;
        x = r * Math.cos(th);
        y = r * Math.sin(th);
        label = arm;
      } else {
        const inner = i % 2 === 0;
        const th = rnd() * 2 * Math.PI;
        const r = inner ? Math.sqrt(rnd()) * 0.42 : 0.66 + rnd() * 0.28;
        x = r * Math.cos(th);
        y = r * Math.sin(th);
        label = inner ? 1 : 0;
      }

      if (rnd() < flip) label = 1 - label;
      pts.push({ x: jitter(x), y: jitter(y), l: label });
    }
    return pts;
  }

  /* =====================================================================
     Planta: red 2 → H → 1
     ===================================================================== */
  /* Momento (término de inercia del lazo): acumula la dirección de corrección
     de las épocas anteriores. En clave de control es la memoria del regulador:
     acelera donde el error es consistente y amortigua donde oscila. */
  const BETA = 0.9;

  function makeNet(h) {
    const W1 = [];
    const vW1 = [];
    const b1 = new Float64Array(h);
    const W2 = new Float64Array(h);
    const s1 = Math.sqrt(1 / 2);
    const s2 = Math.sqrt(1 / h);
    for (let i = 0; i < h; i++) {
      W1.push([gauss() * s1, gauss() * s1]);
      vW1.push([0, 0]);
      W2[i] = gauss() * s2;
    }
    return {
      h,
      W1,
      b1,
      W2,
      b2: 0,
      vW1,
      vb1: new Float64Array(h),
      vW2: new Float64Array(h),
      vb2: 0,
    };
  }

  const tanh = Math.tanh;
  function sigmoid(z) {
    if (z >= 0) return 1 / (1 + Math.exp(-z));
    const e = Math.exp(z);
    return e / (1 + e);
  }

  function predict(net, x, y, a1) {
    let z2 = net.b2;
    for (let i = 0; i < net.h; i++) {
      const a = tanh(net.W1[i][0] * x + net.W1[i][1] * y + net.b1[i]);
      if (a1) a1[i] = a;
      z2 += net.W2[i] * a;
    }
    return sigmoid(z2);
  }

  /* Una época completa: adelante + atrás + actualización sobre todo el lote. */
  function trainEpoch(net, data, lr, apply) {
    const h = net.h;
    const gW1 = [];
    const gb1 = new Float64Array(h);
    const gW2 = new Float64Array(h);
    let gb2 = 0;
    for (let i = 0; i < h; i++) gW1.push([0, 0]);

    const a1 = new Float64Array(h);
    let loss = 0;
    let correct = 0;
    const n = data.length;

    for (let k = 0; k < n; k++) {
      const p = data[k];
      const out = predict(net, p.x, p.y, a1);
      const q = Math.min(1 - 1e-7, Math.max(1e-7, out));

      loss += -(p.l * Math.log(q) + (1 - p.l) * Math.log(1 - q));
      if ((q >= 0.5 ? 1 : 0) === p.l) correct++;

      const dz2 = q - p.l; // derivada de entropía cruzada + sigmoide
      gb2 += dz2;
      for (let i = 0; i < h; i++) {
        gW2[i] += dz2 * a1[i];
        const dz1 = dz2 * net.W2[i] * (1 - a1[i] * a1[i]);
        gW1[i][0] += dz1 * p.x;
        gW1[i][1] += dz1 * p.y;
        gb1[i] += dz1;
      }
    }

    let sq = gb2 * gb2;
    for (let i = 0; i < h; i++) {
      sq += gW2[i] * gW2[i] + gW1[i][0] * gW1[i][0] + gW1[i][1] * gW1[i][1] + gb1[i] * gb1[i];
    }
    const gradNorm = Math.sqrt(sq) / n;

    if (apply) {
      net.vb2 = BETA * net.vb2 + gb2 / n;
      net.b2 -= lr * net.vb2;
      for (let i = 0; i < h; i++) {
        net.vW2[i] = BETA * net.vW2[i] + gW2[i] / n;
        net.W2[i] -= lr * net.vW2[i];

        net.vW1[i][0] = BETA * net.vW1[i][0] + gW1[i][0] / n;
        net.vW1[i][1] = BETA * net.vW1[i][1] + gW1[i][1] / n;
        net.W1[i][0] -= lr * net.vW1[i][0];
        net.W1[i][1] -= lr * net.vW1[i][1];

        net.vb1[i] = BETA * net.vb1[i] + gb1[i] / n;
        net.b1[i] -= lr * net.vb1[i];
      }
    }

    return { loss: loss / n, acc: correct / n, grad: gradNorm };
  }

  /* =====================================================================
     Estado del simulador
     ===================================================================== */
  const S = {
    dataset: "circle",
    hidden: 6,
    lr: 0.1377,
    sigma: 0.1,
    feedback: true,
    running: false,
    epoch: 0,
    loss: NaN,
    acc: 0,
    grad: 0,
    history: [],
    marks: [],
    data: [],
    net: null,
    state: "idle",
    reachedHomeostasis: false,
    shockAt: -1,
    shockLoss: 0,
    stallWarned: false,
    divergedWarned: false,
    frame: 0,
  };

  /* Umbral de inestabilidad: ln(2) ≈ 0,693 es el valor de un sistema que no sabe
     nada. Por encima de 1,6 el sistema no sólo falla: falla con confianza. */
  const DIVERGE = 1.6;

  /* =====================================================================
     Bitácora sistémica
     ===================================================================== */
  function log(kind, msg) {
    if (!logBox) return;
    const p = document.createElement("p");
    p.innerHTML =
      '<span class="t">t=' + String(S.epoch).padStart(4, "0") + "</span> " +
      '<span class="' + kind + '">' + msg + "</span>";
    logBox.appendChild(p);
    while (logBox.childElementCount > 90) logBox.removeChild(logBox.firstElementChild);
    logBox.scrollTop = logBox.scrollHeight;
  }

  const nf = (v, d) => {
    if (!isFinite(v)) return "∞";
    try {
      return v.toLocaleString("es-CO", { minimumFractionDigits: d, maximumFractionDigits: d });
    } catch (_) {
      return v.toFixed(d);
    }
  };

  /* =====================================================================
     Lienzos con densidad de píxeles
     ===================================================================== */
  function setupCanvas(cv, baseW, baseH) {
    const scale = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(baseW * scale);
    cv.height = Math.round(baseH * scale);
    const ctx = cv.getContext("2d");
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    return { ctx, w: baseW, h: baseH };
  }

  const main = setupCanvas(mainCanvas, 520, 520);
  const net2d = netCanvas ? setupCanvas(netCanvas, 520, 300) : null;
  const loss2d = lossCanvas ? setupCanvas(lossCanvas, 520, 200) : null;

  /* Rejilla de la frontera de decisión (baja resolución, escalada al dibujar) */
  const RES = 54;
  const grid = document.createElement("canvas");
  grid.width = RES;
  grid.height = RES;
  const gctx = grid.getContext("2d");
  const gimg = gctx.createImageData(RES, RES);

  const toPx = (v, size) => ((v + 1.2) / 2.4) * size;

  function drawBoundary() {
    const d = gimg.data;
    for (let j = 0; j < RES; j++) {
      const y = 1.2 - ((j + 0.5) / RES) * 2.4;
      for (let i = 0; i < RES; i++) {
        const x = ((i + 0.5) / RES) * 2.4 - 1.2;
        const p = S.net ? predict(S.net, x, y, null) : 0.5;
        const c = p >= 0.5 ? COL.c1 : COL.c0;
        const conf = Math.abs(p - 0.5) * 2; // 0 = frontera, 1 = decisión firme
        const a = 0.1 + conf * 0.42;
        const k = (j * RES + i) * 4;
        d[k] = Math.round(c[0] * a + 8 * (1 - a));
        d[k + 1] = Math.round(c[1] * a + 12 * (1 - a));
        d[k + 2] = Math.round(c[2] * a + 18 * (1 - a));
        d[k + 3] = 255;
      }
    }
    gctx.putImageData(gimg, 0, 0);

    const { ctx, w, h } = main;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(grid, 0, 0, w, h);
  }

  function drawPoints() {
    const { ctx, w, h } = main;

    ctx.strokeStyle = "rgba(255,255,255,.05)";
    ctx.lineWidth = 1;
    for (let g = -1; g <= 1; g += 0.5) {
      const px = toPx(g, w);
      const py = toPx(g, h);
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, h);
      ctx.moveTo(0, py);
      ctx.lineTo(w, py);
      ctx.stroke();
    }

    S.data.forEach((p) => {
      const px = toPx(p.x, w);
      const py = toPx(-p.y, h);
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fillStyle = p.l === 1 ? "#67e8f9" : "#c4b5fd";
      ctx.fill();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = "rgba(5,8,13,.85)";
      ctx.stroke();
    });
  }

  function drawNet() {
    if (!net2d || !S.net) return;
    const { ctx, w, h } = net2d;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#05080d";
    ctx.fillRect(0, 0, w, h);

    const xIn = 78;
    const xHid = 260;
    const xOut = 448;
    const inY = [h * 0.38, h * 0.62];
    const hN = S.net.h;
    const top = 46;
    const bot = h - 26;
    const hidY = [];
    for (let i = 0; i < hN; i++) {
      hidY.push(hN === 1 ? h / 2 : top + ((bot - top) * i) / (hN - 1));
    }
    const outY = h / 2;

    const dash = REDUCED || !S.running ? 0 : (S.frame * 0.9) % 14;

    const edge = (x1, y1, x2, y2, wgt) => {
      const a = Math.min(1, Math.abs(wgt) / 2.4);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineWidth = 0.5 + a * 3.2;
      ctx.strokeStyle = wgt >= 0 ? "rgba(34,211,238," + (0.16 + a * 0.7) + ")" : "rgba(251,113,133," + (0.16 + a * 0.7) + ")";
      ctx.setLineDash(dash ? [6, 8] : []);
      ctx.lineDashOffset = -dash;
      ctx.stroke();
      ctx.setLineDash([]);
    };

    for (let i = 0; i < hN; i++) {
      edge(xIn + 14, inY[0], xHid - 12, hidY[i], S.net.W1[i][0]);
      edge(xIn + 14, inY[1], xHid - 12, hidY[i], S.net.W1[i][1]);
      edge(xHid + 12, hidY[i], xOut - 14, outY, S.net.W2[i]);
    }

    const node = (x, y, r, label, color) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = "#0b1119";
      ctx.fill();
      ctx.lineWidth = 1.6;
      ctx.strokeStyle = color;
      ctx.stroke();
      if (label) {
        ctx.fillStyle = color;
        ctx.font = "600 10px 'JetBrains Mono', monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, x, y);
      }
    };

    node(xIn, inY[0], 14, "x₁", "#7dd3fc");
    node(xIn, inY[1], 14, "x₂", "#7dd3fc");
    for (let i = 0; i < hN; i++) node(xHid, hidY[i], Math.max(6, Math.min(11, 90 / hN)), "", "#a78bfa");
    node(xOut, outY, 15, "ŷ", "#34d399");

    ctx.fillStyle = COL.txt;
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText("entrada", xIn, 22);
    ctx.fillText("oculta · H=" + hN, xHid, 22);
    ctx.fillText("salida", xOut, 22);
    ctx.textAlign = "left";
    ctx.fillStyle = "#3d566f";
    ctx.fillText("azul: peso positivo   ·   rojo: peso negativo   ·   grosor: |w|", 12, h - 8);
  }

  function drawLoss() {
    if (!loss2d) return;
    const { ctx, w, h } = loss2d;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#05080d";
    ctx.fillRect(0, 0, w, h);

    const padL = 40;
    const padB = 22;
    const padT = 14;
    const plotW = w - padL - 12;
    const plotH = h - padB - padT;

    const hist = S.history;
    const finite = hist.filter((v) => isFinite(v));
    const maxV = Math.max(0.75, finite.length ? Math.max.apply(null, finite) : 0.75);

    const yOf = (v) => padT + plotH - (Math.min(v, maxV) / maxV) * plotH;

    // Banda de homeostasis (pérdida baja sostenida)
    ctx.fillStyle = "rgba(52,211,153,.07)";
    ctx.fillRect(padL, yOf(0.3), plotW, padT + plotH - yOf(0.3));
    ctx.fillStyle = "rgba(52,211,153,.55)";
    ctx.font = "9px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText("banda de homeostasis", padL + 6, yOf(0.3) + 12);

    // Ejes
    ctx.strokeStyle = COL.axis;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, padT + plotH);
    ctx.lineTo(padL + plotW, padT + plotH);
    ctx.stroke();

    ctx.fillStyle = COL.txt;
    ctx.font = "9px 'JetBrains Mono', monospace";
    ctx.textAlign = "right";
    ctx.fillText(nf(maxV, 2), padL - 6, padT + 8);
    ctx.fillText("0", padL - 6, padT + plotH + 3);
    ctx.textAlign = "left";
    ctx.fillText("entropía cruzada / época", padL + 6, padT - 4);

    if (hist.length > 1) {
      const step = plotW / Math.max(1, hist.length - 1);

      // Marcas de choque entrópico
      S.marks.forEach((m) => {
        if (m >= hist.length) return;
        const x = padL + m * step;
        ctx.strokeStyle = "rgba(251,113,133,.55)";
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.moveTo(x, padT);
        ctx.lineTo(x, padT + plotH);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      ctx.beginPath();
      hist.forEach((v, i) => {
        const x = padL + i * step;
        const y = isFinite(v) ? yOf(v) : padT;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = COL.cyan;
      ctx.lineWidth = 1.8;
      ctx.stroke();

      ctx.lineTo(padL + plotW, padT + plotH);
      ctx.lineTo(padL, padT + plotH);
      ctx.closePath();
      ctx.fillStyle = "rgba(34,211,238,.09)";
      ctx.fill();
    } else {
      ctx.fillStyle = "#3d566f";
      ctx.textAlign = "center";
      ctx.fillText("sin datos · inicia el lazo", padL + plotW / 2, padT + plotH / 2);
    }
  }

  /* =====================================================================
     Métricas y estado sistémico
     ===================================================================== */
  const stateText = {
    idle: "en reposo",
    ajustando: "corrigiendo error",
    homeostasis: "homeostasis",
    perturbado: "perturbado · recuperando",
    abierto: "lazo abierto · sin corrección",
    atrapado: "estancado · variedad insuficiente",
    divergente: "divergente · ganancia excesiva",
  };

  function setState(k) {
    if (S.state === k) return;
    S.state = k;
    const badge = $("sim-state");
    const txt = $("sim-state-text");
    if (badge) badge.setAttribute("data-state", k);
    if (txt) txt.textContent = stateText[k] || k;
  }

  function classify() {
    if (!isFinite(S.loss) || S.loss > DIVERGE) return setState("divergente");
    if (!S.feedback) return setState("abierto");
    if (S.shockAt >= 0 && S.epoch - S.shockAt < 400 && S.loss > S.shockLoss * 1.25) {
      return setState("perturbado");
    }
    if (S.loss <= 0.3) return setState("homeostasis");
    if (S.grad < 0.0012 && S.loss > 0.42) return setState("atrapado");
    return setState("ajustando");
  }

  function updateMetrics() {
    const e = $("m-epoch");
    const l = $("m-loss");
    const a = $("m-acc");
    const g = $("m-grad");
    if (e) e.textContent = String(S.epoch);
    if (l) l.textContent = isFinite(S.loss) ? nf(S.loss, 4) : "∞";
    if (a) a.textContent = nf(S.acc * 100, 1) + " %";
    if (g) g.textContent = isFinite(S.grad) ? nf(S.grad, 5) : "∞";
  }

  /* =====================================================================
     Ciclo de vida
     ===================================================================== */
  function rebuildData(keepNet, quiet) {
    S.data = makeData(S.dataset, S.sigma);
    if (!keepNet) {
      S.net = makeNet(S.hidden);
      S.epoch = 0;
      S.history = [];
      S.marks = [];
      S.loss = NaN;
      S.acc = 0;
      S.grad = 0;
      S.reachedHomeostasis = false;
      S.shockAt = -1;
      S.stallWarned = false;
      S.divergedWarned = false;
      setState("idle");
    }
    const m = trainEpoch(S.net, S.data, 0, false);
    S.loss = m.loss;
    S.acc = m.acc;
    S.grad = m.grad;
    if (!quiet) {
      log(
        "info",
        "sistema reiniciado · entorno=" + S.dataset + " H=" + S.hidden + " η=" + nf(S.lr, 3) + " σ=" + nf(S.sigma, 2)
      );
    }
    render(true);
    updateMetrics();
  }

  function render(full) {
    if (full || S.frame % 3 === 0) {
      drawBoundary();
      drawPoints();
    }
    drawNet();
    drawLoss();
  }

  const EPOCHS_PER_FRAME = 6;

  function tick() {
    if (!S.running) return;
    S.frame++;

    for (let k = 0; k < EPOCHS_PER_FRAME; k++) {
      const m = trainEpoch(S.net, S.data, S.lr, S.feedback);
      S.epoch++;
      S.loss = m.loss;
      S.acc = m.acc;
      S.grad = m.grad;
      S.history.push(m.loss);
      if (S.history.length > 900) {
        S.history.shift();
        S.marks = S.marks.map((x) => x - 1).filter((x) => x >= 0);
      }
      if (!isFinite(m.loss)) break;
    }

    /* Eventos narrados en clave sistémica */
    if (!isFinite(S.loss)) {
      log("err", "desbordamiento numérico: el lazo se rompió con η=" + nf(S.lr, 2) + " · reinicia el sistema");
      S.running = false;
      syncToggle();
    } else if (!S.divergedWarned && S.loss > DIVERGE && S.feedback) {
      S.divergedWarned = true;
      log(
        "err",
        "inestabilidad: con η=" + nf(S.lr, 2) + " el actuador sobrecorrige y amplifica el error " +
          "(pérdida " + nf(S.loss, 3) + " > ln 2). Baja la ganancia del lazo."
      );
    } else if (S.divergedWarned && S.loss < 0.6) {
      S.divergedWarned = false;
    }
    if (isFinite(S.loss) && !S.reachedHomeostasis && S.loss <= 0.3 && S.feedback) {
      S.reachedHomeostasis = true;
      log("ok", "negentropía alcanzada · pérdida " + nf(S.loss, 4) + " · exactitud " + nf(S.acc * 100, 1) + " %");
    }
    if (
      S.shockAt >= 0 &&
      S.reachedHomeostasis &&
      S.feedback &&
      S.loss <= S.shockLoss * 1.05 &&
      S.epoch - S.shockAt > 12
    ) {
      log("ok", "homeostasis restaurada en " + (S.epoch - S.shockAt) + " épocas");
      S.shockAt = -1;
    }
    if (
      !S.stallWarned &&
      S.feedback &&
      S.epoch > 900 &&
      S.grad < 0.0012 &&
      S.loss > 0.42
    ) {
      S.stallWarned = true;
      log(
        "warn",
        "estancamiento: el regulador (H=" + S.hidden + ") no genera la variedad que exige el entorno «" + S.dataset + "»"
      );
    }

    classify();
    updateMetrics();
    render(false);
    window.requestAnimationFrame(tick);
  }

  function syncToggle() {
    const b = $("sim-toggle");
    const t = $("sim-toggle-text");
    if (!b) return;
    const icon = b.querySelector("i");
    if (t) t.textContent = S.running ? "Pausar" : "Iniciar";
    if (icon) icon.className = S.running ? "fa-solid fa-pause" : "fa-solid fa-play";
  }

  function start() {
    if (S.running) return;
    if (!isFinite(S.loss)) rebuildData(false, true);
    S.running = true;
    syncToggle();
    window.requestAnimationFrame(tick);
  }

  function stop() {
    S.running = false;
    syncToggle();
  }

  /* =====================================================================
     Controles
     ===================================================================== */
  /* Escala logarítmica: 0,005 → 50. Con momento (β=0,9) el paso efectivo es
     ~10× η, de modo que el extremo superior desestabiliza el lazo a propósito:
     el experimento de "ganancia excesiva" tiene que poder reproducirse. */
  const lrFromSlider = (v) => 0.005 * Math.pow(10000, v / 100);

  function bind() {
    const toggle = $("sim-toggle");
    if (toggle) toggle.addEventListener("click", () => (S.running ? stop() : start()));

    const step = $("sim-step");
    if (step) {
      step.addEventListener("click", () => {
        stop();
        const m = trainEpoch(S.net, S.data, S.lr, S.feedback);
        S.epoch++;
        S.loss = m.loss;
        S.acc = m.acc;
        S.grad = m.grad;
        S.history.push(m.loss);
        classify();
        updateMetrics();
        render(true);
      });
    }

    const reset = $("sim-reset");
    if (reset) {
      reset.addEventListener("click", () => {
        stop();
        rnd = mulberry32(Math.floor(Date.now() % 2147483647));
        rebuildData(false);
      });
    }

    const ds = $("sim-dataset");
    if (ds) {
      ds.addEventListener("change", () => {
        S.dataset = ds.value;
        stop();
        rebuildData(false, true);
        log("info", "nuevo entorno cargado: «" + S.dataset + "»");
      });
    }

    const hid = $("sim-hidden");
    if (hid) {
      hid.addEventListener("input", () => {
        S.hidden = parseInt(hid.value, 10);
        const out = $("v-hidden");
        if (out) out.textContent = String(S.hidden);
      });
      hid.addEventListener("change", () => {
        const wasRunning = S.running;
        stop();
        rebuildData(false, true);
        log("info", "variedad del regulador ajustada a H=" + S.hidden + " (topología reconstruida)");
        if (wasRunning) start();
      });
    }

    const lr = $("sim-lr");
    if (lr) {
      const apply = () => {
        S.lr = lrFromSlider(parseFloat(lr.value));
        const out = $("v-lr");
        if (out) out.textContent = nf(S.lr, S.lr < 0.1 ? 3 : 2);
      };
      lr.addEventListener("input", apply);
      apply();
    }

    const noise = $("sim-noise");
    if (noise) {
      const label = () => {
        const out = $("v-noise");
        if (out) out.textContent = nf(S.sigma, 2);
      };
      noise.addEventListener("input", () => {
        S.sigma = parseFloat(noise.value) / 100;
        label();
      });
      noise.addEventListener("change", () => {
        rebuildData(true, true); // el entorno cambia; la planta se conserva
        log("warn", "el entorno cambió (σ=" + nf(S.sigma, 2) + ") · el sistema debe readaptarse");
      });
      label();
    }

    const fb = $("sim-feedback");
    if (fb) {
      fb.addEventListener("change", () => {
        S.feedback = fb.checked;
        if (S.feedback) log("ok", "lazo cerrado: la corrección de error vuelve a estar activa");
        else log("err", "lazo abierto: el sistema deja de corregirse; toda perturbación será permanente");
        classify();
      });
    }

    const shock = $("sim-shock");
    if (shock) {
      shock.addEventListener("click", () => {
        if (!S.net) return;
        const before = S.loss;
        const sd = 0.9;
        for (let i = 0; i < S.net.h; i++) {
          S.net.W1[i][0] += gauss() * sd;
          S.net.W1[i][1] += gauss() * sd;
          S.net.b1[i] += gauss() * sd * 0.5;
          S.net.W2[i] += gauss() * sd;
        }
        S.net.b2 += gauss() * sd * 0.5;

        const m = trainEpoch(S.net, S.data, 0, false);
        S.loss = m.loss;
        S.acc = m.acc;
        S.grad = m.grad;
        S.history.push(m.loss);
        S.marks.push(S.history.length - 1);
        S.shockAt = S.epoch;
        S.shockLoss = isFinite(before) ? before : m.loss;

        log(
          "warn",
          "choque entrópico Δw ~ N(0; " + nf(sd, 1) + ") · pérdida " + nf(S.shockLoss, 4) + " → " + nf(m.loss, 4) +
            (S.feedback ? " · el lazo intentará recuperar el equilibrio" : " · sin lazo, el daño es permanente")
        );
        classify();
        updateMetrics();
        render(true);
      });
    }
  }

  /* =====================================================================
     Arranque
     ===================================================================== */
  bind();
  rebuildData(false, true);
  log("info", "caja de arena lista · 2 → " + S.hidden + " → 1 · tanh + sigmoide · entropía cruzada binaria");
  log("info", "pulsa «Iniciar» para cerrar el lazo de retroalimentación");

  /* Redibuja al cambiar el tamaño para conservar nitidez en pantallas densas. */
  let rt = null;
  window.addEventListener("resize", () => {
    if (rt) window.clearTimeout(rt);
    rt = window.setTimeout(() => render(true), 180);
  });
})();
