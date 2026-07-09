import type { BaseNodeData } from "../types";

export type LoadBalancerData = BaseNodeData & {
  algorithm: "round-robin" | "least-connections";
};

export const loadBalancerDefault: LoadBalancerData = {
  label: "Load Balancer",
  icon: "scale",
  algorithm: "round-robin",
};
