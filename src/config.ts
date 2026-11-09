export const REPO = 'A-Hallen/Lumio';
// Sitio de descarga en Cloudflare Pages; el nombre exacto se confirma al desplegar.
export const SITE = 'https://lumio.pages.dev';

/** Orden de preferencia para bajar horarios y avisos de version; si uno falla se prueba el siguiente. */
export const MIRRORS = [
  `${SITE}/schedule`,
  `https://raw.githubusercontent.com/${REPO}/main/schedule`,
  `https://cdn.jsdelivr.net/gh/${REPO}@main/schedule`,
];

export const DEFAULT_CIRCUIT = 1;
export const APK_FALLBACK = `https://github.com/${REPO}/releases/latest/download/lumio.apk`;
