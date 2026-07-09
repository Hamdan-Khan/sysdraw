import type { BaseNodeData } from "@sysdraw/models";
import { Handle, Node, NodeProps, Position } from "@xyflow/react";

export const DatabaseNodeComponent = ({ data }: NodeProps<Node<BaseNodeData>>) => {
  return (
    <div className="bg-surface text-text px-5 py-2.5 rounded-lg border-2 border-border min-w-[120px] text-center">
      <Handle type="target" position={Position.Top} />
      <div className="text-xs text-secondary">Database</div>
      <div className="font-bold">{data.label}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};
