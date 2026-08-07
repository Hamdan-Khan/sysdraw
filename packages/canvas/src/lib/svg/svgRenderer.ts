import { CanvasNodeData } from "@/components/nodes/createNodeTypes";
import { CanvasStoreState } from "@/store/store";
import { getNodesBounds } from "@xyflow/react";
import { getGridDefs, getMarkerDefs } from "./background";
import { renderEdgesGroup } from "./edges";
import { renderGroupNode, renderStandardNode } from "./nodes";
import { createSvgElement } from "./utils";

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

  const absoluteNodesMap = new Map(nodes.map((n) => [n.id, n]));

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

  let gridRects: {
    minorRect: SVGRectElement;
    majorRect: SVGRectElement;
  } | null = null;

  // if grid is enabled, get the grid patterns and background rects
  if (store.grid) {
    const { patterns, minorRect, majorRect } = getGridDefs(vx, vy, vw, vh);
    patterns.forEach((pattern) => defsEl.appendChild(pattern));
    // we'll set these after drawing bg fill
    gridRects = {
      minorRect,
      majorRect,
    };
  }

  if (store.edges.length > 0) {
    const markerDefs = getMarkerDefs(store.edges);
    if (markerDefs) {
      markerDefs.forEach((marker) => defsEl.appendChild(marker));
    }
  }

  rootSvg.appendChild(defsEl);

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

  // todo: determine edges and nodes layering based on the store state and their stacking order
  // currently nodes render on top of edges
  const edgesGroup = renderEdgesGroup(store.edges, absoluteNodesMap);
  if (edgesGroup) {
    rootSvg.appendChild(edgesGroup);
  }

  // draw all nodes
  if (nodes.length > 0) {
    const nodesGroup = createSvgElement("g", { id: "nodes-group" });

    nodes.forEach((node) => {
      const nodeData = node.data as CanvasNodeData;
      const { position, measured } = node;
      const nodeHeight = measured?.height || 0;
      const nodeWidth = measured?.width || 0;

      const { kind } = nodeData;

      const nodeG = createSvgElement("g", {
        transform: `translate(${position.x}, ${position.y})`,
      });

      if (kind === "group") {
        const { rect, label } = renderGroupNode(
          nodeData,
          nodeWidth,
          nodeHeight,
        );
        if (rect) nodeG.appendChild(rect);
        if (label) nodeG.appendChild(label);
      } else {
        const { icon, text } = renderStandardNode(
          nodeData,
          nodeWidth,
          nodeHeight,
        );
        if (icon) nodeG.appendChild(icon);
        if (text) nodeG.appendChild(text);
      }

      nodesGroup.appendChild(nodeG);
    });

    rootSvg.appendChild(nodesGroup);
  }

  const finalSvgString = new XMLSerializer().serializeToString(rootSvg);

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(finalSvgString)}`;
};
