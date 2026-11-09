# Lumio

¿Hay luz en casa? Lumio muestra, para tu circuito eléctrico, si hay luz ahora, hasta cuándo y cuánto falta para el próximo cambio. Funciona sin internet, tiene widget de pantalla de inicio y es solo para Android.

Hecha con Expo / React Native. Diseño "Mediopunto": el día es un abanico de vitral con un cristal por tramo de 3 horas.

## Instalar

Descarga `lumio.apk` del [último release](https://github.com/A-Hallen/Lumio/releases/latest). Si tu teléfono es muy antiguo (32 bits) y no se instala, usa `lumio-32bit.apk`.

## Desarrollo

```sh
npm install
npm test            # motor de horarios, sincronizacion, geometria del abanico
npm run typecheck
npx expo start
```

## Actualizar los horarios (sin sacar versión nueva)

Los horarios viven en `schedule/AAAA-MM.json`. La app los baja sola cuando hay internet y los guarda en el teléfono.

```sh
# pegando la tabla: una fila por día, 8 circuitos por fila ("19 21 1 20 2 19 21 1")
npm run schedule -- from-table 2026-12 tabla.txt
# o continuando la rotación 19,21,1,20,2 (comprobar contra la tabla oficial)
npm run schedule -- rotate 2026-12
# validar todo y regenerar schedule/index.json y src/data/bundled.ts
npm run schedule -- build
git add schedule src/data/bundled.ts && git commit -m "Horario de diciembre" && git push
```

La app prueba estos orígenes en orden y usa el primero que responda (`src/config.ts`): GitHub raw, el sitio de descarga y jsDelivr. Un mes mal formado nunca pisa uno bueno.

## Publicar una versión

1. Sube la versión en `package.json` (de ahí salen la versión visible y el `versionCode`).
2. `git tag v0.2.0 && git push --tags`.
3. GitHub Actions compila un APK firmado por arquitectura: `lumio.apk` (64 bits, ~33 MB, casi todos los teléfonos) y `lumio-32bit.apk` (teléfonos antiguos). Luego actualiza `schedule/index.json` para que las apps avisen de la versión nueva; la app elige sola el APK que le toca.

Secretos del repositorio: `LUMIO_KEYSTORE_B64`, `LUMIO_KEYSTORE_PASSWORD`, `LUMIO_KEY_ALIAS`, `LUMIO_KEY_PASSWORD`. Opcionales para el sitio: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.

**La clave de firma debe ser siempre la misma.** Si se pierde o cambia, Android no deja actualizar la app encima de la anterior y hay que desinstalar y volver a instalar.

## Cómo se lee la tabla

Cada fila es un día y cada columna un tramo de 3 horas. El circuito que aparece en la celda **tiene luz** en ese tramo.
