import { RegisteredEdges } from "@sysdraw/models";
import { Edge, MarkerType, useReactFlow } from "@xyflow/react";
import debounce from "lodash-es/debounce";
import { ArrowRight, Trash2, Type, Zap } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useHistory } from "../../hooks";
import { Dropdown, Tooltip } from "../common";
import { edgeTypeOptions } from "./EdgeTypes";

interface EdgeOptionBarProps {
  edgeId: string;
}

type OptionBarButton = {
  icon: React.ReactNode;
  onClick: () => void;
  label: string;
  active?: boolean;
};

export const EdgeOptionBar = ({ edgeId }: EdgeOptionBarProps) => {
  const { getEdge, setEdges, deleteElements } = useReactFlow();
  const edge = getEdge(edgeId);
  const { commit } = useHistory();

  const [isLabelOpen, setIsLabelOpen] = useState(false);
  const [labelInput, setLabelInput] = useState<string>((edge?.label as string) ?? "");
  const hasCommittedRef = useRef(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateEdge = useCallback(
    (updater: (edge: Partial<Edge>) => Partial<Edge>) => {
      setEdges((edges) => edges.map((e) => (e.id === edgeId ? { ...e, ...updater(e) } : e)));
    },
    [edgeId, setEdges],
  );

  const debouncedUpdateLabel = useMemo(
    () =>
      debounce((value: string) => {
        updateEdge(() => ({ label: value }));
      }, 250),
    [updateEdge],
  );

  // clean up debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedUpdateLabel.cancel();
    };
  }, [debouncedUpdateLabel]);

  // keep local input in sync with edge's label when popover is closed
  useEffect(() => {
    if (!isLabelOpen) {
      setLabelInput((edge?.label as string) ?? "");
    }
  }, [edge?.label, isLabelOpen]);

  // handle click outside to close label popover & flush state
  useEffect(() => {
    if (!isLabelOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        debouncedUpdateLabel.flush();
        hasCommittedRef.current = false;
        setIsLabelOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleClickOutside);
    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, [isLabelOpen, debouncedUpdateLabel]);

  // focus and select text when popover opens
  useEffect(() => {
    if (isLabelOpen) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isLabelOpen]);

  if (!edge) {
    return null;
  }

  const currentType = (edge.type ?? RegisteredEdges.STRAIGHT) as RegisteredEdges;
  const isAnimated = edge.animated;
  const currentMarker = edge.markerEnd;
  const currentLabel = edge.label as string;

  const handleDelete = () => {
    commit();
    deleteElements({ edges: [{ id: edgeId }] });
    toast.success("Edge deleted.");
  };

  const handleToggleAnimate = () => {
    updateEdge((e) => ({ animated: !e.animated }));
  };

  const cycleMarker = () => {
    updateEdge((e) => {
      let nextMarker;
      if (!e.markerEnd) {
        nextMarker = { type: MarkerType.ArrowClosed };
      } else if (typeof e.markerEnd === "object" && e.markerEnd.type === MarkerType.ArrowClosed) {
        nextMarker = { type: MarkerType.Arrow };
      } else {
        nextMarker = undefined;
      }
      return { markerEnd: nextMarker };
    });
  };

  const handleTypeChange = (type: RegisteredEdges) => {
    updateEdge(() => ({ type }));
  };

  const handleToggleLabelPopover = () => {
    if (isLabelOpen) {
      debouncedUpdateLabel.flush();
      hasCommittedRef.current = false;
      setIsLabelOpen(false);
    } else {
      setIsLabelOpen(true);
    }
  };

  const handleLabelInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLabelInput(newValue);

    if (!hasCommittedRef.current) {
      commit();
      hasCommittedRef.current = true;
    }

    debouncedUpdateLabel(newValue);
  };

  const handleLabelInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      debouncedUpdateLabel.flush();
      hasCommittedRef.current = false;
      setIsLabelOpen(false);
    } else if (e.key === "Escape") {
      e.preventDefault();
      debouncedUpdateLabel.cancel();
      setLabelInput(currentLabel ?? "");
      hasCommittedRef.current = false;
      setIsLabelOpen(false);
    }
  };

  const buttons: OptionBarButton[] = [
    { icon: <Zap size={16} />, onClick: handleToggleAnimate, label: "Animate", active: isAnimated },
    {
      icon: <ArrowRight size={16} />,
      onClick: cycleMarker,
      label: "Arrow",
      active: !!currentMarker,
    },
    { icon: <Trash2 size={16} />, onClick: handleDelete, label: "Delete" },
  ];

  return (
    <div className="flex items-center gap-0.5 bg-surface p-1 rounded-lg border border-border shadow-md">
      <div className="relative flex items-center justify-center group">
        <Dropdown
          options={edgeTypeOptions}
          value={currentType}
          onChange={handleTypeChange}
          aria-label="Edge type"
        />
        <Tooltip text="Edge type" />
      </div>

      {/* label option */}
      <div className="relative flex items-center justify-center group" ref={popoverRef}>
        <button
          onClick={handleToggleLabelPopover}
          className={`p-1.5 rounded-md transition-all flex items-center justify-center cursor-pointer outline-none ${
            isLabelOpen || Boolean(currentLabel)
              ? "text-primary bg-dim"
              : "text-secondary hover:text-primary hover:bg-dim"
          }`}
          aria-label="Label"
        >
          <Type size={16} />
        </button>
        {!isLabelOpen && <Tooltip text="Label" />}

        {isLabelOpen && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 z-50 flex items-center gap-1 bg-surface p-1.5 rounded-lg border border-border shadow-lg min-w-45">
            <input
              ref={inputRef}
              type="text"
              value={labelInput}
              onChange={handleLabelInputChange}
              onKeyDown={handleLabelInputKeyDown}
              placeholder="Edge label..."
              className="w-full bg-dim text-primary text-xs px-2 py-1 rounded outline-none border border-transparent focus:border-border transition-all"
            />
            {/* tooltip arrow originating from element */}
            <span className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-border pointer-events-none" />
            <span className="absolute top-[calc(100%-1px)] left-1/2 -translate-x-1/2 border-4 border-transparent border-t-surface pointer-events-none" />
          </div>
        )}
      </div>

      {buttons.map(({ icon, onClick, label, active }) => (
        <div key={label} className="relative flex items-center justify-center group">
          <button
            onClick={onClick}
            className={`p-1.5 rounded-md transition-all flex items-center justify-center cursor-pointer outline-none ${
              active !== undefined
                ? active
                  ? "text-primary bg-dim"
                  : "text-secondary hover:text-primary hover:bg-dim"
                : "text-secondary hover:text-primary hover:bg-dim"
            }`}
            aria-label={label}
          >
            {icon}
          </button>
          <Tooltip text={label} />
        </div>
      ))}
    </div>
  );
};
