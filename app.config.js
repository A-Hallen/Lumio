// La version vive solo en package.json; de ahi salen la version visible y el versionCode.
const pkg = require('./package.json');
const [major, minor, patch] = pkg.version.split('.').map(Number);

module.exports = ({ config }) => ({
  ...config,
  version: pkg.version,
  android: { ...config.android, versionCode: major * 10000 + minor * 100 + patch },
  plugins: [...(config.plugins ?? []), './plugins/with-release-signing'],
});
