import { CustomHandle } from "@/components/common/CustomHandle";
import { OptionBar } from "@/components/common/OptionBar";
import { useCanvasStore } from "@/store/CanvasStoreProvider";
import type { NodeHandleConfig } from "@sysdraw/models";
import { NodeResizer, NodeToolbar, Position, useNodeId, useViewport } from "@xyflow/react";

export interface CommonNodeWrapperProps {
  children: React.ReactNode;
  handles?: NodeHandleConfig[];
  selected?: boolean;
  type: "node" | "group";
  className?: string;
  style?: React.CSSProperties;
  minWidth?: number;
  minHeight?: number;
  keepAspectRatio?: boolean;
  resizerBorderWidth?: number;
  onAddLabel?: () => void;
}

const defaultHandles: NodeHandleConfig[] = [];

export const CommonNodeWrapper = ({
  children,
  handles = defaultHandles,
  selected,
  type,
  className,
  style,
  minWidth,
  minHeight,
  keepAspectRatio,
  resizerBorderWidth = 1,
  onAddLabel,
}: CommonNodeWrapperProps) => {
  const nodeId = useNodeId();
  const isNodeLocked = useCanvasStore((s) => s.isNodeLocked(nodeId));
  const { zoom } = useViewport();

  return (
    <div className={className} style={style}>
      <NodeResizer
        minWidth={minWidth}
        minHeight={minHeight}
        isVisible={selected && !isNodeLocked}
        keepAspectRatio={keepAspectRatio}
        lineStyle={{ borderWidth: resizerBorderWidth / zoom }}
      />
      <NodeToolbar className="flex gap-2">
        <OptionBar type={type} onAddLabel={onAddLabel} />
      </NodeToolbar>
      {handles.map((handle) => {
        return (
          <CustomHandle
            key={handle.id}
            id={handle.id}
            type={handle.type}
            position={handle.position || Position.Top}
          />
        );
      })}
      {children}
    </div>
  );
};
