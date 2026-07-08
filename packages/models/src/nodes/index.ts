import type { BaseNodeData } from "../types";
import { databaseDefaults } from "./Database";
import { loadBalancerDefaults } from "./LoadBalancer";

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
const defaultNodesMap: Record<RegisteredNodes, () => BaseNodeData> = {
  [RegisteredNodes.DATABASE]: databaseDefaults,
  [RegisteredNodes.LOAD_BALANCER]: loadBalancerDefaults,
};

export { defaultNodesMap, RegisteredNodes };
