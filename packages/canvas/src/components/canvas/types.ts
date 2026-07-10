import { BaseGroupData, BaseNodeData, NodeKinds, NodeTypes } from "@sysdraw/models";
import { Node, NodeProps } from "@xyflow/react";

/**
 * Data transferred when dragging a node or group from the toolbar to the canvas
 */
export type DnDTransferData = {
  kind: NodeKinds;
  type: NodeTypes;
};

export type NodePropsType<TData extends BaseNodeData | BaseGroupData> = NodeProps<Node<TData>>;
export type NodeComponentType<TData extends BaseNodeData | BaseGroupData> = React.ComponentType<
  NodePropsType<TData>
>;
