# Product

<!-- impeccable:product-schema 1 -->

## Platform

android

## Stack
Expo / React Native (usuario lo pidió), NativeWind para estilos, Reanimated para animación, widget nativo de pantalla de inicio en Android. Compilación del APK en GitHub Actions y publicación en GitHub Releases. Sitio de descarga en Cloudflare Pages.

## Users
Personas en Cuba que viven con apagones programados: el autor, su familia y vecinos. Abren la app o miran el widget varias veces al día, a menudo de noche o con poca batería, para saber si hay corriente en su bloque eléctrico y planear cocinar, cargar el teléfono, lavar. Uso rápido, de un vistazo.

## Product Purpose
Mostrar, por bloque eléctrico y día, las horas con y sin luz, y cuánto falta para el próximo cambio. Sustituye consultar a mano una tabla oficial (hoy en foto: días en filas, bloques en columnas). Éxito: responder "¿hay luz ahora y hasta cuándo?" sin pensar.

## Positioning
Hecha por y para quien vive los apagones en Cuba: sin cuentas, sin anuncios, sin servidor propio, funciona sin internet y los horarios se actualizan sin reinstalar la app.

## Operating Context
Los horarios salen de la tabla oficial del sistema eléctrico nacional, organizada por días (filas) y bloques (columnas); un bloque es un área delimitada por el sistema eléctrico. El autor transcribe la tabla a un JSON en el repositorio; la app lo descarga, lo guarda offline y avisa cuando hay nueva versión de la app (consulta al último release). Conexión a internet escasa e inestable.

## Capabilities and Constraints
- Solo Android; APK público por GitHub Releases.
- 100% en español.
- Elegir bloque; ver hoy y mañana; cuenta regresiva al próximo cambio; widget de inicio.
- Funciona sin internet; teléfonos modestos.
- Datos de horarios: transcripción manual desde foto, pendiente de recibir la imagen.

## Brand Commitments
Nombre: Lumio. El usuario rechazó la paleta "Filamento" (violeta-tinta casi negro, dorado ámbar, índigo) por parecer genérica de IA; quiere una identidad de color original.

## Evidence on Hand
Aún no hay tabla de horarios en el repositorio; la foto está pendiente. No inventar horarios ni bloques.

## Product Principles
- Un vistazo basta: estado actual y tiempo restante primero.
- Funciona sin conexión; lo esencial nunca depende de internet.
- El estado nunca se comunica solo con color.
- Honesta con los datos: si no hay horario cargado, lo dice, no inventa.

## Accessibility & Inclusion
Legible de noche y a pleno sol; personas con daltonismo y adultos mayores entre los usuarios; no depender solo del color para luz/apagón.
