import { useReactFlow } from "@xyflow/react";
import { ArchiveRestoreIcon, Lock, Maximize, Redo, Save, Undo, Unlock } from "lucide-react";
import { useShallow } from "zustand/shallow";
import { useCanvasStorage, useHistory } from "../../hooks";
import { CanvasStoreState, useCanvasStore } from "../../store";
import { Dropdown, Tooltip } from "../common";
import { edgeTypeOptions } from "../edges";

const selector = (s: CanvasStoreState) => ({
  isInteractive: s.isInteractive,
  setIsInteractive: s.setIsInteractive,
  globalEdgeType: s.globalEdgeType,
  setGlobalEdgeType: s.setGlobalEdgeType,
  setEdges: s.setEdges,
  setNodes: s.setNodes,
});

export const ControlsBar = () => {
  const { onSave, onRestore } = useCanvasStorage();
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

  const buttons = [
    {
      id: "controls-save",
      icon: Save,
      label: "Save",
      action: () => onSave(),
      disabled: false,
    },
    {
      id: "controls-restore",
      icon: ArchiveRestoreIcon,
      label: "Restore",
      action: () => onRestore(),
      disabled: false,
    },
    {
      id: "controls-undo",
      icon: Undo,
      label: "Undo",
      action: () => undo(),
      disabled: !canUndo,
    },
    {
      id: "controls-redo",
      icon: Redo,
      label: "Redo",
      action: () => redo(),
      disabled: !canRedo,
    },
    {
      id: "controls-fit-view",
      icon: Maximize,
      label: "Fit View",
      action: () => fitView({ padding: 0.1, duration: 300 }),
      disabled: false,
    },
    {
      id: "controls-toggle-interactivity",
      icon: isInteractive ? Unlock : Lock,
      label: isInteractive ? "Lock Canvas" : "Unlock Canvas",
      action: handleToggleInteractivity,
      disabled: false,
      active: !isInteractive,
    },
  ] as const;

  return (
    <div
      data-no-context-menu
      className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-0.5 bg-surface border border-border rounded-lg p-1.5 shadow-md"
    >
      {buttons.map((btn) => {
        const Icon = btn.icon;
        const isDividerBefore = btn.id === "controls-fit-view"; // divider before fit-view group
        return (
          <div key={btn.id} className="flex items-center">
            {isDividerBefore && <div className="w-px h-6 bg-border mx-1" />}
            <div className="relative flex items-center justify-center group">
              <button
                id={btn.id}
                onClick={btn.action}
                disabled={btn.disabled}
                aria-label={btn.label}
                className={[
                  "p-2.5 rounded-md transition-all flex items-center justify-center cursor-pointer outline-none",
                  btn.disabled
                    ? "text-secondary/40 cursor-not-allowed"
                    : "active" in btn && btn.active
                      ? "text-primary bg-dim"
                      : "text-secondary hover:text-primary hover:bg-dim",
                ].join(" ")}
              >
                <Icon size={18} />
              </button>
              <Tooltip direction="down" text={btn.label} />
            </div>
          </div>
        );
      })}

      <div className="relative flex items-center justify-center group">
        <Dropdown
          id="controls-edge-type"
          options={edgeTypeOptions}
          value={globalEdgeType}
          onChange={setGlobalEdgeType}
          preferredDirection="down"
          aria-label="Edge type"
        />
        <Tooltip direction="down" text="Edge Type" />
      </div>
    </div>
  );
};
