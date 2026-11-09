/** Nombre del APK de 32 bits (telefonos antiguos); `lumio.apk` es el de 64 bits, el de casi todos los telefonos. */
export const APK_32BIT = 'lumio-32bit.apk';

/** Si el telefono solo corre 32 bits, cambia el enlace de `lumio.apk` por el de 32 bits. Ante la duda deja el de 64. */
export function apkForArchitectures(url: string, archs: readonly string[] | null | undefined): string {
  const only32 = !!archs && archs.length > 0 && !archs.includes('arm64-v8a') && archs.includes('armeabi-v7a');
  return only32 ? url.replace(/lumio\.apk$/, APK_32BIT) : url;
}
