import type { NodeHandleConfig } from "@sysdraw/models";
import {
  Handle,
  NodeResizer,
  NodeToolbar,
  Position,
  useNodeConnections,
  useNodeId,
} from "@xyflow/react";
import { useState } from "react";

export interface NodeWrapperProps {
  children: React.ReactNode;
  handles?: NodeHandleConfig[];
  selected?: boolean;
}

const defaultHandles: NodeHandleConfig[] = [];

export const NodeWrapper = ({ children, handles = defaultHandles, selected }: NodeWrapperProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const connections = useNodeConnections();
  const nodeId = useNodeId();

  return (
    <div
      className="flex flex-col items-center justify-center min-w-[80px] min-h-[80px] w-full h-full relative p-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <NodeResizer minWidth={80} minHeight={80} isVisible={selected} keepAspectRatio />
      <NodeToolbar className="flex gap-2">
        <span>Hello</span>
      </NodeToolbar>
      {handles.map((handle) => {
        const hasConnection = connections.some((c) =>
          handle.type === "target"
            ? c.target === nodeId && c.targetHandle === handle.id
            : c.source === nodeId && c.sourceHandle === handle.id,
        );

        return (
          <Handle
            key={handle.id}
            id={handle.id}
            type={handle.type}
            position={handle.position || Position.Top}
            style={{
              opacity: isHovered || hasConnection ? 1 : 0,
              ...handle.style,
            }}
          />
        );
      })}
      {children}
    </div>
  );
};
