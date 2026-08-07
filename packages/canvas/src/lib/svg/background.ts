import {
  CANVAS_GRID_MAJOR_GAP,
  CANVAS_GRID_MINOR_GAP,
  CANVAS_MAJOR_GRID_COLOR,
} from "@/components/canvas/CanvasGrid";
import { Edge, MarkerType } from "@xyflow/react";
import { createSvgElement } from "./utils";

/**
 * creates and returns marker def elements for edges, or null if no markers are needed
 * @param edges - array of canvas edges
 * @returns array of SVG marker elements or null
 */
export function getMarkerDefs(edges: Edge[]): SVGElement[] | null {
  // collect unique marker types required by the edges
  const neededMarkers = new Set<string>();

  for (const edge of edges) {
    // we only have arrow head at the end right now, might need to add markerStart later
    if (edge.markerEnd) {
      // custom arrow heads are of type string
      const markerType =
        typeof edge.markerEnd === "string"
          ? edge.markerEnd
          : edge.markerEnd.type;
      if (markerType) {
        neededMarkers.add(markerType);
      }
    }
  }

  // if there are no arrow heads
  if (neededMarkers.size === 0) {
    return null;
  }

  const markers: SVGElement[] = [];

  // todo: fix alignment of both open & closed arrows
  // closed arrow marker def
  if (
    neededMarkers.has(MarkerType.ArrowClosed) ||
    neededMarkers.has("arrowclosed")
  ) {
    const marker = createSvgElement("marker", {
      id: "svg-renderer-marker-arrowclosed",
      viewBox: "0 0 10 10",
      refX: 5,
      refY: 5,
      markerWidth: 6,
      markerHeight: 6,
      orient: "auto-start-reverse",
    });
    const path = createSvgElement("path", {
      d: "M 0 0 L 10 5 L 0 10 z",
      fill: "#94a3b8",
    });
    marker.appendChild(path);
    markers.push(marker);
  }

  // open arrow marker def
  if (neededMarkers.has(MarkerType.Arrow) || neededMarkers.has("arrow")) {
    const marker = createSvgElement("marker", {
      id: "svg-renderer-marker-arrow",
      viewBox: "0 0 10 10",
      refX: 5,
      refY: 5,
      markerWidth: 6,
      markerHeight: 6,
      orient: "auto-start-reverse",
    });
    const polyline = createSvgElement("polyline", {
      points: "0,0 10,5 0,10",
      fill: "none",
      stroke: "#94a3b8",
      "stroke-width": 1.5,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    });
    marker.appendChild(polyline);
    markers.push(marker);
  }

  return markers.length > 0 ? markers : null;
}

/**
 * creates and returns grid pattern def elements and grid background rects
 */
export function getGridDefs(
  vx: number,
  vy: number,
  vw: number,
  vh: number,
): {
  patterns: SVGElement[];
  minorRect: SVGRectElement;
  majorRect: SVGRectElement;
} {
  // grid color styling and dimensions
  const minorColor = "rgba(150, 150, 150, 0.2)";
  const majorColor = CANVAS_MAJOR_GRID_COLOR;
  const lineWidth = 1;

  const minorPatternId = "svg-renderer-grid-minor";
  const majorPatternId = "svg-renderer-grid-major";

  // minor grid pattern def
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

  // major grid pattern def
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

  return {
    patterns: [minorPattern, majorPattern],
    minorRect,
    majorRect,
  };
}
