---
version: 1
slug: "app-tabs-index-tsx"
primary_target: "app/(tabs)/index.tsx"
related_targets: []
---

# Surface brief: pantalla Hoy

Modo: Operate. App Android (Expo/React Native). Pantalla principal "Hoy", usada de un vistazo, de noche y con poca bateria, sin conexion.

Audiencia y tarea: gente en Cuba con apagones programados que pregunta "hay luz ahora y hasta cuando?" para su circuito (Cto 1 por defecto, configurable). Datos reales: tabla de 8 tramos de 3 h por dia; el circuito de la celda TIENE luz en ese tramo.

Direccion elegida: Mediopunto (vitral de abanico colonial cubano). Momento memorable: el abanico del dia.

## Direction contract

THESIS: el dia es un abanico de 8 cristales, uno por tramo de 3 h; los tramos con luz son vidrio encendido y el resto cristal oscuro. Rechaza la tarjeta de estado con semaforo verde/rojo y el neon sobre negro.

OWN-WORLD: plomo calido casi negro (#12100E) con muros #1C1916/#26221E; texto cal #F1EBDD y humo #A39B8C. Luz = vidrio ambar #E9A23B; sin luz = cristal azul de plomo #232A3A con filo cobalto; proximo cambio = rubi #C63A33, unico uso del rojo. Cobalto, rubi, verde botella y turquesa solo en el aro ornamental y el icono. Lineas de plomo de 2 dp entre cristales. Numerales condensados pesados; cuerpo en Roboto/sistema.

STORY: la persona entiende al instante si hay luz, cuanto falta y cuando vuelve; cree el dato porque se ve el dia completo; toca el abanico para ver otro dia o cambia de circuito.

FIRST VIEWPORT: arriba barra con "Lumio" y selector de circuito. Debajo, abanico semicircular de 8 cristales a ancho completo con una aguja de lineas de plomo en la hora actual. Bajo el abanico, "HAY LUZ" o "SIN LUZ" en numeral grande, y "hasta las 16:00 · faltan 1 h 24 min". Luego lista de tramos de hoy y manana. Navegacion inferior Material: Hoy, Semana, Ajustes.

FORM: Mediopunto, posicion 1 de mi lista ordenada (eleccion de Impeccable); seed:809a45c4383e45bb

Estado nunca solo por color: cristal encendido lleva relleno y brillo; apagado, trama de plomo y texto "Sin luz".

## Decisiones abiertas

Tema claro (pared de cal) no definido; se decide despues de la primera version.
