// Firma el APK de release con la clave de Lumio cuando existen las variables LUMIO_KEYSTORE*.
// Sin ellas (build local) cae a la clave debug. La MISMA clave debe usarse en todas las versiones
// o Android no dejara actualizar la app encima de la anterior.
const { withAppBuildGradle } = require('@expo/config-plugins');

module.exports = (config) =>
  withAppBuildGradle(config, (cfg) => {
    let g = cfg.modResults.contents;
    if (g.includes('LUMIO_KEYSTORE')) return cfg;

    const debugEnd = "keyPassword 'android'\n        }\n";
    const i = g.indexOf(debugEnd);
    if (i < 0) throw new Error('with-release-signing: no encuentro el bloque signingConfigs.debug');
    const release = `        release {
            if (System.getenv('LUMIO_KEYSTORE')) {
                storeFile file(System.getenv('LUMIO_KEYSTORE'))
                storePassword System.getenv('LUMIO_KEYSTORE_PASSWORD')
                keyAlias System.getenv('LUMIO_KEY_ALIAS')
                keyPassword System.getenv('LUMIO_KEY_PASSWORD')
            }
        }
`;
    g = g.slice(0, i + debugEnd.length) + release + g.slice(i + debugEnd.length);

    const at = g.indexOf('signingConfig signingConfigs.debug', g.indexOf('release {', g.indexOf('buildTypes {')));
    if (at < 0) throw new Error('with-release-signing: no encuentro buildTypes.release');
    g = g.slice(0, at) + "signingConfig System.getenv('LUMIO_KEYSTORE') ? signingConfigs.release : signingConfigs.debug" + g.slice(at + 'signingConfig signingConfigs.debug'.length);
    cfg.modResults.contents = g;
    return cfg;
  });
