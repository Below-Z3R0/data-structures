/**
 * Devuelve la URL base del sitio.
 * En produccion usa NEXT_PUBLIC_SITE_URL, en desarrollo localhost:3000.
 */
export function getSiteURL(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    // Asegurar que termina sin trailing slash
    return siteUrl.replace(/\/$/, "");
  }
  return "http://localhost:3000";
}
