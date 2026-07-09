import type { BaseEdgeData } from "../types";
import { httpCallDefaults } from "./Http";

/**
 * list of all registered edges
 */
enum RegisteredEdges {
  HTTP_CALL = "http-call",
}

/**
 * Map of all registered edges with default data values
 */
const defaultEdgesMap: Record<RegisteredEdges, BaseEdgeData> = {
  [RegisteredEdges.HTTP_CALL]: httpCallDefaults,
};

export { defaultEdgesMap, RegisteredEdges };
