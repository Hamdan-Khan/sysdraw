import { RegisteredNodes, type BaseNodeData } from "@sysdraw/models";
import { Node, NodeProps, Position } from "@xyflow/react";
import { IconsMap } from "../../assets";
import { NodeHandleConfig, NodeWrapper } from "./NodeWrapper";

const HANDLES: NodeHandleConfig[] = [
  { id: "top", type: "target", position: Position.Top },
  { id: "bottom", type: "source", position: Position.Bottom },
];

export const DatabaseNodeComponent = ({ data, selected }: NodeProps<Node<BaseNodeData>>) => {
  const Icon = IconsMap[RegisteredNodes.DATABASE];
  return (
    <NodeWrapper selected={selected} handles={HANDLES}>
      <Icon strokeWidth={1.5} className="w-full h-full text-text drop-shadow-sm" />
    </NodeWrapper>
  );
};
