/* =========================================================================
   Guía 5 · TGS → Arquitectura → IA
   evolution-map.js — infografía generativa que mapea, en paralelo, las tres
   olas de la TGS con las eras de la arquitectura de software.
   El SVG se construye por completo desde los datos de content.js.
   ========================================================================= */
(function () {
  "use strict";

  const C = window.TGS_CONTENT || {};
  const eras = C.eras || [];
  const host = document.getElementById("map-host");
  const detail = document.getElementById("map-detail");
  if (!host || !eras.length) return;

  const NS = "http://www.w3.org/2000/svg";

  const WAVES = {
    w1: { color: "#fbbf24", label: "OLA 1 · sistema cerrado y control", soft: "#1c1608" },
    w2: { color: "#22d3ee", label: "OLA 2 · sistema abierto y homeostasis", soft: "#06212a" },
    w3: { color: "#a78bfa", label: "OLA 3 · complejidad y autoorganización", soft: "#160f2b" },
  };
  const WAVE_NAME = { w1: "Ola 1", w2: "Ola 2", w3: "Ola 3" };

  /* ---------------------------------------------------------------------
     Geometría
     --------------------------------------------------------------------- */
  const PAD = 34;
  const W = 1240;
  const H = 470;
  const SLOT = (W - PAD * 2) / eras.length;
  const NODE_W = Math.min(168, SLOT - 14);
  const NODE_H = 104;
  const NODE_Y = 258;
  const BAND_Y = 74;
  const BAND_H = 74;

  const el = (name, attrs, text) => {
    const node = document.createElementNS(NS, name);
    Object.keys(attrs || {}).forEach((k) => node.setAttribute(k, attrs[k]));
    if (text !== undefined) node.textContent = text;
    return node;
  };

  /* Divide un texto en líneas de longitud máxima aproximada. */
  function wrap(text, max) {
    const words = String(text).split(/\s+/);
    const lines = [];
    let line = "";
    words.forEach((w) => {
      if ((line + " " + w).trim().length > max && line) {
        lines.push(line);
        line = w;
      } else {
        line = (line + " " + w).trim();
      }
    });
    if (line) lines.push(line);
    return lines;
  }

  const slotX = (i) => PAD + i * SLOT + (SLOT - NODE_W) / 2;

  /* ---------------------------------------------------------------------
     Construcción del SVG
     --------------------------------------------------------------------- */
  const svg = el("svg", {
    viewBox: `0 0 ${W} ${H}`,
    width: W,
    height: H,
    role: "group",
    "aria-label": "Mapa evolutivo: olas de la Teoría General de Sistemas y eras de la arquitectura de software",
  });

  const defs = el("defs");
  defs.appendChild(
    (function arrow() {
      const m = el("marker", {
        id: "tgs-arrow",
        viewBox: "0 0 10 10",
        refX: "9",
        refY: "5",
        markerWidth: "6",
        markerHeight: "6",
        orient: "auto-start-reverse",
      });
      m.appendChild(el("path", { d: "M 0 0 L 10 5 L 0 10 z", fill: "#334b63" }));
      return m;
    })()
  );
  svg.appendChild(defs);

  /* Rótulos de carril */
  svg.appendChild(
    el(
      "text",
      { x: PAD, y: 34, fill: "#64768c", "font-family": "JetBrains Mono, monospace", "font-size": "13", "letter-spacing": "2" },
      "TEORÍA · OLAS DE LA TGS"
    )
  );
  svg.appendChild(
    el(
      "text",
      { x: PAD, y: 232, fill: "#64768c", "font-family": "JetBrains Mono, monospace", "font-size": "13", "letter-spacing": "2" },
      "INGENIERÍA · ERAS DE LA ARQUITECTURA DE SOFTWARE"
    )
  );

  /* Bandas de ola: se agrupan eras consecutivas de la misma ola */
  const groups = [];
  eras.forEach((e, i) => {
    const last = groups[groups.length - 1];
    if (last && last.wave === e.wave) last.end = i;
    else groups.push({ wave: e.wave, start: i, end: i });
  });

  groups.forEach((g) => {
    const meta = WAVES[g.wave] || WAVES.w1;
    const x = PAD + g.start * SLOT + 4;
    const w = (g.end - g.start + 1) * SLOT - 8;

    svg.appendChild(
      el("rect", {
        x,
        y: BAND_Y,
        width: w,
        height: BAND_H,
        rx: 12,
        fill: meta.soft,
        stroke: meta.color,
        "stroke-width": "1.5",
      })
    );

    const lines = wrap(meta.label, Math.max(18, Math.floor(w / 8.2)));
    lines.forEach((ln, k) => {
      svg.appendChild(
        el(
          "text",
          {
            x: x + w / 2,
            y: BAND_Y + BAND_H / 2 - (lines.length - 1) * 9 + k * 18 + 5,
            fill: meta.color,
            "text-anchor": "middle",
            "font-family": "JetBrains Mono, monospace",
            "font-size": "13.5",
            "font-weight": "600",
          },
          ln
        )
      );
    });
  });

  /* Conectores teoría → ingeniería */
  eras.forEach((e, i) => {
    const meta = WAVES[e.wave] || WAVES.w1;
    const cx = slotX(i) + NODE_W / 2;
    svg.appendChild(
      el("path", {
        d: `M ${cx} ${BAND_Y + BAND_H} C ${cx} ${BAND_Y + BAND_H + 60}, ${cx} ${NODE_Y - 60}, ${cx} ${NODE_Y}`,
        stroke: meta.color,
        "stroke-width": "1.2",
        "stroke-dasharray": "4 5",
        fill: "none",
        opacity: "0.55",
      })
    );
  });

  /* Eje temporal */
  svg.appendChild(
    el("line", {
      x1: PAD,
      y1: NODE_Y + NODE_H + 58,
      x2: W - PAD,
      y2: NODE_Y + NODE_H + 58,
      stroke: "#334b63",
      "stroke-width": "1.4",
      "marker-end": "url(#tgs-arrow)",
    })
  );
  svg.appendChild(
    el(
      "text",
      {
        x: W - PAD,
        y: NODE_Y + NODE_H + 80,
        fill: "#64768c",
        "text-anchor": "end",
        "font-family": "JetBrains Mono, monospace",
        "font-size": "12",
      },
      "tiempo →"
    )
  );

  /* Nodos de era */
  const nodes = [];
  eras.forEach((e, i) => {
    const meta = WAVES[e.wave] || WAVES.w1;
    const x = slotX(i);

    const g = el("g", {
      class: "era-node",
      tabindex: "0",
      role: "button",
      "data-era": e.id,
      "data-index": String(i),
      "aria-label": `${e.title}, ${e.years}. Pulsa para ver el detalle sistémico.`,
    });

    g.appendChild(
      el("rect", {
        x,
        y: NODE_Y,
        width: NODE_W,
        height: NODE_H,
        rx: 10,
        fill: "#0b1119",
        stroke: "#243447",
        "stroke-width": "1.4",
      })
    );
    g.appendChild(
      el("rect", { x, y: NODE_Y, width: NODE_W, height: 3, rx: 1.5, fill: meta.color })
    );

    const titleLines = wrap(e.title, 17).slice(0, 3);
    titleLines.forEach((ln, k) => {
      g.appendChild(
        el(
          "text",
          {
            x: x + NODE_W / 2,
            y: NODE_Y + 32 + k * 17,
            fill: "#dce6f2",
            "text-anchor": "middle",
            "font-family": "Inter, system-ui, sans-serif",
            "font-size": "13.5",
            "font-weight": "650",
          },
          ln
        )
      );
    });

    g.appendChild(
      el(
        "text",
        {
          x: x + NODE_W / 2,
          y: NODE_Y + NODE_H - 30,
          fill: meta.color,
          "text-anchor": "middle",
          "font-family": "JetBrains Mono, monospace",
          "font-size": "11.5",
        },
        e.short
      )
    );
    g.appendChild(
      el(
        "text",
        {
          x: x + NODE_W / 2,
          y: NODE_Y + NODE_H - 12,
          fill: "#64768c",
          "text-anchor": "middle",
          "font-family": "JetBrains Mono, monospace",
          "font-size": "11",
        },
        e.years
      )
    );

    /* Flecha de sucesión entre eras */
    if (i < eras.length - 1) {
      const x2 = slotX(i + 1);
      svg.appendChild(
        el("line", {
          x1: x + NODE_W,
          y1: NODE_Y + NODE_H / 2,
          x2: x2 - 2,
          y2: NODE_Y + NODE_H / 2,
          stroke: "#243447",
          "stroke-width": "1.3",
          "marker-end": "url(#tgs-arrow)",
        })
      );
    }

    svg.appendChild(g);
    nodes.push(g);
  });

  host.appendChild(svg);

  /* ---------------------------------------------------------------------
     Panel de detalle
     --------------------------------------------------------------------- */
  const esc = (s) =>
    String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  function render(i) {
    const e = eras[i];
    if (!e || !detail) return;
    nodes.forEach((n, k) => n.setAttribute("data-active", String(k === i)));

    detail.innerHTML = [
      '<div class="panel">',
      '  <div class="panel-bar">',
      '    <span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>',
      '    <span class="panel-title mono">eras/' + esc(e.id) + ".md</span>",
      '    <span class="spacer"></span>',
      '    <span class="chip chip--' + esc(e.wave) + '">' + esc(WAVE_NAME[e.wave] || "") + "</span>",
      "  </div>",
      '  <div class="panel-body">',
      '    <p class="mono" style="color:var(--txt-mute);font-size:.74rem;letter-spacing:.08em;margin:0 0 .3rem">' +
        esc(e.years) +
        "</p>",
      '    <h3 style="font-size:1.25rem;margin-bottom:.9rem">' + esc(e.title) + "</h3>",
      '    <div class="grid g2">',
      "      <dl style='margin:0'>",
      '        <div class="kv"><dt>Principio arquitectónico</dt><dd>' + esc(e.principle) + "</dd></div>",
      '        <div class="kv"><dt>Lectura sistémica</dt><dd>' + esc(e.tgs) + "</dd></div>",
      '        <div class="kv"><dt>Patrón introducido</dt><dd>' + esc(e.pattern) + "</dd></div>",
      "      </dl>",
      "      <div>",
      '        <div class="callout callout--warn" style="margin-top:0">',
      '          <p class="callout-title"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i> Modo de fallo que la hizo insuficiente</p>',
      '          <p style="margin:0">' + esc(e.failure) + "</p>",
      "        </div>",
      '        <div class="callout callout--law" style="margin-bottom:0">',
      '          <p class="callout-title"><i class="fa-solid fa-lightbulb" aria-hidden="true"></i> Lección transferible</p>',
      '          <p style="margin:0">' + esc(e.lesson) + "</p>",
      "        </div>",
      "      </div>",
      "    </div>",
      "  </div>",
      "</div>",
    ].join("");
  }

  let current = 0;
  nodes.forEach((g, i) => {
    g.addEventListener("click", () => {
      current = i;
      render(i);
    });
    g.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        current = i;
        render(i);
        return;
      }
      let next = null;
      if (ev.key === "ArrowRight") next = (i + 1) % nodes.length;
      if (ev.key === "ArrowLeft") next = (i - 1 + nodes.length) % nodes.length;
      if (next === null) return;
      ev.preventDefault();
      current = next;
      nodes[next].focus();
      render(next);
    });
  });
  render(current);

  /* ---------------------------------------------------------------------
     Alternancia de vistas y render diferido de Mermaid
     --------------------------------------------------------------------- */
  const btnTl = document.getElementById("map-view-timeline");
  const btnGr = document.getElementById("map-view-graph");
  const viewTl = document.getElementById("map-timeline");
  const viewGr = document.getElementById("map-graph");
  const mHost = document.getElementById("mermaid-host");
  let mermaidDone = false;

  function show(which) {
    const graph = which === "graph";
    if (viewTl) viewTl.hidden = graph;
    if (viewGr) viewGr.hidden = !graph;
    if (btnTl) btnTl.setAttribute("aria-pressed", String(!graph));
    if (btnGr) btnGr.setAttribute("aria-pressed", String(graph));
    if (graph) drawMermaid();
  }

  function drawMermaid() {
    if (mermaidDone || !mHost) return;
    mermaidDone = true;

    if (!window.mermaid || !C.mermaidDef) {
      mHost.innerHTML =
        '<p class="js-fallback">La librería Mermaid no está disponible (se carga desde una red externa). ' +
        "Usa la vista «Línea evolutiva», que contiene la misma información y funciona sin dependencias.</p>";
      return;
    }

    try {
      window.mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: "dark",
        fontFamily: "JetBrains Mono, monospace",
        flowchart: { curve: "basis", padding: 14, useMaxWidth: false },
        themeVariables: {
          background: "#060a10",
          primaryColor: "#101a24",
          primaryTextColor: "#dce6f2",
          primaryBorderColor: "#243447",
          lineColor: "#3d566f",
          clusterBkg: "#0b1119",
          clusterBorder: "#243447",
          tertiaryColor: "#0b1119",
        },
      });

      const out = window.mermaid.render("tgs-mermaid-graph", C.mermaidDef);
      const place = (svgCode) => {
        mHost.innerHTML = svgCode;
      };
      if (out && typeof out.then === "function") {
        out.then((r) => place(r.svg)).catch(fail);
      } else if (typeof out === "string") {
        place(out);
      } else {
        fail();
      }
    } catch (err) {
      fail(err);
    }

    function fail() {
      mHost.innerHTML =
        '<p class="js-fallback">No se pudo renderizar el grafo. Usa la vista «Línea evolutiva», ' +
        "que contiene la misma información.</p>";
    }
  }

  if (btnTl) btnTl.addEventListener("click", () => show("timeline"));
  if (btnGr) btnGr.addEventListener("click", () => show("graph"));
})();
