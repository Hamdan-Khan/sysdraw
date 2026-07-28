import { Dropdown, DropdownOption } from "@/components/common/Dropdown";
import { Tooltip } from "@/components/common/Tooltip";
import { edgeTypeOptions } from "@/components/edges/EdgeTypes";
import { useHistory } from "@/hooks/useHistory";
import { parseProjectFile } from "@/lib/import/importFile";
import { cn } from "@/lib/utils";
import { useCanvasStore } from "@/store/CanvasStoreProvider";
import { CanvasStoreState } from "@/store/store";
import { FILE_EXTENSIONS } from "@sysdraw/common";
import { RegisteredEdges } from "@sysdraw/models";
import { Edge, Node, useReactFlow } from "@xyflow/react";
import {
  Download,
  ExternalLink,
  FolderOpen,
  Lock,
  Maximize,
  Redo,
  Undo,
  Unlock,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/shallow";
import { ExportDialog } from "./ExportDialog";
import { ImportConfirmDialog } from "./ImportConfirmDialog";
import { SaveProjectDialog } from "./SaveProjectDialog";

const selector = (s: CanvasStoreState) => ({
  nodes: s.nodes,
  edges: s.edges,
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

interface ControlsBarProps {
  isSaveDialogOpen?: boolean;
  setIsSaveDialogOpen?: (open: boolean) => void;
}

export const ControlsBar = ({
  isSaveDialogOpen = false,
  setIsSaveDialogOpen,
}: ControlsBarProps) => {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isImportConfirmOpen, setIsImportConfirmOpen] = useState(false);
  const { undo, redo, canUndo, canRedo } = useHistory();
  const { fitView, setViewport } = useReactFlow();
  const {
    nodes,
    edges,
    isInteractive,
    setIsInteractive,
    globalEdgeType,
    setGlobalEdgeType,
    setNodes,
    setEdges,
  } = useCanvasStore(useShallow(selector));

  const handleToggleInteractivity = () => {
    // un-select every nodes/group/edges when turning off interactivity
    if (isInteractive) {
      setNodes((n) => n.map((node) => ({ ...node, selected: false })));
      setEdges((e) => e.map((edge) => ({ ...edge, selected: false })));
    }
    setIsInteractive(!isInteractive);
  };

  const fileOpenInput = useRef<HTMLInputElement>(null);

  const openProjectFile = () => {
    fileOpenInput.current?.click();
  };

  /**
   * if its an empty canvas, open input window right away
   * otherwise, ask for a confirmation
   */
  const handleOpenClick = () => {
    if (nodes.length > 0 || edges.length > 0) {
      setIsImportConfirmOpen(true);
    } else {
      openProjectFile();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.name.endsWith(`.${FILE_EXTENSIONS.PROJECT}`)) {
      toast.error(`Please select a .${FILE_EXTENSIONS.PROJECT} file`);
      if (fileOpenInput.current) {
        fileOpenInput.current.value = "";
      }
      return;
    }

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const parsed = parseProjectFile(json);

      if (!parsed) {
        toast.error("Failed to parse project file");
        return;
      }

      setNodes(parsed.nodes as Node[]);
      setEdges(parsed.edges as Edge[]);
      if (parsed.viewport) {
        setViewport(parsed.viewport);
      }
      toast.success("Project loaded successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to parse project file");
    } finally {
      if (fileOpenInput.current) {
        fileOpenInput.current.value = "";
      }
    }
  };

  const items: ControlItem[] = [
    {
      type: "button",
      id: "controls-open",
      icon: FolderOpen,
      label: "Open",
      action: handleOpenClick,
      disabled: false,
    },
    {
      type: "button",
      id: "controls-save",
      icon: Download,
      label: "Save Project",
      action: () => setIsSaveDialogOpen?.(true),
      disabled: false,
    },
    {
      type: "button",
      id: "controls-export",
      icon: ExternalLink,
      label: "Export as Image",
      action: () => setIsExportDialogOpen(true),
      disabled: false,
    },
    {
      type: "button",
      id: "controls-toggle-interactivity",
      icon: isInteractive ? Unlock : Lock,
      label: isInteractive ? "Lock Canvas" : "Unlock Canvas",
      action: handleToggleInteractivity,
      disabled: false,
      dividerBefore: true,
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
    },
  ];

  return (
    <>
      <div
        data-no-context-menu
        className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-0.5 bg-surface border border-border rounded-lg p-1.5 shadow-md"
      >
        {items.map((item) => {
          const isDividerBefore = item.dividerBefore;

          return (
            <div key={item.id} className="flex items-center">
              {isDividerBefore && <div className="w-0.5 h-8 bg-border mx-1" />}

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
      <input
        type="file"
        id="open-project-file"
        ref={fileOpenInput}
        accept={`.${FILE_EXTENSIONS.PROJECT}`}
        onChange={handleFileChange}
        className="hidden"
      />
      <ExportDialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen} />
      <SaveProjectDialog
        isSaveDialogOpen={isSaveDialogOpen}
        setIsSaveDialogOpen={(open) => setIsSaveDialogOpen?.(open)}
      />
      <ImportConfirmDialog
        isOpen={isImportConfirmOpen}
        onOpenChange={setIsImportConfirmOpen}
        onConfirm={openProjectFile}
      />
    </>
  );
};
