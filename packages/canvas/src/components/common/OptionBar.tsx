import { useNodeId, useReactFlow } from "@xyflow/react";
import { Copy, Lock, Trash2, Unlock } from "lucide-react";
import { useCallback } from "react";
import { toast } from "sonner";
import { useCopyPaste, useHistory } from "../../hooks";
import { useCanvasStore } from "../../store";
import { Tooltip } from "./Tooltip";

interface OptionBarProps {
  type: "node" | "group";
}

export const OptionBar = ({ type }: OptionBarProps) => {
  const nodeId = useNodeId();
  const { deleteElements } = useReactFlow();
  const { copy } = useCopyPaste();
  const { commit } = useHistory();
  const setNodes = useCanvasStore((s) => s.setNodes);
  const isNodeLocked = useCanvasStore((s) => s.isNodeLocked(nodeId));

  const formattedType = type.charAt(0).toUpperCase() + type.slice(1);

  const handleDelete = () => {
    if (nodeId && !isNodeLocked) {
      commit();
      deleteElements({ nodes: [{ id: nodeId }] });
      toast.success(`${formattedType} deleted.`);
    }
  };

  const handleCopy = useCallback(() => {
    if (nodeId) {
      copy(nodeId);

      toast.success(`${formattedType} copied.`);
    }
  }, [nodeId, copy, formattedType]);

  const toggleLock = useCallback(() => {
    if (!nodeId) {
      return;
    }
    // todo: is locking worthy of a history spot?
    commit();
    setNodes((prev) => {
      return prev.map((n) => {
        if (n.id === nodeId) {
          const nextState = n.draggable === false;
          return {
            ...n,
            draggable: nextState,
            resizable: nextState,
            deletable: nextState,
            connectable: nextState,
          };
        }
        return n;
      });
    });
  }, [nodeId, setNodes, commit]);

  const options = [
    { icon: Copy, label: "Copy", action: handleCopy, disabled: isNodeLocked },
    {
      icon: isNodeLocked ? Lock : Unlock,
      label: isNodeLocked ? "Unlock" : "Lock",
      action: toggleLock,
    },
    // todo: add individual element comments/descriptions later with a comment box
    // { icon: MessageSquare, label: "Comment", action: () => {} },
    { icon: Trash2, label: "Delete", action: handleDelete, disabled: isNodeLocked },
  ];

  return (
    <div className="flex items-center gap-0.5 bg-surface p-1 rounded-lg border border-border shadow-md">
      {options.map((opt) => {
        const Icon = opt.icon;
        return (
          <div key={opt.label} className="relative flex items-center justify-center group">
            <button
              onClick={opt.action}
              disabled={opt.disabled}
              className="p-1.5 rounded-md text-secondary hover:text-primary hover:bg-dim transition-all flex items-center justify-center cursor-pointer outline-none disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-secondary"
              aria-label={opt.label}
            >
              <Icon size={16} />
            </button>
            <Tooltip text={opt.label} />
          </div>
        );
      })}
    </div>
  );
};
