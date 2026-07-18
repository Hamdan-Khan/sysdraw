import { useNodeId, useReactFlow } from "@xyflow/react";
import { Copy, Lock, MessageSquare, Trash2 } from "lucide-react";
import { useCallback } from "react";
import { toast } from "sonner";
import { useCopyPaste } from "../../hooks";
import { Tooltip } from "./Tooltip";

interface OptionBarProps {
  type: "node" | "group";
}

export const OptionBar = ({ type }: OptionBarProps) => {
  const nodeId = useNodeId();
  const { deleteElements } = useReactFlow();
  const { copy } = useCopyPaste();

  const formattedType = type.charAt(0).toUpperCase() + type.slice(1);

  const handleDelete = () => {
    if (nodeId) {
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

  const options = [
    { icon: Copy, label: "Copy", action: handleCopy },
    { icon: Lock, label: "Lock", action: () => {} },
    { icon: MessageSquare, label: "Comment", action: () => {} },
    { icon: Trash2, label: "Delete", action: handleDelete },
  ];

  return (
    <div className="flex items-center gap-0.5 bg-surface p-1 rounded-lg border border-border shadow-md">
      {options.map((opt) => {
        const Icon = opt.icon;
        return (
          <div key={opt.label} className="relative flex items-center justify-center group">
            <button
              onClick={opt.action}
              className="p-1.5 rounded-md text-secondary hover:text-primary hover:bg-dim transition-all flex items-center justify-center cursor-pointer outline-none"
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
