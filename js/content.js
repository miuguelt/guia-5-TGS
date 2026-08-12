/* =========================================================================
   Guía 5 · TGS → Arquitectura → IA (Versión ADSO)
   content.js — modelo de datos único de la guía.
   ========================================================================= */
(function (global) {
  "use strict";

  /* ---------------------------------------------------------------------
     Las tres olas de la TGS
     --------------------------------------------------------------------- */
  const waves = [
    {
      id: "w1",
      code: "OLA 01",
      name: "Sistema cerrado y control",
      sub: "Cibernética clásica · 1940–1965",
      color: "var(--w1)",
      thesis:
        "Un programa hace exactamente lo que tú le dices que haga, paso a paso. Todo es predecible, repetitivo y no hay sorpresas. Funciona como una máquina perfecta aislada del mundo.",
      core: "Control determinista y Retroalimentación: Si conoces las reglas y las entradas, sabes el resultado exacto. Se controla a través de bucles y condicionales.",
      authors:
        "Norbert Wiener (Lazo de Control), W. Ross Ashby.",
      regulates:
        "Se asegura de que el programa siga una ruta específica diseñada por el programador. No admite variaciones externas.",
      analogy:
        "Un script simple, una calculadora, o una macro de Excel. Sabes de antemano todas las posibles opciones y errores que puede cometer el usuario.",
      failure:
        "Fragilidad (Rigidez). Falla catastróficamente si ocurre algo no programado. Si esperabas un número y el usuario ingresa una letra, el programa colapsa sin intentar recuperarse.",
      software:
        "Scripts básicos, programas de terminal, monolitos antiguos (archivos gigantes), sistemas sin conexión a internet.",
      metric: "Estabilidad / Determinismo",
      code: {
        caption: "ola-1 · control básico",
        html:
          '<span class="t-com">// Tu código conoce todas las opciones posibles.</span>\n' +
          '<span class="t-key">let</span> vidas = <span class="t-num">3</span>;\n' +
          '<span class="t-key">while</span> (vidas > <span class="t-num">0</span>) {\n' +
          '  <span class="t-key">const</span> golpe = <span class="t-fn">recibirAtaque</span>();\n' +
          '  vidas = vidas - golpe;\n' +
          '  <span class="t-key">if</span> (vidas === <span class="t-num">0</span>) <span class="t-fn">mostrarGameOver</span>();\n' +
          "}\n" +
          '<span class="t-com">// Todo está bajo tu control total y predecible.</span>',
      },
    },
    {
      id: "w2",
      code: "OLA 02",
      name: "Sistemas abiertos y entropía",
      sub: "Teoría General Formal · 1950–1980",
      color: "var(--w2)",
      thesis:
        "Ningún software útil vive aislado. Tu código necesita intercambiar datos con el entorno (DBs, APIs, usuarios) manteniendo sus fronteras seguras frente al caos.",
      core: "Fronteras y Entropía: Tu programa recibe información (inputs), la procesa y entrega un resultado (outputs), invirtiendo energía en 'ordenar' (negentropía) el desorden externo.",
      authors:
        "Ludwig von Bertalanffy (Sistemas Abiertos), Ilya Prigogine (Entropía).",
      regulates:
        "Qué datos pueden entrar por la frontera (validaciones, esquemas) y cómo los subsistemas evitan acoplarse demasiado entre sí.",
      analogy:
        "Frontend interactuando con un Backend. Son dos sistemas separados que negocian información mediante reglas (API).",
      failure:
        "Caos por alto acoplamiento. Si todo está conectado con todo, cambiar una validación en la base de datos rompe un botón visual. La entropía técnica se apodera del proyecto.",
      software:
        "Desarrollo web moderno (Arquitectura Cliente/Servidor), Microservicios, APIs REST, Bases de Datos.",
      metric: "Cohesión / Adaptación",
      code: {
        caption: "ola-2 · comunicación y fronteras",
        html:
          '<span class="t-com">// Creas una "frontera" segura para comunicarte.</span>\n' +
          '<span class="t-key">async function</span> <span class="t-fn">obtenerUsuario</span>(id) {\n' +
          '  <span class="t-key">if</span> (<span class="t-key">typeof</span> id !== <span class="t-str">"number"</span>) <span class="t-key">return</span> <span class="t-str">"Error: Input inválido"</span>;\n' +
          '  <span class="t-key">const</span> respuesta = <span class="t-key">await</span> <span class="t-fn">fetch</span>(<span class="t-str">`/api/usuarios/${id}`</span>);\n' +
          '  <span class="t-key">return</span> <span class="t-key">await</span> respuesta.<span class="t-fn">json</span>();\n' +
          "}\n" +
          '<span class="t-com">// Separas tu sistema del resto del mundo, protegiéndolo de la entropía.</span>',
      },
    },
    {
      id: "w3",
      code: "OLA 03",
      name: "Sistemas Complejos Adaptativos",
      sub: "Variedad, IA y Emergencia · 1980–hoy",
      color: "var(--w3)",
      thesis:
        "El entorno real presenta más variedad de problemas de la que un humano puede programar con 'IFs'. La única forma de controlarlo es un sistema que aprenda (Ley de Variedad Requerida).",
      core: "Adaptabilidad y Emergencia: En lugar de definir reglas fijas, defines funciones de premio/castigo. El sistema auto-organiza sus reglas internas aprendiendo de ejemplos.",
      authors:
        "John Holland, Stuart Kauffman, W. Ross Ashby.",
      regulates:
        "El grado de incertidumbre (entropía cruzada) y cómo el sistema se recupera dinámicamente mediante aprendizaje y auto-corrección sin intervención humana constante.",
      analogy:
        "Un detector de spam moderno o ChatGPT. No programas una lista gigante de palabras prohibidas; entrenas al modelo para que adapte sus 'pesos' internos y lo haga solo.",
      failure:
        "Alucinaciones y cajas negras. Como el sistema creó sus propias conexiones dinámicamente (emergencia), a veces produce fallos que son difíciles de trazar lógicamente.",
      software:
        "Machine Learning, Modelos Generativos (LLMs), Algoritmos de recomendación (TikTok), Agentes Inteligentes.",
      metric: "Variedad Requerida / Emergencia",
      code: {
        caption: "ola-3 · adaptación y autoorganización",
        html:
          '<span class="t-com">// Defines el objetivo, no los pasos, para absorber variedad infinita.</span>\n' +
          '<span class="t-key">const</span> contexto = <span class="t-str">"Comentario impredecible de usuario enfadado."</span>;\n' +
          '<span class="t-key">const</span> respuesta = <span class="t-key">await</span> IA.<span class="t-fn">inferirSentimiento</span>(contexto);\n' +
          'console.<span class="t-fn">log</span>(respuesta); <span class="t-com">// Emergerá un análisis sin usar condicionales programados.</span>',
      },
    },
  ];

  /* ---------------------------------------------------------------------
     Mapa evolutivo: eras de la arquitectura de software
     --------------------------------------------------------------------- */
  const eras = [
    {
      id: "mainframe",
      wave: "w1",
      years: "1950 – 1970",
      title: "Archivos únicos (Mainframes)",
      short: "Lotes",
      icon: "fa-server",
      principle: "Un solo programa gigante que hace todo de principio a fin.",
      tgs: "Sistema totalmente cerrado. Recibe datos, calcula, escupe resultados y se apaga. No interactúa con nadie en el medio.",
      pattern:
        "El código es una lista interminable de instrucciones. Todo se guarda en el mismo lugar de la memoria.",
      failure:
        "Es imposible de mantener. Si quieres cambiar algo en la línea 50, corres el riesgo de dañar la línea 5000.",
      lesson:
        "Tener todo en un solo archivo gigante (código espagueti) es la peor manera de hacer software.",
    },
    {
      id: "estructurada",
      wave: "w1",
      years: "1968 – 1985",
      title: "Programación Estructurada",
      short: "Funciones",
      icon: "fa-code-branch",
      principle: "Dividir el código gigante en piezas pequeñas llamadas funciones.",
      tgs: "El primer intento de organizar el desorden. Separamos las tareas, pero todos siguen compartiendo la misma información.",
      pattern:
        "Funciones, bucles (while, for), condiciones (if, else). El código es mucho más fácil de leer.",
      failure:
        "Uso excesivo de 'variables globales'. Aunque las funciones estén separadas, si todas modifican las mismas variables, el caos regresa.",
      lesson:
        "Agrupar código en funciones es vital, pero si no proteges tus variables (estado), seguirás rompiendo tu programa sin querer.",
    },
    {
      id: "oop",
      wave: "w2",
      years: "1980 – 1995",
      title: "Orientación a Objetos (POO)",
      short: "Objetos",
      icon: "fa-cubes",
      principle: "Crear 'objetos' que guardan sus propios datos (variables) y tienen sus propias funciones (métodos).",
      tgs: "Nacen los sistemas abiertos en miniatura. Cada objeto protege su información y solo se comunica con otros mediante reglas claras.",
      pattern:
        "Clases, objetos, herencia. 'Alta cohesión' (el objeto hace una sola cosa bien) y 'bajo acoplamiento' (no depende demasiado de otros).",
      failure:
        "Abuso de la herencia. Crear familias de objetos tan complejas que para entender un botoncito de la pantalla necesitas leer 20 archivos distintos.",
      lesson:
        "Ocultar los datos dentro de un objeto (encapsulamiento) evita que otros programas los dañen accidentalmente.",
    },
    {
      id: "soa",
      wave: "w2",
      years: "1990 – 2005",
      title: "Cliente-Servidor y Web",
      short: "Cliente/Servidor",
      icon: "fa-network-wired",
      principle: "El código se divide en dos computadoras distintas: el Frontend (navegador) y el Backend (servidor).",
      tgs: "Los sistemas empiezan a hablar por internet. Frontend y Backend son dos programas separados que negocian cómo enviarse información.",
      pattern:
        "Bases de datos relacionales separadas, desarrollo de APIs (rutas web para enviar datos), JSON.",
      failure:
        "Si el servidor falla, todo el sistema se cae. El Backend se vuelve un embudo por el que pasa demasiada información.",
      lesson:
        "La separación más importante en ADSO: tu interfaz visual (Frontend) nunca debe conectarse directo a la base de datos, siempre usa un servidor (Backend) intermedio.",
    },
    {
      id: "microservicios",
      wave: "w3",
      years: "2005 – 2018",
      title: "La Nube (Microservicios)",
      short: "Nube",
      icon: "fa-cloud",
      principle: "En lugar de tener un solo servidor gigante, tienes decenas de mini-servidores haciendo tareas pequeñitas.",
      tgs: "Sistemas distribuidos. Un servidor maneja usuarios, otro maneja pagos, otro el inventario. Todos conversan entre sí.",
      pattern:
        "APIs modernas, Amazon Web Services, servidores que se prenden y apagan solos dependiendo de si hay muchos clientes.",
      failure:
        "Efecto dominó. Si el servidor de pagos se cae y no lo programas bien, puede hacer que toda tu aplicación web se quede congelada.",
      lesson:
        "Dividir ayuda, pero aumenta la dificultad de coordinar. Aprendimos a crear códigos que 'reintentan' o muestran mensajes amigables cuando algo falla.",
    },
    {
      id: "ml",
      wave: "w3",
      years: "2012 – 2022",
      title: "Inteligencia Artificial Básica",
      short: "IA Clásica",
      icon: "fa-brain",
      principle: "En vez de programar reglas, le damos datos al código para que él mismo descubra las reglas.",
      tgs: "El problema era muy complejo para los programadores humanos (ej. reconocer un rostro), así que creamos algoritmos que aprenden por sí solos.",
      pattern:
        "Análisis de datos, predicciones, algoritmos de recomendación en redes sociales.",
      failure:
        "La caja negra. La IA funciona, pero a menudo los programadores no saben exactamente *por qué* tomó una decisión específica.",
      lesson:
        "Pasamos de dar órdenes estrictas ('haz esto si pasa aquello') a entrenar modelos para que adivinen la mejor respuesta.",
    },
    {
      id: "agentes",
      wave: "w3",
      years: "2023 – hoy",
      title: "IA Generativa y Agentes",
      short: "IA Moderna",
      icon: "fa-robot",
      principle: "La IA no solo predice, ahora genera texto, código, imágenes y toma decisiones en bucle.",
      tgs: "Sistemas cognitivos. Un programa que lee un problema, piensa una solución, escribe el código, lo prueba y se corrige a sí mismo si falla.",
      pattern:
        "ChatGPT, GitHub Copilot, asistentes virtuales que usan herramientas (buscar en web, usar calculadora).",
      failure:
        "Alucinaciones (inventar respuestas) o entrar en bucles infinitos intentando arreglar un problema que no entienden.",
      lesson:
        "El futuro del desarrollador ADSO no es solo escribir código, sino conectar IAs a sus aplicaciones web y controlar que no hagan locuras.",
    },
  ];

  /* ---------------------------------------------------------------------
     Definición Mermaid (Gráfico)
     --------------------------------------------------------------------- */
  const mermaidDef = [
    "flowchart LR",
    '  classDef w1 fill:#1c1608,stroke:#fbbf24,color:#fde68a,rx:6,ry:6;',
    '  classDef w2 fill:#06212a,stroke:#22d3ee,color:#a5f3fc,rx:6,ry:6;',
    '  classDef w3 fill:#160f2b,stroke:#a78bfa,color:#ddd6fe,rx:6,ry:6;',
    '  classDef teo fill:#0b1119,stroke:#334b63,color:#96a8bd,rx:14,ry:14;',
    "",
    '  subgraph OLA1["OLA 1 · Control Paso a Paso"]',
    '    direction TB',
    '    T1["Lógica Determinista\\n(Todo está programado)"]:::teo',
    '    A1["Código Espagueti"]:::w1',
    '    A2["Funciones y Condicionales"]:::w1',
    "    T1 --> A1 --> A2",
    "  end",
    "",
    '  subgraph OLA2["OLA 2 · Comunicación"]',
    '    direction TB',
    '    T2["Separación de Partes\\n(Frontend y Backend)"]:::teo',
    '    B1["Programación Orientada a Objetos"]:::w2',
    '    B2["Bases de Datos y APIs"]:::w2',
    "    T2 --> B1 --> B2",
    "  end",
    "",
    '  subgraph OLA3["OLA 3 · Inteligencia Artificial"]',
    '    direction TB',
    '    T3["Algoritmos de Aprendizaje\\n(El código se adapta)"]:::teo',
    '    C1["La Nube (Cloud)"]:::w3',
    '    C2["Reconocimiento y Machine Learning"]:::w3',
    '    C3["ChatGPT y Agentes Inteligentes"]:::w3',
    "    T3 --> C1 --> C2 --> C3",
    "  end",
    "",
    '  A2 -->|"el código único es inmanejable"| T2',
    '  B2 -->|"hay demasiados datos para programar reglas a mano"| T3',
  ].join("\n");

  /* ---------------------------------------------------------------------
     Reflexión: diagnóstico sistémico para aprendices
     --------------------------------------------------------------------- */
  const symptoms = [
    {
      id: "s1",
      text: "Hago un pequeño cambio en el HTML y de repente el JavaScript deja de funcionar en otra página.",
      dx: "acoplamiento",
    },
    {
      id: "s2",
      text: "Tengo variables globales regadas por todo el archivo y no sé quién las está modificando.",
      dx: "frontera",
    },
    {
      id: "s3",
      text: "Mi programa entra en un ciclo 'while' infinito y el navegador se queda congelado.",
      dx: "nolineal",
    },
    {
      id: "s4",
      text: "Mi código da error pero la consola no me dice en qué línea ni por qué falló.",
      dx: "observabilidad",
    },
    {
      id: "s5",
      text: "Tengo una función con 25 'IFs' para validar cada cosita que escribe el usuario.",
      dx: "variedad",
    },
    {
      id: "s6",
      text: "Copio y pego el mismo bloque de código 10 veces en diferentes archivos.",
      dx: "entropia",
    },
  ];

  const diagnoses = {
    acoplamiento: {
      title: "Alto Acoplamiento (Todo enredado)",
      wave: "w2",
      text:
        "Tus partes del código dependen demasiado unas de otras. Si cambias algo, se rompe otra cosa que parecía no tener relación.",
      lever:
        "Solución: Divide tu código. Usa funciones pequeñas que reciban parámetros claros y no modifiquen cosas fuera de ellas.",
    },
    frontera: {
      title: "Falta de Fronteras (Variables Globales)",
      wave: "w2",
      text:
        "Si todo el programa puede modificar las mismas variables globales, en algún momento se sobreescribirán datos por accidente.",
      lever:
        "Solución: Encapsula tus datos. Usa 'let' y 'const' dentro de las funciones, o agrupa tus datos en Objetos y Clases.",
    },
    nolineal: {
      title: "Falta de Límites de Seguridad",
      wave: "w3",
      text:
        "Tu programa intentó hacer algo tantas veces seguidas sin pausa que colapsó el sistema (como un bucle infinito).",
      lever:
        "Solución: Siempre pon una condición de salida segura en tus bucles y valida que los datos no vengan vacíos antes de procesarlos.",
    },
    observabilidad: {
      title: "Ceguera del Sistema (Falta de Logs)",
      wave: "w1",
      text:
        "Si no sabes qué está haciendo el código por dentro, estás adivinando el error. Un sistema ciego es imposible de arreglar.",
      lever: "Solución: Acostúmbrate a usar 'console.log' estratégicamente o devolver mensajes de error amigables ('catch' en tus peticiones).",
    },
    variedad: {
      title: "Fuerza Bruta en la Lógica",
      wave: "w1",
      text:
        "Estás intentando prever todas las posibilidades del universo usando 'if-else' o 'switch'. El código se vuelve larguísimo e ilegible.",
      lever:
        "Solución: Intenta usar arreglos (arrays), diccionarios (objetos JSON) o fórmulas matemáticas para simplificar la toma de decisiones.",
    },
    entropia: {
      title: "Desorden (Falta de Reutilización)",
      wave: "w1",
      text:
        "Al repetir código, estás aumentando la 'entropía' (desorden). Si hay un error, tendrás que arreglarlo en 10 lugares distintos.",
      lever:
        "Solución: Si usas el mismo código más de dos veces, conviértelo en una Función reutilizable.",
    },
  };

  /* ---------------------------------------------------------------------
     Micro-reto para desarrolladores junior
     --------------------------------------------------------------------- */
  const labSlots = [
    {
      id: "frontera",
      zone: "Zona 01 · Frontend (La cara)",
      ask: "¿Dónde hace clic el usuario y visualiza la información?",
      why: "Todo sistema necesita una interfaz amigable para que el usuario interactúe.",
      accepts: "frontend",
      principle: "frontera",
      ok: "Correcto. El Frontend (HTML, CSS, JS) es la frontera visual del sistema. Recibe los clics y muestra los resultados.",
    },
    {
      id: "flujo",
      zone: "Zona 02 · Comunicación (El puente)",
      ask: "¿Cómo enviamos la información del Frontend al servidor?",
      why: "Necesitamos un puente seguro para que viajen los datos.",
      accepts: "api",
      principle: "acoplamiento",
      ok: "Correcto. Las peticiones a una API (ej. usando 'fetch') son el puente que permite a tu interfaz hablar con el servidor.",
    },
    {
      id: "estado",
      zone: "Zona 03 · Backend (El cerebro lógico)",
      ask: "¿Qué componente valida las contraseñas y reglas de negocio?",
      why: "El frontend no es seguro. Las validaciones críticas van en un servidor protegido.",
      accepts: "backend",
      principle: "frontera",
      ok: "Correcto. El servidor Backend, hecho en Node.js o Python, valida todo antes de tocar la información valiosa.",
    },
    {
      id: "datos",
      zone: "Zona 04 · Persistencia (La memoria)",
      ask: "¿Dónde se guardan permanentemente los usuarios y productos?",
      why: "Si apagamos la computadora, la información no debe perderse.",
      accepts: "db",
      principle: "estado",
      ok: "Correcto. La base de datos (como MySQL o PostgreSQL) es el único lugar donde vive la verdad de nuestro sistema.",
    },
    {
      id: "control",
      zone: "Zona 05 · Seguridad (El portero)",
      ask: "¿Qué evita que alguien ponga código malicioso en un formulario de registro?",
      why: "Nunca debemos confiar en la información que escribe el usuario.",
      accepts: "validacion",
      principle: "entropia",
      ok: "Correcto. Validar y 'sanitizar' los datos antes de guardarlos protege el sistema contra hackeos básicos.",
    },
    {
      id: "cognitivo",
      zone: "Zona 06 · IA Asistente",
      ask: "¿Cómo añadimos respuestas inteligentes (como un chatbot) a nuestra web?",
      why: "La IA nos permite manejar textos complejos sin programar respuestas prehechas.",
      accepts: "llm",
      principle: "variedad",
      ok: "Correcto. Conectamos nuestro servidor a una API de Inteligencia Artificial (como la de OpenAI o Gemini).",
    },
    {
      id: "sensor",
      zone: "Zona 07 · Manejo de Errores",
      ask: "¿Qué hacemos si la conexión a internet falla o la base de datos se cae?",
      why: "El sistema no debe quedarse en blanco. Debe avisarle al usuario.",
      accepts: "catch",
      principle: "homeostasis",
      ok: "Correcto. Usar bloques 'try...catch' nos permite atrapar errores y mostrar un mensaje bonito en lugar de asustar al usuario.",
    },
    {
      id: "actuador",
      zone: "Zona 08 · Control de Versiones",
      ask: "¿Dónde guardamos nuestro código para trabajar en equipo y no perder el progreso?",
      why: "Desarrollar software es un trabajo en equipo que requiere un historial seguro.",
      accepts: "git",
      principle: "homeostasis",
      ok: "Correcto. Usar Git y GitHub nos asegura que si dañamos algo, siempre podemos retroceder a la versión anterior que sí funcionaba.",
    },
  ];

  const labPieces = [
    { id: "frontend", name: "Frontend (Interfaz HTML/JS)", kind: "visual", icon: "fa-desktop" },
    { id: "api", name: "Peticiones a la API (Fetch)", kind: "comunicacion", icon: "fa-network-wired" },
    { id: "backend", name: "Servidor Backend (Node.js/Python)", kind: "logica", icon: "fa-server" },
    { id: "db", name: "Base de Datos (MySQL / Mongo)", kind: "persistencia", icon: "fa-database" },
    { id: "validacion", name: "Limpieza y Validación de datos", kind: "seguridad", icon: "fa-shield-halved" },
    { id: "llm", name: "API de Inteligencia Artificial", kind: "cognitivo", icon: "fa-brain" },
    { id: "catch", name: "Bloques Try/Catch (Errores)", kind: "control", icon: "fa-triangle-exclamation" },
    { id: "git", name: "Git y GitHub", kind: "colaboracion", icon: "fa-code-branch" },
    /* Señuelos: errores comunes de novatos */
    {
      id: "trap_direct",
      name: "Conectar HTML directo a la Base de Datos",
      kind: "señuelo",
      icon: "fa-bomb",
      trap: "¡Peligro! Cualquiera que abra tu página y presione 'Inspeccionar Elemento' verá la contraseña de tu base de datos.",
    },
    {
      id: "trap_shareddb",
      name: "Variables Globales para todo",
      kind: "señuelo",
      icon: "fa-bomb",
      trap: "Hace que tu código sea un caos. Cualquier función puede cambiar el estado y no sabrás dónde ocurrió el error.",
    },
    {
      id: "trap_retry",
      name: "No usar Try/Catch",
      kind: "señuelo",
      icon: "fa-bomb",
      trap: "Si el servidor tarda en responder y no hay manejo de errores, la aplicación web simplemente dejará de funcionar.",
    },
    {
      id: "trap_trust",
      name: "Confiar a ciegas en lo que responde una IA",
      kind: "señuelo",
      icon: "fa-bomb",
      trap: "Las IAs a veces se equivocan (alucinan). Siempre debes verificar o darle formato a su respuesta antes de mostrarla directo a un usuario.",
    },
  ];

  const labPrinciples = [
    { id: "frontera", name: "Separación Frontend/Backend" },
    { id: "acoplamiento", name: "Bajo acoplamiento" },
    { id: "homeostasis", name: "Tolerancia a fallos" },
    { id: "estado", name: "Protección de datos" },
    { id: "entropia", name: "Prevención de errores" },
    { id: "variedad", name: "Adaptabilidad" },
  ];

  /* ---------------------------------------------------------------------
     Apropiación: verificación conceptual amigable
     --------------------------------------------------------------------- */
  const quiz = [
    {
      q: "Estás creando una página web. Pones las contraseñas de la base de datos directo en el archivo JavaScript que envías al navegador del usuario. ¿Por qué es una terrible idea?",
      opts: [
        "Porque el archivo pesa más y tarda en cargar.",
        "Porque no hay 'frontera' de seguridad: el usuario puede ver el código fuente y robar tu base de datos.",
        "Porque JavaScript no soporta contraseñas.",
        "Porque el frontend no se puede conectar a internet.",
      ],
      a: 1,
      why: "El navegador (Frontend) es un sistema 'abierto' al público. Tu base de datos es información privada. Necesitas poner un servidor (Backend) en el medio que actúe como barrera o portero.",
    },
    {
      q: "¿Por qué dividimos nuestras aplicaciones web en Frontend (pantalla) y Backend (servidor) en lugar de hacer un solo archivo gigante?",
      opts: [
        "Para tener que programar más y cobrar más caro.",
        "Para reducir el 'acoplamiento'. Así, si cambiamos el color de un botón, no corremos el riesgo de romper la validación de contraseñas.",
        "Porque es obligatorio para usar internet.",
        "No deberíamos separarlo, un solo archivo es mejor.",
      ],
      a: 1,
      why: "Separar responsabilidades (Frontend para lo visual y Backend para la lógica) nos permite organizar el código y evitar que un error tonto dañe todo el programa (Bajo acoplamiento).",
    },
    {
      q: "Un usuario intenta registrarse, pero el servidor está caído. En lugar de que la página se quede en blanco, atrapas el error (Try/Catch) y le muestras 'Intenta más tarde'. ¿Qué lograste?",
      opts: [
        "Homeostasis (Tolerancia a fallos): El sistema sobrevivió a un problema sin colapsar por completo.",
        "Generaste una alucinación.",
        "Creaste Inteligencia Artificial.",
        "Aumentaste la entropía del programa.",
      ],
      a: 0,
      why: "El buen software no asume que todo será perfecto. Asume que habrá errores de red y los maneja elegantemente. El programa mantiene el equilibrio (homeostasis).",
    },
    {
      q: "¿Qué significa el concepto de 'Caja Negra' al referirnos a un modelo de Inteligencia Artificial?",
      opts: [
        "Que la IA está apagada.",
        "Que sabemos perfectamente qué línea de código tomó la decisión.",
        "Que le damos una entrada, nos da una salida maravillosa, pero no sabemos los pasos lógicos exactos que hizo por dentro.",
        "Que solo funciona con temas de colores oscuros.",
      ],
      a: 2,
      why: "Las redes neuronales modernas aprenden patrones tan complejos que nosotros no vemos 'if/else' adentro. Vemos millones de números. Ganamos poder mágico, pero perdemos trazabilidad (saber el 'por qué' exacto).",
    },
  ];

  /* ---------------------------------------------------------------------
     Glosario operativo para ADSO
     --------------------------------------------------------------------- */
  const glossary = [
    { t: "Frontera del Sistema", e: "system boundary", d: "La línea imaginaria que separa tu código del mundo exterior. En desarrollo web, las APIs y las validaciones de entrada son la frontera. Mantienen lo privado seguro y filtran lo inválido." },
    { t: "Sistema Abierto", e: "open system", d: "Un programa que interactúa constantemente con su entorno (usuarios, otras APIs, bases de datos). Para sobrevivir, debe importar 'orden' y expulsar 'desorden'." },
    { t: "Retroalimentación", e: "feedback loop", d: "El ciclo mediante el cual un sistema usa sus resultados pasados para ajustar su comportamiento futuro. Los Logs, el Monitoreo y el entrenamiento de IA son formas de retroalimentación." },
    { t: "Homeostasis", e: "homeostasis", d: "La capacidad de un sistema para mantenerse estable ante perturbaciones. En código, es la 'Tolerancia a fallos' (bloques Try/Catch, auto-escalado) que evita que un pico de usuarios tumbe la app." },
    { t: "Entropía", e: "entropy", d: "La tendencia natural del código al desorden. 'Código espagueti', falta de documentación y parches rápidos aumentan la entropía hasta hacer el sistema inmanejable." },
    { t: "Negentropía", e: "negentropy", d: "Trabajo activo para extraer orden del caos. Refactorizar código, limpiar bases de datos o entrenar una red neuronal (reducir el error) son procesos negentrópicos. Requieren energía/tiempo." },
    { t: "Variedad Requerida", e: "requisite variety", d: "Ley de Ashby: 'Solo la variedad destruye la variedad'. Si tu app tiene usuarios muy impredecibles, tus IFs no serán suficientes; necesitarás herramientas con alta variedad como una IA para controlarlos." },
    { t: "Equifinalidad", e: "equifinality", d: "Un sistema puede alcanzar el mismo resultado final desde distintos caminos. En arquitectura, es la 'Idempotencia': no importa si aprietas 'Pagar' una o tres veces (por error de red), el sistema asegura que el resultado (cobro) se haga solo una vez." },
    { t: "Emergencia", e: "emergence", d: "Cuando el sistema en conjunto tiene habilidades que sus partes individuales no tienen. En software, puede ser algo positivo (un LLM que razona, producto de multiplicaciones matemáticas) o negativo (un bug que solo ocurre en producción)." },
    { t: "Autoorganización", e: "self-organization", d: "La capacidad de un sistema para reestructurarse sin un director central. En la Nube moderna (Kubernetes), si un servidor muere, el sistema auto-organiza el tráfico a otro servidor sobreviviente." },
    { t: "Frontend", e: "frontend", d: "La parte del sistema (interfaz) que el usuario ve y toca (HTML, CSS, JS). Actúa como el sensor y presentador en la frontera del sistema." },
    { t: "Backend", e: "backend", d: "El subsistema oculto (servidor) que procesa datos y aplica reglas lógicas. Es el regulador central de un sistema web." },
    { t: "Acoplamiento", e: "coupling", d: "Qué tan pegadas están las partes de tu sistema. Un 'alto acoplamiento' viola los principios sistémicos porque el fallo de un componente arrastra a todos los demás." }
  ];

  /* ---------------------------------------------------------------------
     Fases pedagógicas para ADSO
     --------------------------------------------------------------------- */
  const phases = [
    {
      name: "Reflexión",
      goal: "Aprender a identificar errores comunes en nuestro primer código (variables globales, bucles infinitos).",
      out: "Diagnóstico fácil de tus propios errores de novato.",
    },
    {
      name: "Contextualización",
      goal: "Comprender cómo pasamos de archivos gigantes al Frontend/Backend y finalmente a la IA.",
      out: "Mapa simple de la historia del desarrollo de software.",
    },
    {
      name: "Apropiación",
      goal: "Poner a prueba lo que entendiste sobre buenas prácticas al crear aplicaciones web.",
      out: "Pequeño test sobre seguridad, errores e IA.",
    },
    {
      name: "Transferencia",
      goal: "Aprender a armar el rompecabezas: Frontend, Backend, Base de Datos e IA.",
      out: "Micro-reto para conectar las piezas de software correctamente.",
    },
  ];

  /* ---------------------------------------------------------------------
     Ejercicios Prácticos para ADSO
     --------------------------------------------------------------------- */
  const exercises = [
    {
      title: "Ejercicio 1: Definiendo Fronteras",
      scenario: "Un usuario llena un formulario para comprar unos tenis y hace clic en 'Pagar'. ¿Dónde debería ir el código que verifica si tienes saldo suficiente en la tarjeta?",
      options: [
        "En el Frontend (navegador), para que sea más rápido.",
        "En el Backend (servidor), porque es el lugar seguro que se comunica con el banco.",
        "En la Base de Datos, usando HTML."
      ],
      correctIndex: 1,
      feedbackGood: "¡Exacto! El Frontend solo muestra cosas, la lógica crítica y de seguridad (como los pagos) SIEMPRE va en el Backend.",
      feedbackBad: "Piénsalo de nuevo. Si lo haces en el Frontend, un usuario travieso podría modificar el código desde su navegador y comprar gratis. Necesitamos un lugar seguro."
    },
    {
      title: "Ejercicio 2: El peligro del código espagueti",
      scenario: "Tienes un proyecto de 5000 líneas en un solo archivo index.html. Tienes HTML, botones con JavaScript incrustado y consultas a base de datos ahí mismo. ¿Cuál es el mayor riesgo?",
      options: [
        "La página cargará demasiado rápido.",
        "Entropía. Cuando quieras cambiar el menú, probablemente rompas la conexión a la base de datos sin darte cuenta.",
        "No hay ningún riesgo, es mejor tener todo a la vista."
      ],
      correctIndex: 1,
      feedbackGood: "¡Correcto! En sistemas, cuando todo está revuelto (alto acoplamiento), un cambio pequeño genera errores catastróficos.",
      feedbackBad: "Error. Tener todo revuelto hace que las partes dependan unas de otras de forma invisible. Un cambio pequeño podría destruir todo el programa."
    },
    {
      title: "Ejercicio 3: ¿Lógica tradicional o Inteligencia Artificial?",
      scenario: "Te piden programar una función que analice la foto de perfil de un usuario para saber si está sonriendo o si está enojado. ¿Qué enfoque usarías?",
      options: [
        "Lógica estricta (if/else). Si el pixel 45 es rojo y el pixel 50 es blanco, entonces está sonriendo.",
        "Inteligencia Artificial. Le doy al programa miles de fotos etiquetadas y dejo que aprenda los patrones por su cuenta.",
        "Una Base de Datos Relacional."
      ],
      correctIndex: 1,
      feedbackGood: "¡Perfecto! Cuando hay 'demasiada variedad' (no todas las sonrisas son iguales), las reglas fijas fallan. Aquí es donde brilla la Inteligencia Artificial.",
      feedbackBad: "Imagina cuántos 'if/else' necesitarías para cada rostro humano distinto... ¡millones! Para tareas tan complejas y variadas, la IA es la herramienta correcta."
    }
  ];

  global.TGS_CONTENT = {
    waves,
    eras,
    mermaidDef,
    symptoms,
    diagnoses,
    labSlots,
    labPieces,
    labPrinciples,
    quiz,
    glossary,
    phases,
    exercises,
  };
})(window);
