import type { BaseEdgeData } from "../types";

/**
 * list of all registered edge shape types
 */
enum RegisteredEdges {
  STRAIGHT = "straight",
  STEP = "step",
  SMOOTHSTEP = "smoothstep",
  BEZIER = "bezier",
}

/**
 * map of all registered edge types with default data values
 */
const defaultEdgesMap: Record<RegisteredEdges, BaseEdgeData> = {
  [RegisteredEdges.STRAIGHT]: { label: "Straight" },
  [RegisteredEdges.STEP]: { label: "Step" },
  [RegisteredEdges.SMOOTHSTEP]: { label: "Smooth Step" },
  [RegisteredEdges.BEZIER]: { label: "Bezier" },
};

export { defaultEdgesMap, RegisteredEdges };
