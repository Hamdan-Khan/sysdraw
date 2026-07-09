import { RegisteredNodes } from "@sysdraw/models";
import { DatabaseNodeComponent } from "./Database";
import { LoadBalancerNodeComponent } from "./LoadBalancer";

export const nodeTypes = {
  [RegisteredNodes.DATABASE]: DatabaseNodeComponent,
  [RegisteredNodes.LOAD_BALANCER]: LoadBalancerNodeComponent,
};
