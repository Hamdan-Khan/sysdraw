import { Position } from "@xyflow/react";

export interface NodeHandleConfig {
  id: string;
  type: "source" | "target";
  position?: Position;
  style?: React.CSSProperties;
}

/**
 * Base edge data type to extend edge instances from
 */
export type BaseEdgeData = {
  label?: string;
  protocol?: string;
};

/**
 * Node can refer to either a normal node or a special node i.e.
 * group that can contain other nodes.
 */
export type NodeKinds = "node" | "group";
