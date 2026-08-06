import { CanvasNodeData } from "@/components/nodes/createNodeTypes";
import { CanvasStoreState } from "@/store/store";
import { getNodesBounds } from "@xyflow/react";

const GORUP_BG_COLOR = "#e9e9e9";
const GORUP_BORDER_RADIUS = 12;
const GROUP_BORDER_COLOR = "#b3b3b3";
const GROUP_BORDER_WIDTH = 2;
const GROUP_STROKE_DASHARRAY = "6 6";

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
  const { nodes } = store;

  // entire canvas coordinates
  const bounds = getNodesBounds(nodes);

  // get the viewbox coordinates and expand by the padding size
  const vx = bounds.x - EXPORT_PADDING;
  const vy = bounds.y - EXPORT_PADDING;
  const vw = bounds.width + EXPORT_PADDING * 2;
  const vh = bounds.height + EXPORT_PADDING * 2;

  let svgContent = "";

  // background fill rect
  if (bgColor) {
    svgContent += `<rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" fill="${bgColor}" />\n`;
  }

  let nodesSvg = "";

  // draw all nodes
  nodes.forEach((node) => {
    const nodeData: CanvasNodeData = node.data;
    const { position, measured, height: nHeight, width: nWidth } = node;
    const { width: measuredWidth, height: measuredHeight } = measured || {};
    const nodeHeight = nHeight || measuredHeight || 0;
    const nodeWidth = nWidth || measuredWidth || 0;

    const { kind } = nodeData;

    let nodeSvg = "";

    if (kind === "group") {
      nodeSvg += `<g transform="translate(${position.x}, ${position.y})">`;
      nodeSvg += `<rect width="${nodeWidth}" height="${nodeHeight}" fill="${GORUP_BG_COLOR}" stroke="${GROUP_BORDER_COLOR}" stroke-width="${GROUP_BORDER_WIDTH}" stroke-dasharray="${GROUP_STROKE_DASHARRAY}" rx="${GORUP_BORDER_RADIUS}" />\n`;
      nodeSvg += `</g>`;
    } else {
      // Todo: implement svg rendering for standard nodes
    }

    nodesSvg += nodeSvg;
  });

  if (nodes.length > 0) {
    svgContent += `<g id="nodes-group">${nodesSvg}</g>`;
  }

  const finalSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${vx} ${vy} ${vw} ${vh}">${svgContent}</svg>`;
  console.log(finalSvg);

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(finalSvg)}`;
};
