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
