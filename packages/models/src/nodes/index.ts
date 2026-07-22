import { Position } from "@xyflow/react";
import type { BaseNodeData, NodeHandleConfig } from "../types";

const defaultHandles: NodeHandleConfig[] = [
  { id: "top", type: "target", position: Position.Top },
  { id: "bottom", type: "source", position: Position.Bottom },
];

/**
 * list of all registered nodes
 */
enum RegisteredNodes {
  DATABASE = "database",
  LOAD_BALANCER = "load-balancer",
  WEB_SERVER = "web-server",
  VIRTUAL_MACHINE = "virtual-machine",
  CDN = "cdn",
  API_GATEWAY = "api-gateway",
  REVERSE_PROXY = "reverse-proxy",
  SQL_DB = "sql-db",
  NOSQL_DB = "nosql-db",
  CACHE = "cache",
}

/**
 * Map of all registered nodes with default data values
 */
const defaultNodesMap: Record<RegisteredNodes, BaseNodeData> = {
  [RegisteredNodes.DATABASE]: { label: "Database", icon: "database", handles: defaultHandles },
  [RegisteredNodes.LOAD_BALANCER]: {
    label: "Load Balancer",
    icon: "scale",
    handles: defaultHandles,
  },
  [RegisteredNodes.WEB_SERVER]: { label: "Web Server", handles: defaultHandles },
  [RegisteredNodes.VIRTUAL_MACHINE]: { label: "Virtual Machine", handles: defaultHandles },
  [RegisteredNodes.CDN]: { label: "CDN", handles: defaultHandles },
  [RegisteredNodes.API_GATEWAY]: { label: "API Gateway", handles: defaultHandles },
  [RegisteredNodes.REVERSE_PROXY]: { label: "Reverse Proxy", handles: defaultHandles },
  [RegisteredNodes.SQL_DB]: { label: "SQL DB", handles: defaultHandles },
  [RegisteredNodes.NOSQL_DB]: { label: "NoSQL DB", handles: defaultHandles },
  [RegisteredNodes.CACHE]: { label: "Cache", handles: defaultHandles },
};

export { defaultNodesMap, RegisteredNodes };
