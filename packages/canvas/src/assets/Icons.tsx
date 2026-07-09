import { RegisteredNodes } from "@sysdraw/models";
import {
  ArrowRightLeftIcon,
  BoxIcon,
  CpuIcon,
  DatabaseIcon,
  DatabaseZapIcon,
  GlobeIcon,
  LucideIcon,
  NetworkIcon,
  ServerIcon,
  WaypointsIcon,
} from "lucide-react";

export const IconsMap: Record<RegisteredNodes, LucideIcon> = {
  [RegisteredNodes.DATABASE]: DatabaseIcon,
  [RegisteredNodes.LOAD_BALANCER]: NetworkIcon,
  [RegisteredNodes.WEB_SERVER]: ServerIcon,
  [RegisteredNodes.VIRTUAL_MACHINE]: BoxIcon,
  [RegisteredNodes.CDN]: GlobeIcon,
  [RegisteredNodes.API_GATEWAY]: WaypointsIcon,
  [RegisteredNodes.REVERSE_PROXY]: ArrowRightLeftIcon,
  [RegisteredNodes.SQL_DB]: DatabaseIcon,
  [RegisteredNodes.NOSQL_DB]: DatabaseZapIcon,
  [RegisteredNodes.CACHE]: CpuIcon,
};
