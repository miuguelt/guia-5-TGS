/* =========================================================================
   Guía 5 · TGS → Arquitectura → IA
   app.js — cáscara de la aplicación e islas reactivas (Vue 3 global).
   Cada isla se monta por separado; ninguna depende de las demás.
   ========================================================================= */
(function () {
  "use strict";

  const C = window.TGS_CONTENT || {};
  const STORE_KEY = "tgs.guia5.v1";

  /* =====================================================================
     Persistencia local (opcional y tolerante a fallos)
     ===================================================================== */
  const store = {
    read() {
      try {
        return JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
      } catch (_) {
        return {};
      }
    },
    write(patch) {
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(Object.assign(this.read(), patch)));
      } catch (_) {
        /* modo privado o almacenamiento lleno: el progreso simplemente no persiste */
      }
    },
  };
  window.TGS_STORE = store;

  /* =====================================================================
     Utilidades
     ===================================================================== */
  const DIACRITIC = new RegExp("[\u0300-\u036f]", "g");
  const norm = (s) =>
    String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(DIACRITIC, "");

  /* =====================================================================
     Barra de progreso de lectura
     ===================================================================== */
  (function progressBar() {
    const bar = document.getElementById("scroll-progress");
    if (!bar) return;
    let ticking = false;
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const pct = max > 0 ? (doc.scrollTop / max) * 100 : 0;
      bar.style.width = pct.toFixed(2) + "%";
      ticking = false;
    };
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
    update();
  })();

  /* =====================================================================
     Navegación: enlace activo + cajón móvil
     ===================================================================== */
  (function navigation() {
    const toggle = document.getElementById("nav-toggle");
    const drawer = document.getElementById("nav-drawer");

    if (toggle && drawer) {
      toggle.addEventListener("click", () => {
        const open = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!open));
        drawer.hidden = open;
      });
      drawer.addEventListener("click", (e) => {
        if (e.target.closest("a")) {
          toggle.setAttribute("aria-expanded", "false");
          drawer.hidden = true;
        }
      });
    }

    const links = Array.from(document.querySelectorAll(".nav-a[href^='#']"));
    const targets = links
      .map((a) => document.querySelector(a.getAttribute("href")))
      .filter(Boolean);
    if (!targets.length || !("IntersectionObserver" in window)) return;

    const setActive = (id) => {
      links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + id));
    };

    const seen = new Map();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => seen.set(en.target.id, en.intersectionRatio));
        let best = null;
        let bestRatio = 0;
        seen.forEach((ratio, id) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            best = id;
          }
        });
        if (best) setActive(best);
      },
      { rootMargin: "-25% 0px -55% 0px", threshold: [0, 0.15, 0.4, 0.75, 1] }
    );
    targets.forEach((t) => io.observe(t));
  })();

  /* =====================================================================
     Islas Vue
     ===================================================================== */
  const Vue = window.Vue;

  if (!Vue) {
    // Sin Vue no hay islas: se libera el contenido y se avisa sin romper la guía.
    document.querySelectorAll("[v-cloak]").forEach((el) => {
      el.removeAttribute("v-cloak");
      el.innerHTML =
        '<p class="js-fallback">Este componente interactivo necesita la librería Vue, que se carga ' +
        "desde una red de distribución externa y no está disponible en este momento. El contenido " +
        "teórico de la guía se lee completo sin él.</p>";
    });
    return;
  }

  const waveNames = { w1: "Ola 1 · control", w2: "Ola 2 · sistema abierto", w3: "Ola 3 · complejidad" };

  /* ---------------------------------------------------------------------
     Isla 1 · Diagnóstico de reflexión
     --------------------------------------------------------------------- */
  if (document.getElementById("reflection-app")) {
    Vue.createApp({
      data() {
        return {
          symptoms: C.symptoms || [],
          diagnoses: C.diagnoses || {},
          picked: store.read().symptoms || [],
        };
      },
      computed: {
        results() {
          const keys = [];
          this.picked.forEach((id) => {
            const s = this.symptoms.find((x) => x.id === id);
            if (s && !keys.includes(s.dx)) keys.push(s.dx);
          });
          return keys
            .map((k) => Object.assign({ key: k }, this.diagnoses[k]))
            .filter((d) => d && d.title);
        },
      },
      methods: {
        toggle(id) {
          const i = this.picked.indexOf(id);
          if (i === -1) this.picked.push(id);
          else this.picked.splice(i, 1);
          store.write({ symptoms: this.picked });
        },
        waveName(w) {
          return waveNames[w] || w;
        },
      },
    }).mount("#reflection-app");
  }

  /* ---------------------------------------------------------------------
     Isla 2 · Explorador de las tres olas
     --------------------------------------------------------------------- */
  if (document.getElementById("wave-explorer")) {
    Vue.createApp({
      data() {
        return { waves: C.waves || [], active: 0 };
      },
      computed: {
        current() {
          return this.waves[this.active] || {};
        },
      },
      methods: {
        onKey(e, i) {
          const n = this.waves.length;
          let next = null;
          if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % n;
          if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + n) % n;
          if (e.key === "Home") next = 0;
          if (e.key === "End") next = n - 1;
          if (next === null) return;
          e.preventDefault();
          this.active = next;
          this.$nextTick(() => {
            const el = document.getElementById("tab-" + this.waves[next].id);
            if (el) el.focus();
          });
        },
      },
    }).mount("#wave-explorer");
  }

  /* ---------------------------------------------------------------------
     Isla 3 · Verificación conceptual
     --------------------------------------------------------------------- */
  if (document.getElementById("quiz-app")) {
    const quiz = C.quiz || [];
    Vue.createApp({
      data() {
        const saved = store.read().quiz;
        const valid = Array.isArray(saved) && saved.length === quiz.length;
        return { quiz, answered: valid ? saved : quiz.map(() => null) };
      },
      computed: {
        done() {
          return this.answered.every((a) => a !== null) && this.quiz.length > 0;
        },
        score() {
          return this.answered.reduce((n, a, i) => n + (a === this.quiz[i].a ? 1 : 0), 0);
        },
        feedback() {
          const r = this.quiz.length ? this.score / this.quiz.length : 0;
          if (r === 1)
            return "Modelo mental completo: lees la arquitectura en términos de lazos, fronteras y variedad. Lleva ese vocabulario a tu próxima revisión de diseño.";
          if (r >= 0.75)
            return "Base sólida. Revisa las justificaciones de los ítems fallados: suelen concentrarse en el signo del lazo o en dónde está realmente la frontera.";
          if (r >= 0.5)
            return "Vas a mitad de camino. Vuelve al explorador de olas y al simulador: manipular el lazo fija el concepto mucho más rápido que releerlo.";
          return "Conviene rehacer el recorrido desde la sección de las tres olas. El objetivo no es la puntuación, sino poder nombrar el fallo sistémico cuando lo veas en producción.";
        },
      },
      methods: {
        answer(i, j) {
          if (this.answered[i] !== null) return;
          this.answered[i] = j;
          store.write({ quiz: this.answered });
        },
        verdict(i, j) {
          const a = this.answered[i];
          if (a === null) return "";
          if (j === this.quiz[i].a) return "ok";
          return j === a ? "bad" : "";
        },
        reset() {
          this.answered = this.quiz.map(() => null);
          store.write({ quiz: null });
        },
      },
    }).mount("#quiz-app");
  }

  /* ---------------------------------------------------------------------
     Isla 4 · Glosario filtrable
     --------------------------------------------------------------------- */
  if (document.getElementById("glossary-app")) {
    Vue.createApp({
      data() {
        return { items: C.glossary || [], q: "" };
      },
      computed: {
        filtered() {
          const q = norm(this.q).trim();
          if (!q) return this.items;
          return this.items.filter(
            (g) => norm(g.t).includes(q) || norm(g.e).includes(q) || norm(g.d).includes(q)
          );
        },
      },
    }).mount("#glossary-app");
  }
  /* ---------------------------------------------------------------------
     Isla 5 · Ejercicios Prácticos
     --------------------------------------------------------------------- */
  if (document.getElementById("exercises-app")) {
    const exercises = C.exercises || [];
    Vue.createApp({
      data() {
        const saved = store.read().exercises;
        const valid = Array.isArray(saved) && saved.length === exercises.length;
        return { 
          exercises, 
          answered: valid ? saved : exercises.map(() => null) 
        };
      },
      methods: {
        answer(i, j) {
          // Si ya respondió este ejercicio, no permitimos cambiarlo (o sí, pero para simplificar, no)
          if (this.answered[i] !== null) return;
          this.answered[i] = j;
          store.write({ exercises: this.answered });
        },
        verdict(i, j) {
          const a = this.answered[i];
          if (a === null) return ""; // No ha respondido
          if (j === this.exercises[i].correctIndex) return "ok"; // Esta era la correcta
          if (j === a) return "bad"; // Eligió esta y era incorrecta
          return "";
        },
        reset() {
          this.answered = this.exercises.map(() => null);
          store.write({ exercises: null });
        }
      }
    }).mount("#exercises-app");
  }
})();
