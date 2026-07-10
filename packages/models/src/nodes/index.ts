import { Position } from "@xyflow/react";
import type { BaseNodeData, NodeHandleConfig } from "../types";
import { apiGatewayDefault } from "./ApiGateway";
import { cacheDefault } from "./Cache";
import { cdnDefault } from "./Cdn";
import { databaseDefault } from "./Database";
import { loadBalancerDefault } from "./LoadBalancer";
import { noSqlDbDefault } from "./NoSqlDb";
import { reverseProxyDefault } from "./ReverseProxy";
import { sqlDbDefault } from "./SqlDb";
import { virtualMachineDefault } from "./VirtualMachine";
import { webServerDefault } from "./WebServer";

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
  [RegisteredNodes.DATABASE]: { ...databaseDefault, handles: defaultHandles },
  [RegisteredNodes.LOAD_BALANCER]: { ...loadBalancerDefault, handles: defaultHandles },
  [RegisteredNodes.WEB_SERVER]: { ...webServerDefault, handles: defaultHandles },
  [RegisteredNodes.VIRTUAL_MACHINE]: { ...virtualMachineDefault, handles: defaultHandles },
  [RegisteredNodes.CDN]: { ...cdnDefault, handles: defaultHandles },
  [RegisteredNodes.API_GATEWAY]: { ...apiGatewayDefault, handles: defaultHandles },
  [RegisteredNodes.REVERSE_PROXY]: { ...reverseProxyDefault, handles: defaultHandles },
  [RegisteredNodes.SQL_DB]: { ...sqlDbDefault, handles: defaultHandles },
  [RegisteredNodes.NOSQL_DB]: { ...noSqlDbDefault, handles: defaultHandles },
  [RegisteredNodes.CACHE]: { ...cacheDefault, handles: defaultHandles },
};

export { defaultNodesMap, RegisteredNodes };
