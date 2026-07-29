import { useHistory } from "@/hooks/useHistory";
import { useCanvasStore } from "@/store/CanvasStoreProvider";
import { NODE_CLASS_ID } from "@sysdraw/common";
import type { NodeHandleConfig } from "@sysdraw/models";
import { useNodeId, useUpdateNodeInternals } from "@xyflow/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CommonNodeWrapper } from "../CommonNodeWrapper";

export interface NodeWrapperProps {
  children: React.ReactNode;
  handles?: NodeHandleConfig[];
  selected?: boolean;
  width?: number;
  height?: number;
  title?: string;
}

const DEFAULT_NODE_SIZE = 40;
const LABEL_EXTRA_HEIGHT = 20;

export const NodeWrapper = ({
  children,
  handles,
  selected,
  width,
  height,
  title,
}: NodeWrapperProps) => {
  const nodeId = useNodeId();
  const updateNodeInternals = useUpdateNodeInternals();
  const setNodes = useCanvasStore((s) => s.setNodes);
  const { commit } = useHistory();

  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(title ?? "");
  const isCancelingRef = useRef(false);
  // tracks un-edited base height when adding a label for the first time
  const initialHeightRef = useRef<number | null>(null);

  const hasLabel = isEditing || Boolean(title);
  const isFirstTimeEditing = isEditing && !title;

  // freezes initial base height during first time edit to avoid resize observer feedback loops
  if (isFirstTimeEditing) {
    if (initialHeightRef.current === null) {
      initialHeightRef.current = height || DEFAULT_NODE_SIZE;
    }
  } else {
    initialHeightRef.current = null;
  }

  // calculates dynamic node dimensions with extra label space when editing for the first time
  const { width: nodeWidth, height: nodeHeight } = useMemo(() => {
    const baseW = width || DEFAULT_NODE_SIZE;
    const effectiveHeight = initialHeightRef.current ?? height;
    const baseH =
      (effectiveHeight || DEFAULT_NODE_SIZE) + (isFirstTimeEditing ? LABEL_EXTRA_HEIGHT : 0);

    return { width: baseW, height: baseH };
  }, [width, height, isFirstTimeEditing]);

  const startEditing = useCallback(() => {
    setInputValue(title ?? "");
    setIsEditing(true);
  }, [title]);

  const handleSave = useCallback(() => {
    if (isCancelingRef.current) {
      isCancelingRef.current = false;
      return;
    }

    if (nodeId) {
      const trimmed = inputValue.trim();
      commit();
      setNodes((prev) =>
        prev.map((n) => {
          if (n.id !== nodeId) {
            return n;
          }

          const hadLabel = Boolean(n.data?.title);
          const hasNewLabel = Boolean(trimmed);

          let updatedHeight = n.height;
          if (!hadLabel && hasNewLabel) {
            const baseUnedited = initialHeightRef.current ?? n.height ?? DEFAULT_NODE_SIZE;
            updatedHeight = baseUnedited + LABEL_EXTRA_HEIGHT;
          } else if (hadLabel && !hasNewLabel) {
            const currentH =
              n.height ?? n.measured?.height ?? DEFAULT_NODE_SIZE + LABEL_EXTRA_HEIGHT;
            updatedHeight = Math.max(DEFAULT_NODE_SIZE, currentH - LABEL_EXTRA_HEIGHT);
          }

          return {
            ...n,
            height: updatedHeight,
            data: {
              ...n.data,
              title: trimmed,
            },
          };
        }),
      );
    }
    setIsEditing(false);
  }, [nodeId, inputValue, commit, setNodes]);

  const handleCancel = useCallback(() => {
    isCancelingRef.current = true;
    setInputValue(title ?? "");
    setIsEditing(false);
  }, [title]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  // update node internals so that edges positions are adjusted on node's height update
  useEffect(() => {
    if (nodeId) {
      updateNodeInternals(nodeId);
    }
  }, [nodeId, nodeWidth, nodeHeight, hasLabel, updateNodeInternals]);

  return (
    <CommonNodeWrapper
      type="node"
      handles={handles}
      selected={selected}
      onAddLabel={startEditing}
      className={`flex flex-col items-center justify-center gap-1 relative w-full h-full p-1 ${NODE_CLASS_ID}`}
      style={{
        width: nodeWidth,
        height: nodeHeight,
      }}
      minWidth={40}
      minHeight={hasLabel ? 60 : 40}
      keepAspectRatio={false}
      resizerBorderWidth={1}
    >
      <div className="my-auto flex flex-col items-center justify-center gap-1 w-full max-h-full">
        <div className="flex-1 flex items-center justify-center w-full min-h-0">{children}</div>

        {hasLabel && (
          <div className="shrink-0 z-10 flex items-center justify-center">
            {isEditing ? (
              <input
                autoFocus
                onFocus={(e) => e.currentTarget.select()}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSave}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                placeholder="Label..."
                className="text-center text-xs text-primary bg-surface border border-border/40 rounded px-1.5 py-0.5 outline-none focus:border-primary/50 transition-colors shadow-xs"
                style={{ minWidth: 80, width: "max-content" }}
              />
            ) : title ? (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  startEditing();
                }}
                className="block text-xs text-primary text-center px-1.5 py-0.5 cursor-pointer hover:bg-dim/60 rounded transition-colors select-none whitespace-nowrap"
                title={title}
              >
                {title}
              </span>
            ) : null}
          </div>
        )}
      </div>
    </CommonNodeWrapper>
  );
};
