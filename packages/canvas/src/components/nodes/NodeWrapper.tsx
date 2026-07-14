import type { NodeHandleConfig } from "@sysdraw/models";
import {
  Handle,
  NodeResizer,
  NodeToolbar,
  Position,
  useNodeConnections,
  useNodeId,
  useReactFlow,
  useViewport,
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

  const { deleteElements } = useReactFlow();
  const { zoom } = useViewport();

  const handleDelete = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "Delete":
        if (nodeId) deleteElements({ nodes: [{ id: nodeId }] });
        break;
      default:
        break;
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-w-20 min-h-20 w-full h-full relative p-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={handleDelete}
      tabIndex={0} // enables keyboard events on div
    >
      <NodeResizer
        minWidth={80}
        minHeight={80}
        isVisible={selected}
        keepAspectRatio
        lineStyle={{ borderWidth: 0.7 / zoom }}
      />
      <NodeToolbar className="flex gap-2">
        <span>{nodeId?.slice(0, 6)}</span>
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
