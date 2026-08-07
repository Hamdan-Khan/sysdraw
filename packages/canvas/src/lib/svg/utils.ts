import { sanitizeSvgString } from "../sanitizeSvg";

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

/**
 * creates an svg element with the given tag name and attributes
 * @param name - tag i.e. line, rect, def, path, etc
 * @param attrs - attributes to be set on the element
 * @returns SVG Element
 */
export function createSvgElement<K extends keyof SVGElementTagNameMap>(
  name: K,
  attrs?: Record<string, string | number>,
): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVG_NAMESPACE, name);
  // populate the element with attributes
  if (attrs) {
    for (const [key, val] of Object.entries(attrs)) {
      el.setAttribute(key, String(val));
    }
  }
  return el;
}

/**
 * convert raw svg string from the node's icon data into an HTML
 * svg element using the given position and size
 */
export function createSvgIconNode(
  rawSvg: string,
  x: number,
  y: number,
  w: number,
  h: number,
): SVGElement | null {
  // sanitize the string
  const cleanStr = sanitizeSvgString(rawSvg).trim();
  if (cleanStr) {
    // parse it into SVG element
    const parser = new DOMParser();
    const doc = parser.parseFromString(cleanStr, "image/svg+xml");
    const svgEl = doc.querySelector("svg");
    if (svgEl) {
      // clone it
      const importedSvg = document.importNode(svgEl, true);
      importedSvg.setAttribute("x", String(x));
      importedSvg.setAttribute("y", String(y));
      importedSvg.setAttribute("width", String(w));
      importedSvg.setAttribute("height", String(h));
      return importedSvg;
    }
  }
  return null;
}
