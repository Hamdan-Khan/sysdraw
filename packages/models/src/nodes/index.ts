import type { BaseNodeData } from "../types";
import { databaseDefault } from "./Database";
import { loadBalancerDefault } from "./LoadBalancer";

/**
 * list of all registered nodes
 */
enum RegisteredNodes {
  DATABASE = "database",
  LOAD_BALANCER = "load-balancer",
}

/**
 * Map of all registered nodes with default data values
 */
const defaultNodesMap: Record<RegisteredNodes, BaseNodeData> = {
  [RegisteredNodes.DATABASE]: databaseDefault,
  [RegisteredNodes.LOAD_BALANCER]: loadBalancerDefault,
};

export { defaultNodesMap, RegisteredNodes };
