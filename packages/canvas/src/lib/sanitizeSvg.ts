import DOMPurify from "dompurify";

/**
 * Sanitizes an SVG string using DOMPurify with the SVG profile.
 */
export function sanitizeSvgString(rawSvg: string): string {
  if (!rawSvg) {
    return "";
  }
  return DOMPurify.sanitize(rawSvg, { USE_PROFILES: { svg: true } });
}
