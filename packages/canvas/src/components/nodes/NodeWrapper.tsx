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
import { OptionBar } from "../common";

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
      className="flex flex-col items-center justify-center min-w-10 min-h-10 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={handleDelete}
      tabIndex={0} // enables keyboard events on div
    >
      <NodeResizer
        minWidth={40}
        minHeight={40}
        isVisible={selected}
        keepAspectRatio
        lineStyle={{ borderWidth: 1 / zoom }}
      />
      <NodeToolbar className="flex gap-2">
        <OptionBar type="node" />
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
