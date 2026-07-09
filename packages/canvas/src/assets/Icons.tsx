import { RegisteredNodes } from "@sysdraw/models";
import { DatabaseIcon, NetworkIcon, LucideIcon } from "lucide-react";

export const IconsMap: Record<RegisteredNodes, LucideIcon> = {
  [RegisteredNodes.DATABASE]: DatabaseIcon,
  [RegisteredNodes.LOAD_BALANCER]: NetworkIcon,
};
