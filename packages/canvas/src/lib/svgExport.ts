import {
  EDGE_LABEL_CLASS_ID,
  EDGE_PATH_CLASS_ID,
  GROUP_CONTAINER_CLASS_ID,
  GROUP_LABEL_CLASS_ID,
  HANDLE_DOT_CLASS_ID,
  NODE_CLASS_ID,
  NODE_ICON_CLASS_ID,
  NODE_WRAPPER_CLASS_ID,
} from "@sysdraw/common";
import { CANVAS_GRID_BG_COLOR } from "../components/canvas/CanvasGrid";
import { EXPORT_CANVAS_GRID_ID } from "../components/export/ExportRenderer";

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}

/**
 * checks whether a CSS color string represents a visible, non-transparent color
 */
function isVisibleColor(color: string | undefined | null): boolean {
  if (!color) {
    return false;
  }
  const trimmed = color.trim().toLowerCase();
  if (trimmed === "" || trimmed === "none" || trimmed === "transparent") {
    return false;
  }
  const alphaMatch = trimmed.match(/rgba?\([^)]+,\s*([\d.]+)\)/);
  if (alphaMatch) {
    return parseFloat(alphaMatch[1]) > 0;
  }
  return true;
}

/**
 * extracts translate coordinates (x, y) from an element's inline transform style
 */
function extractTranslate(el: HTMLElement): { x: number; y: number } {
  const transformStyle = el.style.transform;
  if (!transformStyle) return { x: 0, y: 0 };
  const match = transformStyle.match(
    /translate(?:3d)?\(([-+\d.]+)(?:px)?,\s*([-+\d.]+)/,
  );
  if (match) {
    return {
      x: parseFloat(match[1]) || 0,
      y: parseFloat(match[2]) || 0,
    };
  }
  return { x: 0, y: 0 };
}

const SVG_SHAPE_SELECTOR = "path, polyline, polygon, circle, rect, line";

interface BakeStyleOptions {
  /** optional fallback pattern fill color (for canvas background grid lines) */
  patternColor?: string;
  /** whether the shape is an edge */
  isEdge?: boolean;
}

/**
 * reads computed css styles (stroke, fill, etc.) of original DOM shape elements and
 * applies matching svg attributes directly onto corresponding cloned svg elements
 */
function bakeComputedStyles(
  original: Element,
  cloned: Element,
  opts?: BakeStyleOptions,
): void {
  const origShapes = opts?.isEdge
    ? [original]
    : original.querySelectorAll(SVG_SHAPE_SELECTOR);
  const clonedShapes = opts?.isEdge
    ? [cloned]
    : cloned.querySelectorAll(SVG_SHAPE_SELECTOR);

  origShapes.forEach((origShape, idx) => {
    const clonedShape = clonedShapes[idx];
    if (!clonedShape) return;

    const style = window.getComputedStyle(origShape);
    let { stroke, strokeWidth, fill } = style;

    const isInsidePattern = Boolean(origShape.closest("pattern"));

    if (isInsidePattern && opts?.patternColor) {
      const tagName = origShape.tagName.toLowerCase();
      if (tagName === "path" || tagName === "line") {
        if (!isVisibleColor(stroke)) {
          stroke = opts.patternColor;
        }
        fill = "none";
      } else if (tagName === "circle") {
        if (!isVisibleColor(fill)) {
          fill = opts.patternColor;
        }
      }
    }

    if (isVisibleColor(stroke)) {
      clonedShape.setAttribute("stroke", stroke);
    }
    if (strokeWidth && strokeWidth !== "0px") {
      clonedShape.setAttribute("stroke-width", strokeWidth);
    }

    // for visible fills, apply computed color unless it relies on pattern fill url
    // for elements inside <pattern>, explicitly preserve fill="none" so grid lines do not fill solid
    const isPatternUrl = clonedShape.getAttribute("fill")?.startsWith("url(");
    if (isVisibleColor(fill) && !isPatternUrl) {
      clonedShape.setAttribute("fill", fill);
    } else if (fill === "none" && isInsidePattern) {
      clonedShape.setAttribute("fill", "none");
    }
  });
}

function extractNodeLabel(_htmlNode: HTMLElement): string | null {
  // const explicitLabel = htmlNode.querySelector("[data-svg-label]");
  // if (explicitLabel && explicitLabel.textContent?.trim()) {
  //   return explicitLabel.textContent.trim();
  // }
  // todo: need to implement labels on standard nodes
  return null;
}

function renderGroupNode(groupContainer: HTMLElement): string {
  const wrapperEl = groupContainer.closest<HTMLElement>(
    `.${NODE_WRAPPER_CLASS_ID}`,
  );
  if (!wrapperEl) {
    throw new Error(
      `Group node wrapper not found for group container ${groupContainer}`,
    );
  }
  const { x: nx, y: ny } = extractTranslate(wrapperEl);
  const nw = wrapperEl.offsetWidth;
  const nh = wrapperEl.offsetHeight;

  let nodeSvg = `<g transform="translate(${nx}, ${ny})">\n`;

  const groupStyle = window.getComputedStyle(groupContainer);
  const groupBg = groupStyle.backgroundColor;
  const groupBorderColor = groupStyle.borderColor;
  const groupBorderRadius = parseFloat(groupStyle.borderRadius);
  const isDashed = groupStyle.borderStyle === "dashed";
  const dashAttr = isDashed ? 'stroke-dasharray="4 4"' : "";

  // main group background rect
  nodeSvg += `<rect width="${nw}" height="${nh}" fill="${groupBg}" stroke="${groupBorderColor}" ${dashAttr} rx="${groupBorderRadius}" />\n`;

  // group label badge pill
  const labelEl = groupContainer.querySelector(`.${GROUP_LABEL_CLASS_ID}`);

  if (labelEl) {
    const text = labelEl.textContent?.trim();
    if (text) {
      const labelBbox = labelEl.getBoundingClientRect();
      const nodeBbox = wrapperEl.getBoundingClientRect();

      const lx = labelBbox.left - nodeBbox.left;
      const ly = labelBbox.top - nodeBbox.top;
      const lw = labelBbox.width;
      const lh = labelBbox.height;

      const labelStyle = window.getComputedStyle(labelEl);
      const labelBg = isVisibleColor(labelStyle.backgroundColor)
        ? labelStyle.backgroundColor
        : groupBg;
      const labelBorderColor = isVisibleColor(labelStyle.borderColor)
        ? labelStyle.borderColor
        : groupBorderColor;
      const labelTextColor = isVisibleColor(labelStyle.color)
        ? labelStyle.color
        : "";
      const labelRx = parseFloat(labelStyle.borderRadius);

      nodeSvg += `<g class="group-label">\n`;
      nodeSvg += `<rect x="${lx}" y="${ly}" width="${lw}" height="${lh}" fill="${labelBg}" stroke="${labelBorderColor}" rx="${labelRx}" />\n`;
      nodeSvg += `<text x="${lx + lw / 2}" y="${ly + lh / 2}" text-anchor="middle" dominant-baseline="central" font-family="Inter, system-ui, sans-serif" font-size="12" font-weight="bold" fill="${labelTextColor}">${escapeXml(text)}</text>\n`;
      nodeSvg += `</g>\n`;
    }
  }
  nodeSvg += `</g>\n`;
  return nodeSvg;
}

function renderStandardNode(htmlNode: HTMLElement): string {
  const wrapperEl = htmlNode.closest<HTMLElement>(`.${NODE_WRAPPER_CLASS_ID}`);
  if (!wrapperEl) {
    throw new Error(`No wrapper found for node ${htmlNode}`);
  }
  const { x: nx, y: ny } = extractTranslate(wrapperEl);
  const nw = wrapperEl.offsetWidth;
  const nh = wrapperEl.offsetHeight;
  const labelText = extractNodeLabel(wrapperEl);

  let nodeSvg = `<g transform="translate(${nx}, ${ny})">\n`;

  // render main node icon if present
  const iconSvg = htmlNode.querySelector<SVGElement>(
    `.${NODE_ICON_CLASS_ID} svg`,
  );
  if (iconSvg) {
    const iconClone = iconSvg.cloneNode(true) as SVGElement;
    iconClone.setAttribute("width", String(nw));
    iconClone.setAttribute("height", String(nh));
    bakeComputedStyles(iconSvg, iconClone);
    nodeSvg += `${iconClone.outerHTML}\n`;
  } else {
    nodeSvg += `<rect width="${nw}" height="${nh}" fill="#ffffff" stroke="#e2e8f0" rx="8" />\n`;
  }

  // render handler dots
  const dotSvgs = htmlNode.querySelectorAll<SVGElement>(
    `.${HANDLE_DOT_CLASS_ID}`,
  );
  dotSvgs.forEach((dotSvg) => {
    const dotClone = dotSvg.cloneNode(true) as SVGElement;
    bakeComputedStyles(dotSvg, dotClone);
    nodeSvg += `${dotClone.outerHTML}\n`;
  });

  if (labelText) {
    const fontHeight = 18;
    nodeSvg += `<text x="${nw / 2}" y="${nh + fontHeight}" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="13" font-weight="500" fill="#0f172a">${escapeXml(labelText)}</text>\n`;
  }

  nodeSvg += `</g>\n`;
  return nodeSvg;
}

function collectDefsAndMarkers(
  elements: NodeListOf<SVGDefsElement | SVGMarkerElement>,
): string {
  let content = "";
  elements.forEach((def) => {
    const clonedDef = def.cloneNode(true) as SVGElement;
    bakeComputedStyles(def, clonedDef);
    content += clonedDef.innerHTML + "\n";
  });
  return content;
}

/** renders the native canvas background grid lines from DOM background SVG elements */
function renderBackgroundGrid(flowEl: HTMLElement): string {
  const minorGridId = `${EXPORT_CANVAS_GRID_ID}-minor-grid-lines`;
  const majorGridId = `${EXPORT_CANVAS_GRID_ID}-major-grid-lines`;

  const bgElements = flowEl.querySelectorAll(
    `[id*="${minorGridId}"], [id*="${majorGridId}"]`,
  );
  if (bgElements.length === 0) return "";

  let gridSvg = "";
  // create clones of minor and major grids
  bgElements.forEach((el) => {
    const bgSvg = el.closest("svg");
    if (!bgSvg) {
      return;
    }
    const clone = bgSvg.cloneNode(true) as HTMLElement;
    bakeComputedStyles(bgSvg, clone, { patternColor: CANVAS_GRID_BG_COLOR });
    gridSvg += `<!-- Background Grid -->\n<g class="bg-grid-layer">\n${clone.innerHTML}\n</g>\n`;
  });

  return gridSvg;
}

function renderGroupNodesLayer(groupNodesEls: HTMLElement[]): string {
  if (groupNodesEls.length === 0) {
    return "";
  }
  let layerSvg = `<!-- group nodes layer -->\n<g class="group-nodes-layer">\n`;
  groupNodesEls.forEach((nodeEl) => {
    layerSvg += renderGroupNode(nodeEl);
  });
  layerSvg += `</g>\n`;
  return layerSvg;
}

function renderEdgesLayer(flowEl: HTMLElement): string {
  const edgePaths = flowEl.querySelectorAll<SVGPathElement>(
    `.${EDGE_PATH_CLASS_ID}`,
  );
  if (edgePaths.length === 0) return "";

  let layerSvg = `  <!-- Edges Layer -->\n  <g class="edges-layer">\n`;

  edgePaths.forEach((path) => {
    const clonedPath = path.cloneNode(true) as SVGPathElement;
    bakeComputedStyles(path, clonedPath, { isEdge: true });
    layerSvg += `${clonedPath.outerHTML}\n`;
  });

  layerSvg += `  </g>\n`;
  return layerSvg;
}

function renderStandardNodesLayer(standardNodesEls: HTMLElement[]): string {
  if (standardNodesEls.length === 0) return "";

  let layerSvg = `  <!-- Nodes Layer -->\n  <g class="nodes-layer">\n`;
  standardNodesEls.forEach((nodeEl) => {
    layerSvg += renderStandardNode(nodeEl);
  });
  layerSvg += `  </g>\n`;
  return layerSvg;
}

function renderEdgeLabelsLayer(
  flowEl: HTMLElement,
  viewportEl: HTMLElement | null,
): string {
  const edgeLabelElements: HTMLElement[] = Array.from(
    flowEl.querySelectorAll<HTMLElement>(`.${EDGE_LABEL_CLASS_ID}`),
  );

  if (edgeLabelElements.length === 0) {
    return "";
  }

  let layerSvg = `<!-- Edge Labels Layer -->\n  <g class="edge-labels-layer">\n`;

  edgeLabelElements.forEach((labelEl) => {
    const text = labelEl.textContent?.trim();
    if (!text) {
      return;
    }

    const labelBbox = labelEl.getBoundingClientRect();
    const viewportBbox = viewportEl
      ? viewportEl.getBoundingClientRect()
      : { left: 0, top: 0 };
    const lx = labelBbox.left - viewportBbox.left + labelBbox.width / 2;
    const ly = labelBbox.top - viewportBbox.top + labelBbox.height / 2;

    const style = window.getComputedStyle(labelEl);
    const bg = isVisibleColor(style.backgroundColor)
      ? style.backgroundColor
      : "#ffffff";
    const color = isVisibleColor(style.color) ? style.color : "#0f172a";

    const lw = Math.max(16, labelBbox.width);
    const lh = Math.max(14, labelBbox.height);
    const rx = parseFloat(style.borderRadius) || 4;

    layerSvg += `<g class="edge-label">\n`;
    layerSvg += `<rect x="${lx - lw / 2}" y="${ly - lh / 2}" width="${lw}" height="${lh}" fill="${bg}" rx="${rx}" />\n`;
    layerSvg += `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="central" font-family="Inter, system-ui, sans-serif" font-size="12" font-weight="500" fill="${color}">${escapeXml(text)}</text>\n`;
    layerSvg += `</g>\n`;
  });

  layerSvg += `</g>\n`;
  return layerSvg;
}

/**
 * serializes a live xyflow DOM tree into a SVG string data URL
 *
 * steps:
 * 1. render background fill rectangle
 * 2. collect defs and markers from DOM
 * 3. render background grid SVG layer
 * 4. add viewport transform `<g>` group
 * 5. render group nodes layer
 * 6. render edges layer
 * 7. render standard nodes layer (icons + labels + handles)
 * 8. render edge labels layer (on top of nodes and edges)
 * 9. close viewport transform `<g>` group
 * 10. wrap in root `<svg>` tag and format as encoded SVG data URL
 */
export function renderToNativeSvg(
  flowEl: HTMLElement,
  width: number,
  height: number,
  bgColor?: string,
): string {
  const viewportEl = flowEl.querySelector(
    ".react-flow__viewport",
  ) as HTMLElement | null;
  const { x: tx, y: ty } = viewportEl
    ? extractTranslate(viewportEl)
    : { x: 0, y: 0 };

  let svgContent = "";

  // background fill rect
  if (bgColor) {
    svgContent += `<rect width="${width}" height="${height}" fill="${bgColor}" />\n`;
  }

  // collect defs & markers (arrowheads) from DOM
  let defsContent = "";
  const allDefs = flowEl.querySelectorAll("defs");
  const standaloneMarkers = flowEl.querySelectorAll("marker");
  defsContent += collectDefsAndMarkers(allDefs);
  defsContent += collectDefsAndMarkers(standaloneMarkers);
  if (defsContent.trim()) {
    svgContent += `<defs>\n${defsContent}</defs>\n`;
  }

  // native Background Grid
  svgContent += renderBackgroundGrid(flowEl);

  // viewport transform group (matches canvas viewport translation)
  svgContent += `<g transform="translate(${tx}, ${ty})">\n`;

  // select group and standard node elements
  const groupNodesEls = Array.from(
    flowEl.querySelectorAll<HTMLElement>(`.${GROUP_CONTAINER_CLASS_ID}`),
  );
  const standardNodesEls = Array.from(
    flowEl.querySelectorAll<HTMLElement>(`.${NODE_CLASS_ID}`),
  );

  // group nodes layer (rendered before edges layer so group backgrounds stay behind edges)
  svgContent += renderGroupNodesLayer(groupNodesEls);

  // edges layer (rendered after group nodes to draw on top of them)
  svgContent += renderEdgesLayer(flowEl);

  // standard nodes layer (rendered after edges layer)
  svgContent += renderStandardNodesLayer(standardNodesEls);

  // edge labels layer (rendered after nodes layer so labels appear on top)
  svgContent += renderEdgeLabelsLayer(flowEl, viewportEl);

  // close viewport transform group
  svgContent += `</g>\n`;

  // root SVG assembly
  const finalSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
${svgContent}
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(finalSvg)}`;
}
