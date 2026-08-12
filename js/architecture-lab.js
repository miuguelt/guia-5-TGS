/* =========================================================================
   Guía 5 · TGS → Arquitectura → IA
   architecture-lab.js — micro-reto de transferencia.

   Ocho zonas, cada una con una función sistémica. El aprendiz coloca el
   componente que cumple esa función (arrastrando, o seleccionando y
   pulsando la zona). Los señuelos no son "respuestas incorrectas" a secas:
   cada uno viola un principio concreto y la evaluación lo nombra.
   ========================================================================= */
(function () {
  "use strict";

  const C = window.TGS_CONTENT || {};
  const SLOTS = C.labSlots || [];
  const PIECES = C.labPieces || [];
  const PRINCIPLES = C.labPrinciples || [];

  const board = document.getElementById("lab-board");
  const tray = document.getElementById("lab-pieces");
  if (!board || !tray || !SLOTS.length) return;

  const barsBox = document.getElementById("lab-bars");
  const verdictBox = document.getElementById("lab-verdict");
  const scoreOut = document.getElementById("lab-score");
  const progressOut = document.getElementById("lab-progress");
  const output = document.getElementById("lab-output");
  const store = window.TGS_STORE;

  const byId = (list, id) => list.find((x) => x.id === id);
  const esc = (s) =>
    String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  /* Estado: { slotId: pieceId } */
  let placed = {};
  let selected = null;

  if (store) {
    const saved = store.read().lab;
    if (saved && typeof saved === "object") placed = saved;
  }

  /* =====================================================================
     Construcción del tablero
     ===================================================================== */
  function buildTray() {
    tray.innerHTML = "";
    PIECES.forEach((p) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "piece";
      b.draggable = true;
      b.dataset.piece = p.id;
      b.setAttribute("aria-pressed", "false");
      b.innerHTML =
        '<span class="p-ico" aria-hidden="true"><i class="fa-solid ' + esc(p.icon) + '"></i></span>' +
        '<span><span class="p-name">' + esc(p.name) + "</span>" +
        '<span class="p-kind">' + esc(p.kind) + "</span></span>";

      b.addEventListener("click", () => selectPiece(p.id));
      b.addEventListener("dragstart", (e) => {
        selectPiece(p.id);
        if (e.dataTransfer) {
          e.dataTransfer.setData("text/plain", p.id);
          e.dataTransfer.effectAllowed = "move";
        }
      });
      tray.appendChild(b);
    });
  }

  function buildBoard() {
    board.innerHTML = "";
    SLOTS.forEach((s) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "slot";
      b.dataset.slot = s.id;
      b.innerHTML =
        '<span class="s-zone">' + esc(s.zone) + "</span>" +
        '<span class="s-ask">' + esc(s.ask) + "</span>" +
        '<span class="s-why">' + esc(s.why) + "</span>" +
        '<span class="s-fill" hidden></span>' +
        '<span class="s-verdict" hidden></span>';

      b.addEventListener("click", () => onSlotClick(s.id));
      b.addEventListener("dragover", (e) => {
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
        b.dataset.over = "true";
      });
      b.addEventListener("dragleave", () => delete b.dataset.over);
      b.addEventListener("drop", (e) => {
        e.preventDefault();
        delete b.dataset.over;
        const id = e.dataTransfer ? e.dataTransfer.getData("text/plain") : selected;
        if (id) place(s.id, id);
      });
      board.appendChild(b);
    });
  }

  /* =====================================================================
     Interacción
     ===================================================================== */
  function selectPiece(id) {
    selected = selected === id ? null : id;
    tray.querySelectorAll(".piece").forEach((el) => {
      el.setAttribute("aria-pressed", String(el.dataset.piece === selected));
    });
  }

  function onSlotClick(slotId) {
    if (selected) {
      place(slotId, selected);
      return;
    }
    if (placed[slotId]) {
      delete placed[slotId];
      persist();
      paint();
    }
  }

  function place(slotId, pieceId) {
    if (!byId(PIECES, pieceId)) return;
    // Una pieza sólo puede ocupar una zona: se libera su posición anterior.
    Object.keys(placed).forEach((k) => {
      if (placed[k] === pieceId) delete placed[k];
    });
    placed[slotId] = pieceId;
    selected = null;
    persist();
    paint();
  }

  function persist() {
    if (store) store.write({ lab: placed });
  }

  /* =====================================================================
     Evaluación
     ===================================================================== */
  function judge(slot) {
    const pieceId = placed[slot.id];
    if (!pieceId) return null;
    const piece = byId(PIECES, pieceId);
    if (!piece) return null;

    if (pieceId === slot.accepts) {
      return { ok: true, piece, text: slot.ok };
    }
    if (piece.trap) {
      return { ok: false, piece, text: "Violación sistémica. " + piece.trap };
    }
    return {
      ok: false,
      piece,
      text:
        "Función equivocada: «" + piece.name + "» opera como " + piece.kind +
        ", no cumple el papel que esta zona necesita. Vuelve a leer la pregunta en clave de sistemas.",
    };
  }

  function scores() {
    const acc = {};
    PRINCIPLES.forEach((p) => (acc[p.id] = { ok: 0, total: 0 }));
    SLOTS.forEach((s) => {
      if (!acc[s.principle]) acc[s.principle] = { ok: 0, total: 0 };
      acc[s.principle].total++;
      const v = judge(s);
      if (v && v.ok) acc[s.principle].ok++;
    });
    return acc;
  }

  /* =====================================================================
     Pintado
     ===================================================================== */
  function paint() {
    let filled = 0;
    let correct = 0;

    SLOTS.forEach((s) => {
      const el = board.querySelector('.slot[data-slot="' + s.id + '"]');
      if (!el) return;
      const fill = el.querySelector(".s-fill");
      const why = el.querySelector(".s-verdict");
      const v = judge(s);

      if (!v) {
        delete el.dataset.verdict;
        fill.hidden = true;
        why.hidden = true;
        fill.innerHTML = "";
        why.textContent = "";
        return;
      }

      filled++;
      if (v.ok) correct++;
      el.dataset.verdict = v.ok ? "ok" : "bad";
      fill.hidden = false;
      fill.innerHTML =
        '<i class="fa-solid ' + (v.ok ? "fa-circle-check" : "fa-circle-xmark") + '" aria-hidden="true"></i>' +
        "<span>" + esc(v.piece.name) + "</span>";
      why.hidden = false;
      why.textContent = v.text;
    });

    tray.querySelectorAll(".piece").forEach((el) => {
      const used = Object.keys(placed).some((k) => placed[k] === el.dataset.piece);
      el.dataset.used = String(used);
    });

    if (progressOut) progressOut.textContent = filled + " / " + SLOTS.length + " zonas";
    if (scoreOut) scoreOut.textContent = correct + " / " + SLOTS.length + " correctas";

    paintBars();
    paintVerdict(filled, correct);
  }

  function paintBars() {
    if (!barsBox) return;
    const acc = scores();
    barsBox.innerHTML = PRINCIPLES.map((p) => {
      const a = acc[p.id] || { ok: 0, total: 0 };
      const pct = a.total ? Math.round((a.ok / a.total) * 100) : 0;
      return (
        '<div class="bar-row">' +
        '<div class="bar-head"><span>' + esc(p.name) + "</span><span>" + pct + " %</span></div>" +
        '<div class="bar"><div class="bar-fill" data-low="' + String(pct < 60) + '" style="width:' + pct + '%"></div></div>' +
        "</div>"
      );
    }).join("");
  }

  function paintVerdict(filled, correct) {
    if (!verdictBox) return;

    if (filled < SLOTS.length) {
      verdictBox.innerHTML =
        '<p class="mono mute" style="font-size:.78rem;margin:0">// faltan ' +
        (SLOTS.length - filled) +
        " zona(s) por resolver. La evaluación completa aparece al cerrar el diseño.</p>";
      return;
    }

    const errores = SLOTS.map(judge).filter((v) => v && !v.ok);
    let head;
    let cls;

    if (correct === SLOTS.length) {
      cls = "callout";
      head =
        "Arquitectura sistémicamente coherente. Frontera explícita, acoplamiento por contrato, lazo homeostático cerrado y la salida probabilística contenida antes de tocar el estado autoritativo.";
    } else if (correct >= SLOTS.length - 2) {
      cls = "callout callout--law";
      head =
        "Diseño cercano. Las zonas fallidas no son detalles: cada una desactiva un principio completo. Corrígelas y vuelve a evaluar.";
    } else {
      cls = "callout callout--warn";
      head =
        "El diseño todavía razona por herramientas, no por funciones sistémicas. Antes de elegir un componente, pregunta qué papel cumple en el lazo: frontera, sensor, actuador, amortiguador o regulador de variedad.";
    }

    verdictBox.innerHTML =
      '<div class="' + cls + '" style="margin:0">' +
      '<p class="callout-title"><i class="fa-solid fa-clipboard-check" aria-hidden="true"></i> Evaluación · ' +
      correct + " de " + SLOTS.length + "</p>" +
      "<p" + (errores.length ? "" : ' style="margin-bottom:0"') + ">" + esc(head) + "</p>" +
      (errores.length
        ? "<ul style='margin-bottom:0'>" +
          errores.map((e) => "<li>" + esc(e.piece.name) + " — " + esc(e.text) + "</li>").join("") +
          "</ul>"
        : "") +
      "</div>";
  }

  /* =====================================================================
     Acta de diseño exportable
     ===================================================================== */
  function buildActa() {
    const acc = scores();
    const correct = SLOTS.filter((s) => {
      const v = judge(s);
      return v && v.ok;
    }).length;

    let fecha;
    try {
      fecha = new Date().toLocaleString("es-CO", { dateStyle: "long", timeStyle: "short" });
    } catch (_) {
      fecha = new Date().toISOString();
    }

    const L = [];
    L.push("ACTA DE DISEÑO SISTÉMICO");
    L.push("Guía 5 · Teoría General de Sistemas → Arquitectura → IA");
    L.push("Generada localmente el " + fecha);
    L.push("=".repeat(72));
    L.push("");
    L.push("1. ASIGNACIÓN POR ZONA");
    L.push("");

    SLOTS.forEach((s) => {
      const v = judge(s);
      L.push("  " + s.zone);
      L.push("    Pregunta sistémica : " + s.ask);
      L.push("    Componente         : " + (v ? v.piece.name : "(sin asignar)"));
      L.push("    Veredicto          : " + (v ? (v.ok ? "CORRECTO" : "REVISAR") : "PENDIENTE"));
      if (v) L.push("    Lectura            : " + v.text);
      L.push("");
    });

    L.push("2. EVALUACIÓN POR PRINCIPIO");
    L.push("");
    PRINCIPLES.forEach((p) => {
      const a = acc[p.id] || { ok: 0, total: 0 };
      const pct = a.total ? Math.round((a.ok / a.total) * 100) : 0;
      const pad = (p.name + " ").padEnd(34, ".");
      L.push("  " + pad + " " + String(pct).padStart(3) + " %   (" + a.ok + "/" + a.total + ")");
    });
    L.push("");
    L.push("  TOTAL: " + correct + " de " + SLOTS.length + " zonas resueltas correctamente.");
    L.push("");
    L.push("3. PREGUNTAS PARA LLEVAR AL PROYECTO REAL");
    L.push("");
    L.push("  a. ¿Dónde está la frontera del sistema y qué política aplica en ella?");
    L.push("  b. ¿Qué sensor mide la desviación y contra qué punto de consigna (SLO) se compara?");
    L.push("  c. ¿Qué actuador corrige sin intervención humana y con qué límites?");
    L.push("  d. ¿Qué abre el lazo cuando la corrección empeora la situación?");
    L.push("  e. ¿Qué verifica la salida del subsistema probabilístico antes de que toque el estado?");
    L.push("  f. ¿El regulador tiene tanta variedad como perturbaciones puede presentar el entorno?");
    L.push("");
    L.push("-".repeat(72));
    L.push("Documento formativo. La valoración del aprendizaje corresponde al instructor.");

    return L.join("\n");
  }

  /* =====================================================================
     Botones auxiliares
     ===================================================================== */
  const exportBtn = document.getElementById("lab-export");
  if (exportBtn && output) {
    exportBtn.addEventListener("click", () => {
      output.value = buildActa();
      output.focus();
      output.setSelectionRange(0, 0);
    });
  }

  const copyBtn = document.getElementById("lab-copy");
  if (copyBtn && output) {
    copyBtn.addEventListener("click", () => {
      if (!output.value) output.value = buildActa();
      const done = (ok) => {
        const label = copyBtn.querySelector("i");
        if (label) label.className = ok ? "fa-solid fa-check" : "fa-solid fa-xmark";
        window.setTimeout(() => {
          if (label) label.className = "fa-regular fa-copy";
        }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(output.value).then(
          () => done(true),
          () => done(false)
        );
      } else {
        output.select();
        try {
          done(document.execCommand("copy"));
        } catch (_) {
          done(false);
        }
      }
    });
  }

  const resetBtn = document.getElementById("lab-reset");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      placed = {};
      selected = null;
      if (output) output.value = "";
      persist();
      buildTray();
      paint();
    });
  }

  /* =====================================================================
     Arranque
     ===================================================================== */
  buildTray();
  buildBoard();
  paint();
})();
