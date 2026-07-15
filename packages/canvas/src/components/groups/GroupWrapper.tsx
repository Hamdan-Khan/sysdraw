import type { NodeHandleConfig } from "@sysdraw/models";
import {
  Handle,
  NodeResizer,
  NodeToolbar,
  Position,
  ResizeDragEvent,
  useNodeConnections,
  useNodeId,
  useViewport,
} from "@xyflow/react";
import { useState } from "react";
import { OptionBar } from "../common";

export interface GroupWrapperProps {
  children: React.ReactNode;
  handles?: NodeHandleConfig[];
  selected?: boolean;
  width?: number;
  height?: number;
}

const defaultHandles: NodeHandleConfig[] = [];

export const GroupWrapper = ({
  children,
  handles = defaultHandles,
  selected,
  width,
  height,
}: GroupWrapperProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const connections = useNodeConnections();
  const nodeId = useNodeId();
  const { zoom } = useViewport();

  const shouldResize = (_e: ResizeDragEvent) => {
    // console.log(e);
    // if (e.dx < 0) {
    //   return false;
    // }
    return true;
  };

  return (
    <div
      style={{
        width: width || 400,
        height: height || 300,
      }}
      className="relative w-full h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <NodeResizer
        minWidth={200}
        minHeight={150}
        isVisible={selected}
        shouldResize={shouldResize}
        lineStyle={{ borderWidth: 0.8 / zoom }}
      />
      <NodeToolbar className="flex gap-2">
        <OptionBar type="group" />
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
