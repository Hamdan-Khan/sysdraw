import { useCanvasTransfer } from "@/hooks/useCanvasTransfer";
import { RegisteredEdges } from "@sysdraw/models";
import { useReactFlow } from "@xyflow/react";
import { ExternalLink, FolderOpen, Lock, Maximize, Redo, Undo, Unlock } from "lucide-react";
import { useShallow } from "zustand/shallow";
import { useHistory } from "../../hooks";
import { cn } from "../../lib/utils";
import { CanvasStoreState, useCanvasStore } from "../../store";
import { Dropdown, DropdownOption, Tooltip } from "../common";
import { edgeTypeOptions } from "../edges";

const selector = (s: CanvasStoreState) => ({
  isInteractive: s.isInteractive,
  setIsInteractive: s.setIsInteractive,
  globalEdgeType: s.globalEdgeType,
  setGlobalEdgeType: s.setGlobalEdgeType,
  setEdges: s.setEdges,
  setNodes: s.setNodes,
});

type ButtonControlItem = {
  type: "button";
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  action: () => void;
  disabled?: boolean;
  active?: boolean;
  dividerBefore?: boolean;
};

type DropdownControlItem<T extends string = string> = {
  type: "dropdown";
  id: string;
  label: string;
  options: DropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;
  dividerBefore?: boolean;
};

type ControlItem = ButtonControlItem | DropdownControlItem<RegisteredEdges>;

export const ControlsBar = () => {
  const { onExport, onOpen } = useCanvasTransfer();
  const { undo, redo, canUndo, canRedo } = useHistory();
  const { fitView } = useReactFlow();
  const { isInteractive, setIsInteractive, globalEdgeType, setGlobalEdgeType, setNodes, setEdges } =
    useCanvasStore(useShallow(selector));

  const handleToggleInteractivity = () => {
    // un-select any nodes/group/edges when turning off interactivity
    if (isInteractive) {
      setNodes((n) => n.map((node) => ({ ...node, selected: false })));
      setEdges((e) => e.map((edge) => ({ ...edge, selected: false })));
    }
    setIsInteractive(!isInteractive);
  };

  const items: ControlItem[] = [
    {
      type: "button",
      id: "controls-export",
      icon: ExternalLink,
      label: "Export",
      action: () => onExport(),
      disabled: false,
    },
    {
      type: "button",
      id: "controls-open",
      icon: FolderOpen,
      label: "Open",
      action: () => onOpen(),
      disabled: false,
    },
    {
      type: "button",
      id: "controls-undo",
      icon: Undo,
      label: "Undo",
      action: () => undo(),
      disabled: !canUndo,
    },
    {
      type: "button",
      id: "controls-redo",
      icon: Redo,
      label: "Redo",
      action: () => redo(),
      disabled: !canRedo,
    },
    {
      type: "button",
      id: "controls-fit-view",
      icon: Maximize,
      label: "Fit View",
      action: () => fitView({ padding: 0.1, duration: 300 }),
      disabled: false,
      dividerBefore: true,
    },
    {
      type: "button",
      id: "controls-toggle-interactivity",
      icon: isInteractive ? Unlock : Lock,
      label: isInteractive ? "Lock Canvas" : "Unlock Canvas",
      action: handleToggleInteractivity,
      disabled: false,
      active: !isInteractive,
    },
    {
      type: "dropdown",
      id: "controls-edge-type",
      label: "Edge Type",
      options: edgeTypeOptions,
      value: globalEdgeType,
      onChange: setGlobalEdgeType,
    },
  ];

  return (
    <div
      data-no-context-menu
      className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-0.5 bg-surface border border-border rounded-lg p-1.5 shadow-md"
    >
      {items.map((item) => {
        const isDividerBefore = item.dividerBefore;

        return (
          <div key={item.id} className="flex items-center">
            {isDividerBefore && <div className="w-px h-6 bg-border mx-1" />}

            {item.type === "button" ? (
              <div className="relative flex items-center justify-center group">
                <button
                  id={item.id}
                  onClick={item.action}
                  disabled={item.disabled}
                  aria-label={item.label}
                  className={cn(
                    "p-2.5 rounded-md transition-all flex items-center justify-center cursor-pointer outline-none",
                    item.disabled
                      ? "text-secondary/40 cursor-not-allowed"
                      : item.active
                        ? "text-primary bg-dim"
                        : "text-secondary hover:text-primary hover:bg-dim",
                  )}
                >
                  <item.icon size={18} />
                </button>
                <Tooltip direction="down" text={item.label} />
              </div>
            ) : (
              <div className="relative flex items-center justify-center group">
                <Dropdown
                  id={item.id}
                  options={item.options}
                  value={item.value}
                  onChange={item.onChange}
                  preferredDirection="down"
                  aria-label={item.label}
                />
                <Tooltip direction="down" text={item.label} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
