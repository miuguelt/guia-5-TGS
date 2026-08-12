# Guía 5 · Teoría General de Sistemas → Arquitectura de Software → IA

Aplicación web de una sola página, estática y sin proceso de construcción, que enseña la Teoría
General de Sistemas desde cero con enfoque de ingeniería, y traza la línea que va de la cibernética
de 1948 a los sistemas agénticos actuales.

## Ejecutar

Cualquier servidor estático sirve. Con Python:

```bash
python -m http.server 8123
```

Luego abrir `http://localhost:8123`. También existe `.claude/launch.json` con la configuración
`guia5-tgs` para el arranque desde el IDE.

Abrir `index.html` directamente con `file://` funciona, pero algunos navegadores restringen
`localStorage` en ese esquema y el progreso no persistiría.

## Estructura

```
index.html                  Contenido completo de la guía (semántico, legible sin JS)
css/styles.css              Hoja autosuficiente: tokens, componentes, responsive, impresión
js/content.js               Modelo de datos único (olas, eras, glosario, reto, verificación)
js/app.js                   Cáscara: progreso de lectura, navegación e islas Vue
js/evolution-map.js         Mapa evolutivo SVG generativo + vista alterna en Mermaid
js/neural-sim.js            Simulador: red 2→H→1 con retropropagación propia
js/architecture-lab.js      Micro-reto de transferencia y acta de diseño exportable
guide.manifest.json         Manifiesto curricular y de calidad web
WEB-DESIGN-BRIEF.md         Contrato de diseño
```

## Los cinco artefactos interactivos

| Artefacto | Qué demuestra |
|---|---|
| Diagnóstico sistémico | Traduce síntomas de ingeniería (acoplamiento, cascada, reintentos) al concepto de la TGS que los produce y a su palanca. |
| Explorador de las tres olas | Tesis, concepto núcleo, analogía, modo de fallo y huella en software de cada ola. |
| Mapa evolutivo | Infografía generada desde datos que alinea las olas con siete eras de arquitectura, del mainframe a los agentes. |
| Simulador sistémico | Red neuronal real entrenándose: ganancia del lazo, variedad del regulador, entropía del entorno, choque entrópico y apertura de la retroalimentación. |
| Micro-reto arquitectónico | Ocho zonas con función sistémica, doce componentes (cuatro señuelos) y evaluación por cinco principios. |

## El simulador en detalle

Red `2 → H → 1` con activación `tanh` en la capa oculta, `sigmoide` en la salida y **entropía
cruzada binaria** como pérdida. El paso hacia adelante, la retropropagación y el descenso de
gradiente con momento (β = 0,9) están escritos a mano: no hay librería de aprendizaje automático.

Lectura cibernética de cada pieza:

| Elemento de la red | Papel en el lazo de control |
|---|---|
| Pesos y sesgos | Planta (el sistema controlado) |
| Función de pérdida | Sensor: mide la desviación |
| Gradiente ∇L | Comparador: dirección y magnitud de la corrección |
| θ ← θ − η∇L | Actuador: corrige la planta |

Tres experimentos reproducibles:

1. **Ganancia excesiva.** Con η en el máximo el actuador sobrecorrige: la pérdida salta de 0,7 a
   más de 8 y oscila sin converger. El estado del sistema pasa a «divergente».
2. **Lazo abierto.** Entrenar hasta la homeostasis, apagar la retroalimentación e inyectar un
   choque entrópico: la pérdida sube y se queda exactamente donde quedó. Al cerrar el lazo, el
   sistema recupera el equilibrio.
3. **Variedad insuficiente.** Entorno «Espiral» con H = 2 o 3: la pérdida se estanca por encima de
   0,4 y la exactitud queda muy lejos de la que alcanza el mismo entorno con H = 12, que converge
   por encima del 95 %. Es la ley de Ashby como experimento. Cada «Reiniciar» usa una semilla
   distinta, así que las cifras exactas varían; la diferencia entre ambos regímenes no.

## Dependencias externas

Se cargan desde CDN: Tailwind (capa de utilidades), Vue 3 (islas reactivas), Mermaid (vista alterna
del mapa), Font Awesome y las tipografías Inter y JetBrains Mono.

`css/styles.css` es autosuficiente: si Tailwind no carga, la página conserva su diseño. Si Vue no
carga, las islas se sustituyen por un aviso y el texto de la guía sigue completo. Si Mermaid no
carga, el grafo remite a la línea evolutiva, que no depende de librerías.

## Privacidad

Todo el procesamiento ocurre en el navegador. El progreso opcional se guarda en `localStorage` bajo
la clave `tgs.guia5.v1`. No hay envío de datos, analítica ni credenciales.
