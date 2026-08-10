# PUDÚ Kombi — contexto del proyecto

Este archivo existe para no tener que explicar el proyecto de nuevo cada vez.
Pégalo en un chat nuevo, o déjalo estar: las sesiones de Claude Code que
trabajen en este repositorio lo leen solas.

## Qué es

**PUDÚ Kombi Experience**, de PUDÚ / MADEINN LATAM. Un sitio en Next.js 15 con
un visor 3D de una Volkswagen T2 que lleva la gráfica de la marca. La propuesta
de fondo: una Kombi que recorre Chile como estudio de podcast rodante,
entrevistando emprendedores y tejiendo ecosistemas donde no los hay, entre
Concepción y Valdivia. La página de inicio es esa presentación, pensada para
mostrarla a marcas.

- Repositorio: <https://github.com/tgonzaal/pudu-kombi-experience>
- En línea: <https://kombipudu.vercel.app> (despliega solo al recibir `main`)
- Local: `/Users/tom/Pudu/Kombi`, `npm run dev` en el puerto 3001

## Cómo está armado el visor

Todo vive en `/kombi`. Hay **un solo lienzo 3D**, que ocupa la página entera, y
el editor se abre como panel encima con el botón **Editar**. Hubo un momento en
que el editor era una página aparte con su propia escena y la Kombi se perdía
de cuadro al cambiar; por eso ahora es uno solo.

Piezas principales, en `src/components/viewer/`:

| Archivo                | Qué hace                                                       |
| ---------------------- | -------------------------------------------------------------- |
| `viewer-shell.tsx`     | Estado, panel del editor, guardado y publicación                |
| `viewer-scene.tsx`     | La escena: estudio fotográfico, luces, órbita de cámara         |
| `kombi-model.tsx`      | Carga el GLB y le aplica gráficas y pintura                     |
| `decal-projection.ts`  | El shader: proyecta las gráficas y repinta la carrocería        |
| `decals.ts`            | Tipos, guardado local y publicado, disposición de fábrica       |
| `editor-panel.tsx`     | El panel lateral                                                |
| `decal-handles.tsx`    | Arrastrar una gráfica sobre la carrocería                       |

### Las gráficas van pintadas, no pegadas

No son calcomanías flotando delante de la Kombi: se parchea el material del
modelo para que cada píxel mire su posición en el mundo y, si cae dentro del
rectángulo de una gráfica, la mezcle sobre la pintura. Hay cuatro caras
—piloto, copiloto, atrás, adelante— y cada una tiene su propio eje y su propio
sentido de lectura.

Dos límites que ya costaron caro y conviene respetar:

- **Máximo cinco imágenes distintas.** WebGL garantiza 16 unidades de textura y
  el material ya usa media docena. Pasarse hace que el material no compile y
  **la carrocería desaparece entera**, no es que se vea mal.
- Los samplers no se pueden indexar por variable, por eso los bloques del
  shader van desplegados uno por uno.

### La pintura se cambia sin rehornear

El color de arriba y el de abajo se eligen en el editor. El shader reconoce la
pintura por el tono que quedó horneado en la textura y lo **desplaza**
conservando la diferencia, así las líneas del panal y las sombras sobreviven.
Con el color de fábrica la cuenta da exactamente lo mismo que antes. Vidrios,
pancartas, cromados y focos quedan fuera por color; las ruedas, por posición.

### Guardado: borrador contra publicado

- Mientras editas se guarda un **borrador** en el navegador.
- **Guardar en la página** escribe `public/graficas/layout.json`, que es lo que
  ve cualquiera que entre.
- Con el editor cerrado se muestra siempre lo publicado. El borrador manda solo
  con el editor abierto, porque cuando mandaba siempre, un cambio ya publicado
  parecía no haber llegado nunca.

**En Vercel el botón no puede escribir**: el disco es de solo lectura. El
circuito real es publicar con el sitio corriendo en el computador y subir
`layout.json` al repositorio.

## El modelo

`public/models/kombi.glb`, unos 520 KB. Trae horneada la pintura de dos tonos,
el panal de hexágonos en los cuatro costados y las pancartas de las ventanas.
Los elementos de marca **no** están horneados: van sueltos para poder moverlos.

El pipeline que lo genera está en `.assets-src/pipeline/` (Python + Pillow +
numpy, más `gltf-transform` para optimizar). Rasteriza los triángulos del GLB
original para saber a qué punto del mundo corresponde cada texel, y con eso
proyecta las gráficas. Solo hace falta si se cambia la base horneada.

## Estado de la gráfica

Cuatro elementos por costado, iguales en ambos lados: pudú, auspiciadores,
frase y logo PUDÚ. El pudú del copiloto lleva marcada la casilla **Espejar**
para que mire hacia el morro en los dos lados; los textos ya se leen bien solos.

## Decisiones tomadas, para no repetir el camino

- **El lado del piloto está cerrado.** No se toca sin que lo pidan.
- **Nada de escenas.** Se probó una carretera hecha con geometría y otra con una
  fotografía de 360°, y ninguna convenció: quedó solo el estudio.
- Se quitó el interior de podcast: por ahora interesa solo el exterior.
- Las patentes se borraron del modelo, se veían deformadas.
