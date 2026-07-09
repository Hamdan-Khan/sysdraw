import type { BaseNodeData } from "../types";
import { databaseDefault } from "./Database";
import { loadBalancerDefault } from "./LoadBalancer";
import { webServerDefault } from "./WebServer";
import { virtualMachineDefault } from "./VirtualMachine";
import { cdnDefault } from "./Cdn";
import { apiGatewayDefault } from "./ApiGateway";
import { reverseProxyDefault } from "./ReverseProxy";
import { sqlDbDefault } from "./SqlDb";
import { noSqlDbDefault } from "./NoSqlDb";
import { cacheDefault } from "./Cache";

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
  [RegisteredNodes.DATABASE]: databaseDefault,
  [RegisteredNodes.LOAD_BALANCER]: loadBalancerDefault,
  [RegisteredNodes.WEB_SERVER]: webServerDefault,
  [RegisteredNodes.VIRTUAL_MACHINE]: virtualMachineDefault,
  [RegisteredNodes.CDN]: cdnDefault,
  [RegisteredNodes.API_GATEWAY]: apiGatewayDefault,
  [RegisteredNodes.REVERSE_PROXY]: reverseProxyDefault,
  [RegisteredNodes.SQL_DB]: sqlDbDefault,
  [RegisteredNodes.NOSQL_DB]: noSqlDbDefault,
  [RegisteredNodes.CACHE]: cacheDefault,
};

export { defaultNodesMap, RegisteredNodes };
