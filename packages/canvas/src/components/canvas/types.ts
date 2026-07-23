import { NodeKinds } from "@sysdraw/models";
import { Edge, EdgeProps, Node, NodeProps } from "@xyflow/react";

/**
 * data transferred when dragging a node or group from the toolbar to the canvas
 */
export type DnDTransferData = {
  kind: NodeKinds;
  id: string;
};

export type NodePropsType<TData extends Record<string, unknown> = Record<string, unknown>> =
  NodeProps<Node<TData>>;
export type NodeComponentType<TData extends Record<string, unknown> = Record<string, unknown>> =
  React.ComponentType<NodePropsType<TData>>;

export type EdgePropsType = EdgeProps<Edge>;
