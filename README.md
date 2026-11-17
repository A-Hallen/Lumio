# Lumio

¿Hay luz en casa? Lumio muestra, para tu circuito eléctrico, si hay luz ahora, hasta cuándo y cuánto falta para el próximo cambio. Funciona sin internet, tiene widget de pantalla de inicio y es solo para Android.

Hecha con Expo / React Native. Diseño "Mediopunto": el día es un abanico de vitral con un cristal por tramo de 3 horas.

## Instalar

Descarga `lumio.apk` del [último release](https://github.com/A-Hallen/Lumio/releases/latest). Si tu teléfono es muy antiguo (32 bits) y no se instala, usa `lumio-32bit.apk`.

## Desarrollo

```sh
npm install
npm test            # motor de horarios, formatos, sincronizacion, actualizacion obligatoria, abanico
npm run typecheck
npx expo start
```

## Actualizar los horarios (sin sacar versión nueva)

Los horarios viven en `schedule/AAAA-MM.json`. La app los baja sola cuando hay internet y los guarda en el teléfono.

```sh
# copiando la tabla oficial tal cual (bloques "CTO 1", "CTO 20 y 21", filas de días y horas)
npm run schedule -- from-circuits 2026-12 tabla.txt
# si la tabla solo trae parte del mes (p. ej. del 17 al 30), conserva el resto con --merge
npm run schedule -- from-circuits 2026-11 tabla.txt --merge
# pegando la tabla vieja: una fila por día, 8 circuitos por fila ("19 21 1 20 2 19 21 1")
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

Un archivo de mes puede escribir los días de dos formas; la app acepta las dos y las trata igual:

- **Por circuito** (`"version": 2`, lo que genera `from-circuits`): `"17": { "1": ["09:00-15:00"], "20": ["06:00-09:00", "21:00-23:59"] }`. Cada circuito tiene sus propios rangos, así que varios circuitos pueden compartir horas (como "CTO 20 y 21") o no tener luz en todo el día (lista vacía) sin ningún caso especial. Cada rango debe encajar en los tramos de 3 horas (`00:01`/`00:00` y `23:59`/`24:00` valen como inicio y fin del día); si no, el validador lo dice y no publica nada.
- **Por tramo** (`"version": 1`): una fila de 8 celdas por día; cada celda es el circuito con luz, o una lista `[20, 21]` si son varios.

Las apps 0.1.5 solo entienden celdas con un circuito; las 0.1.6, además listas; el formato por circuito necesita la 0.1.7. Si publicas un mes que una versión antigua no entiende, esa versión lo ignora y sigue con el anterior.

## Actualización obligatoria

Normalmente la app solo avisa de una versión nueva. Para **exigirla** (por ejemplo, cuando cambia el formato de los horarios y las versiones viejas ya no sirven), pon una versión mínima en `schedule/index.json`:

```sh
npm run schedule -- build --min 0.2.0     # exigir la 0.2.0 o mayor
git add schedule src/data/bundled.ts && git commit -m "Actualización obligatoria 0.2.0" && git push
npm run schedule -- build --min none      # quitar la exigencia
```

- Las apps con una versión menor que `app.minVersion` muestran una pantalla de bloqueo con el botón de descarga y no se pueden usar hasta actualizar. La exigencia se guarda en el teléfono, así que sigue valiendo sin internet.
- `minVersion` sobrevive a los lanzamientos (el flujo de GitHub solo cambia `latest`).
- Solo se exige si `minVersion` no es mayor que `latest`: una versión mínima que todavía no se puede descargar nunca bloquea a nadie. **Publica primero el APK, luego sube el mínimo.**
- Solo funciona desde la 0.1.7: las versiones anteriores no conocen este mecanismo y solo ven el aviso normal.
