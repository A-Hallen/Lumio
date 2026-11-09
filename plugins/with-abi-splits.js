// Un APK por arquitectura: cada telefono solo descarga las librerias nativas que usa.
// Con las dos juntas el APK pesaba 52 MB; separados quedan en torno a 33 MB (64 bits) y 26 MB (32 bits).
const { withAppBuildGradle } = require('@expo/config-plugins');

module.exports = (config) =>
  withAppBuildGradle(config, (cfg) => {
    let g = cfg.modResults.contents;
    if (g.includes('universalApk')) return cfg;

    const head = 'android {\n';
    const i = g.indexOf(head);
    if (i < 0) throw new Error('with-abi-splits: no encuentro el bloque android {');
    const splits = `    splits {
        abi {
            enable true
            reset()
            include 'arm64-v8a', 'armeabi-v7a'
            universalApk false
        }
    }
`;
    cfg.modResults.contents = g.slice(0, i + head.length) + splits + g.slice(i + head.length);
    return cfg;
  });
