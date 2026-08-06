import {
  CANVAS_GRID_MAJOR_GAP,
  CANVAS_GRID_MINOR_GAP,
  CANVAS_MAJOR_GRID_COLOR,
} from "@/components/canvas/CanvasGrid";
import { CanvasNodeData } from "@/components/nodes/createNodeTypes";
import {
  GROUP_BG_COLOR,
  GROUP_BORDER_COLOR,
  GROUP_BORDER_RADIUS,
  GROUP_BORDER_WIDTH,
  GROUP_LABEL_FONT_SIZE,
  GROUP_LABEL_HEIGHT,
  GROUP_LABEL_LEFT,
  GROUP_LABEL_PADDING_X,
  GROUP_LABEL_TOP,
  GROUP_STROKE_DASHARRAY,
} from "@/components/nodes/group/GenericGroup";
import {
  LABEL_EXTRA_HEIGHT,
  NODE_PADDING,
  NODE_TITLE_COLOR,
  NODE_TITLE_FONT_FAMILY,
  NODE_TITLE_FONT_SIZE,
  NODE_TITLE_FONT_WEIGHT,
} from "@/components/nodes/node/NodeWrapper";
import { sanitizeSvgString } from "@/lib/sanitizeSvg";
import { CanvasStoreState } from "@/store/store";
import { getNodesBounds } from "@xyflow/react";

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

function createSvgElement<K extends keyof SVGElementTagNameMap>(
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

function createSvgIconNode(
  rawSvg: string,
  x: number,
  y: number,
  w: number,
  h: number,
): SVGElement | null {
  const cleanStr = sanitizeSvgString(rawSvg).trim();
  if (cleanStr) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(cleanStr, "image/svg+xml");
    const svgEl = doc.querySelector("svg");
    if (svgEl) {
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

function appendGridDefs(
  defsEl: SVGDefsElement,
  vx: number,
  vy: number,
  vw: number,
  vh: number,
): { minorRect: SVGRectElement; majorRect: SVGRectElement } {
  const minorColor = "rgba(150, 150, 150, 0.2)";
  const majorColor = CANVAS_MAJOR_GRID_COLOR;
  const lineWidth = 1;

  const minorPatternId = "svg-renderer-grid-minor";
  const majorPatternId = "svg-renderer-grid-major";

  // minor grid pattern definition
  const minorPattern = createSvgElement("pattern", {
    id: minorPatternId,
    width: CANVAS_GRID_MINOR_GAP,
    height: CANVAS_GRID_MINOR_GAP,
    patternUnits: "userSpaceOnUse",
  });
  const minorPath = createSvgElement("path", {
    d: `M ${CANVAS_GRID_MINOR_GAP} 0 L 0 0 0 ${CANVAS_GRID_MINOR_GAP}`,
    fill: "none",
    stroke: minorColor,
    "stroke-width": lineWidth,
  });
  minorPattern.appendChild(minorPath);
  defsEl.appendChild(minorPattern);

  // major grid pattern definition
  const majorPattern = createSvgElement("pattern", {
    id: majorPatternId,
    width: CANVAS_GRID_MAJOR_GAP,
    height: CANVAS_GRID_MAJOR_GAP,
    patternUnits: "userSpaceOnUse",
  });
  const majorPath = createSvgElement("path", {
    d: `M ${CANVAS_GRID_MAJOR_GAP} 0 L 0 0 0 ${CANVAS_GRID_MAJOR_GAP}`,
    fill: "none",
    stroke: majorColor,
    "stroke-width": lineWidth,
  });
  majorPattern.appendChild(majorPath);
  defsEl.appendChild(majorPattern);

  const minorRect = createSvgElement("rect", {
    x: vx,
    y: vy,
    width: vw,
    height: vh,
    fill: `url(#${minorPatternId})`,
  });

  const majorRect = createSvgElement("rect", {
    x: vx,
    y: vy,
    width: vw,
    height: vh,
    fill: `url(#${majorPatternId})`,
  });

  return { minorRect, majorRect };
}

// temp
const EXPORT_PADDING = 40;

/**
 * renders xyflow nodes and edges into svg using the store state.
 */
export const renderToSvg = (
  store: CanvasStoreState,
  width: number,
  height: number,
  bgColor?: string,
): string => {
  // compute absolute canvas positions for child nodes that are positioned relative
  // to their parent nodes by default
  const nodes = store.nodes.map((node) => {
    if (node.parentId) {
      const parent = store.nodesMap.get(node.parentId);
      return {
        ...node,
        position: {
          x: node.position.x + (parent?.position.x ?? 0),
          y: node.position.y + (parent?.position.y ?? 0),
        },
      };
    }
    return node;
  });

  // entire canvas coordinates
  const bounds = getNodesBounds(nodes);

  // get the viewbox coordinates and expand by the padding size
  const vx = bounds.x - EXPORT_PADDING;
  const vy = bounds.y - EXPORT_PADDING;
  const vw = bounds.width + EXPORT_PADDING * 2;
  const vh = bounds.height + EXPORT_PADDING * 2;

  // root SVG element
  const rootSvg = createSvgElement("svg", {
    width,
    height,
    viewBox: `${vx} ${vy} ${vw} ${vh}`,
  });

  const defsEl = createSvgElement("defs");
  let hasDefs = false;

  let gridRects: {
    minorRect: SVGRectElement;
    majorRect: SVGRectElement;
  } | null = null;

  if (store.grid) {
    gridRects = appendGridDefs(defsEl, vx, vy, vw, vh);
    hasDefs = true;
  }

  if (hasDefs) {
    rootSvg.appendChild(defsEl);
  }

  // background fill rect
  if (bgColor) {
    const bgRect = createSvgElement("rect", {
      x: vx,
      y: vy,
      width: vw,
      height: vh,
      fill: bgColor,
    });
    rootSvg.appendChild(bgRect);
  }

  // grid background pattern rects
  if (gridRects) {
    rootSvg.appendChild(gridRects.minorRect);
    rootSvg.appendChild(gridRects.majorRect);
  }

  // draw all nodes
  if (nodes.length > 0) {
    const nodesGroup = createSvgElement("g", { id: "nodes-group" });

    nodes.forEach((node) => {
      const nodeData: CanvasNodeData = node.data;
      const { position, measured } = node;
      const nodeHeight = measured?.height || 0;
      const nodeWidth = measured?.width || 0;

      const { kind, label } = nodeData;

      const nodeG = createSvgElement("g", {
        transform: `translate(${position.x}, ${position.y})`,
      });

      if (kind === "group") {
        const groupRect = createSvgElement("rect", {
          width: nodeWidth - GROUP_BORDER_WIDTH,
          height: nodeHeight - GROUP_BORDER_WIDTH,
          fill: GROUP_BG_COLOR,
          stroke: GROUP_BORDER_COLOR,
          "stroke-width": GROUP_BORDER_WIDTH,
          "stroke-dasharray": GROUP_STROKE_DASHARRAY,
          rx: GROUP_BORDER_RADIUS,
        });
        nodeG.appendChild(groupRect);

        if (label) {
          const textWidth = Math.max(
            20,
            label.length * (GROUP_LABEL_FONT_SIZE * 0.55),
          );
          const pillWidth = Math.round(textWidth + GROUP_LABEL_PADDING_X * 2);
          const pillHeight = GROUP_LABEL_HEIGHT;
          const lx = GROUP_LABEL_LEFT;
          const ly = GROUP_LABEL_TOP;
          const labelColor = nodeData.color || "#0f172a";

          const labelG = createSvgElement("g");
          const pillRect = createSvgElement("rect", {
            x: lx,
            y: ly,
            width: pillWidth,
            height: pillHeight,
            fill: GROUP_BG_COLOR,
            stroke: GROUP_BORDER_COLOR,
            "stroke-width": 1,
            rx: pillHeight / 2,
            ry: pillHeight / 2,
            "shape-rendering": "geometricPrecision",
          });
          labelG.appendChild(pillRect);

          const labelText = createSvgElement("text", {
            x: lx + pillWidth / 2,
            y: ly + pillHeight / 2,
            "text-anchor": "middle",
            "dominant-baseline": "central",
            "font-family": "Inter, system-ui, sans-serif",
            "font-size": GROUP_LABEL_FONT_SIZE,
            "font-weight": "bold",
            fill: labelColor,
          });
          labelText.textContent = label;
          labelG.appendChild(labelText);

          nodeG.appendChild(labelG);
        }
      } else {
        // standard nodes rendering: icon + optional title text beneath it
        const { title, icon } = nodeData;
        const hasTitle = Boolean(title);
        const padding = NODE_PADDING;

        const contentHeight = hasTitle
          ? Math.max(20, nodeHeight - LABEL_EXTRA_HEIGHT)
          : nodeHeight;
        const iconWidth = Math.max(0, nodeWidth - padding * 2);
        const iconHeight = Math.max(0, contentHeight - padding * 2);
        const iconX = padding;
        const iconY = padding;

        if (icon?.kind === "svg" && icon.value) {
          const iconNode = createSvgIconNode(
            icon.value,
            iconX,
            iconY,
            iconWidth,
            iconHeight,
          );
          if (iconNode) {
            nodeG.appendChild(iconNode);
          }
        } else if (icon?.kind === "url" && icon.value) {
          const img = createSvgElement("image", {
            href: icon.value,
            x: iconX,
            y: iconY,
            width: iconWidth,
            height: iconHeight,
            preserveAspectRatio: "xMidYMid meet",
          });
          nodeG.appendChild(img);
        }

        if (title) {
          const titleText = createSvgElement("text", {
            x: nodeWidth / 2,
            y: contentHeight + 10,
            "text-anchor": "middle",
            "dominant-baseline": "central",
            "font-family": NODE_TITLE_FONT_FAMILY,
            "font-size": NODE_TITLE_FONT_SIZE,
            "font-weight": NODE_TITLE_FONT_WEIGHT,
            fill: NODE_TITLE_COLOR,
          });
          titleText.textContent = title;
          nodeG.appendChild(titleText);
        }
      }

      nodesGroup.appendChild(nodeG);
    });

    rootSvg.appendChild(nodesGroup);
  }

  const finalSvgString = new XMLSerializer().serializeToString(rootSvg);
  console.log(finalSvgString);

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(finalSvgString)}`;
};
