import { RegisteredNodes } from "@sysdraw/models";
import { ApiGatewayNodeComponent } from "./ApiGateway";
import { CacheNodeComponent } from "./Cache";
import { CdnNodeComponent } from "./Cdn";
import { DatabaseNodeComponent } from "./Database";
import { LoadBalancerNodeComponent } from "./LoadBalancer";
import { NoSqlDbNodeComponent } from "./NoSqlDb";
import { ReverseProxyNodeComponent } from "./ReverseProxy";
import { SqlDbNodeComponent } from "./SqlDb";
import { VirtualMachineNodeComponent } from "./VirtualMachine";
import { WebServerNodeComponent } from "./WebServer";

export const nodeTypes = {
  [RegisteredNodes.DATABASE]: DatabaseNodeComponent,
  [RegisteredNodes.LOAD_BALANCER]: LoadBalancerNodeComponent,
  [RegisteredNodes.WEB_SERVER]: WebServerNodeComponent,
  [RegisteredNodes.VIRTUAL_MACHINE]: VirtualMachineNodeComponent,
  [RegisteredNodes.CDN]: CdnNodeComponent,
  [RegisteredNodes.API_GATEWAY]: ApiGatewayNodeComponent,
  [RegisteredNodes.REVERSE_PROXY]: ReverseProxyNodeComponent,
  [RegisteredNodes.SQL_DB]: SqlDbNodeComponent,
  [RegisteredNodes.NOSQL_DB]: NoSqlDbNodeComponent,
  [RegisteredNodes.CACHE]: CacheNodeComponent,
};
