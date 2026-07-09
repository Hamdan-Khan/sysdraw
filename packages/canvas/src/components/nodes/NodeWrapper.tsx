import { Handle, Position, useNodeConnections, useNodeId } from "@xyflow/react";
import { useState } from "react";

export interface NodeHandleConfig {
  id: string;
  type: "source" | "target";
  position?: Position;
  style?: React.CSSProperties;
}

export interface NodeWrapperProps {
  children: React.ReactNode;
  handles?: NodeHandleConfig[];
}

export const NodeWrapper = ({ children, handles = [] }: NodeWrapperProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const connections = useNodeConnections();
  const nodeId = useNodeId();

  return (
    <div
      className="flex flex-col items-center justify-center min-w-[80px] relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
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
