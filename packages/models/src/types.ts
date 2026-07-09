import { RegisteredGroups } from "./groups";
import { RegisteredNodes } from "./nodes";

/**
 * Base node data type to extend node instances from
 */
export type BaseNodeData = {
  label: string;
  description?: string;
  icon?: string;
};

/**
 * Base edge data type to extend edge instances from
 */
export type BaseEdgeData = {
  label?: string;
  protocol?: string;
};

/**
 * Base group data type to extend group instances from
 */
export type BaseGroupData = {
  label: string;
  description?: string;
  color?: string;
};

/**
 * Node can refer to either a normal node or a special node i.e.
 * group that can contain other nodes.
 */
export type NodeKinds = "node" | "group";
/**
 * All the registered node types (nodes + groups)
 */
export type NodeTypes = RegisteredNodes | RegisteredGroups;
