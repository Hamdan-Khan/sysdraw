import { RegisteredNodes, type BaseNodeData } from "@sysdraw/models";
import { Node, NodeProps, Position } from "@xyflow/react";
import { IconsMap } from "../../assets";
import { NodeHandleConfig, NodeWrapper } from "./NodeWrapper";

const HANDLES: NodeHandleConfig[] = [
  { id: "top", type: "target", position: Position.Top },
  { id: "bottom", type: "source", position: Position.Bottom },
];

export const SqlDbNodeComponent = ({ data }: NodeProps<Node<BaseNodeData>>) => {
  const Icon = IconsMap[RegisteredNodes.SQL_DB];
  return (
    <NodeWrapper handles={HANDLES}>
      <Icon size={48} strokeWidth={1.5} className="text-text drop-shadow-sm mb-1" />
    </NodeWrapper>
  );
};
