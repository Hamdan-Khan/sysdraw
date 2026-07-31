import type { DnDTransferData } from "@/components/canvas/types";
import { Divider } from "@/components/common/Divider";
import { Tooltip } from "@/components/common/Tooltip";
import { useCanvasHandlers } from "@/hooks/useCanvasHandlers";
import { cn } from "@/lib/utils";
import { useCanvasStore } from "@/store/CanvasStoreProvider";
import { CanvasStoreState } from "@/store/store";
import { useLibraryRegistry, useLibraryRegistryStore } from "@sysdraw/models";
import { Loader2, Menu, X } from "lucide-react";
import { memo, useMemo, useState } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/shallow";
import { LibraryDropdown } from "./LibraryDropdown";
import { LibraryIcon } from "./LibraryIcon";

export const SYSDRAW_DRAG_DATA_FORMAT = "application/sysdraw";

const selector = (state: CanvasStoreState) => ({
  isInteractive: state.isInteractive,
});

export const Toolbar = memo(() => {
  const { isInteractive } = useCanvasStore(useShallow(selector));
  const registry = useLibraryRegistry();
  const selectedLib = useLibraryRegistryStore((s) => s.selectedLib);
  const { addNodeAtCenter } = useCanvasHandlers();

  const [isOpen, setIsOpen] = useState(true);
  const [isLibLoading, setIsLibLoading] = useState(false);

  const handleSelectLibrary = async (id: string) => {
    setIsLibLoading(true);
    try {
      await registry.selectLibrary(id);
    } catch (err) {
      console.error("Failed to select library", err);
    } finally {
      setIsLibLoading(false);
    }
  };

  console.log("rendered");

  const { nodes, groups } = useMemo(() => {
    const all = selectedLib?.nodes || [];
    return {
      nodes: all.filter((n) => n.type === "node"),
      groups: all.filter((n) => n.type === "group"),
    };
  }, [selectedLib]);

  /**
   * Handler for when a node or group is dragged from the toolbar
   */
  function onDragStart(
    event: React.DragEvent<HTMLDivElement>,
    data: DnDTransferData,
  ) {
    if (!isInteractive) {
      toast.error("Please unlock the canvas to add nodes and groups.");
      return;
    }
    event.dataTransfer.setData(SYSDRAW_DRAG_DATA_FORMAT, JSON.stringify(data));
    event.dataTransfer.effectAllowed = "move";
  }

  /**
   * Handler for when a node or group is clicked in the toolbar
   */
  function handleClick(data: DnDTransferData) {
    if (!isInteractive) {
      toast.error("Please unlock the canvas to add nodes and groups.");
      return;
    }
    addNodeAtCenter(data);
  }

  return (
    <>
      {/* menu button shown at top left when toolbar is closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open Toolbar"
          title="Open Toolbar"
          className="fixed top-4 left-4 z-30 bg-surface border border-border rounded-lg p-2.5 shadow-md hover:bg-dim flex items-center justify-center text-secondary hover:text-text cursor-pointer transition-colors"
        >
          <Menu className="size-5" />
        </button>
      )}

      {/* toolbar */}
      <div
        data-no-context-menu
        className={cn(
          "absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-surface border border-border rounded-lg py-2 flex flex-col gap-3 shadow-md min-w-35 transition-all duration-300 ease-in-out",
          isOpen
            ? "translate-x-0 opacity-100 pointer-events-auto"
            : "-translate-x-[calc(100%+2rem)] opacity-0 pointer-events-none",
        )}
      >
        {/* libraries label & close button */}
        <div className="flex items-center justify-between px-4">
          <h5 className="text-xs text-secondary uppercase">Libraries</h5>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded text-secondary hover:text-text hover:bg-dim cursor-pointer transition-colors"
            aria-label="Close Toolbar"
            title="Close Toolbar"
          >
            <X className="size-3.5" />
          </button>
        </div>

        <LibraryDropdown onSelectLibrary={handleSelectLibrary} />

        <Divider />

        <div className="relative flex flex-col gap-3">
          <div className="flex flex-col gap-2 px-4">
            <h5 className="text-xs text-secondary uppercase">Nodes</h5>
            <div className="h-56 overflow-y-auto overflow-x-hidden grid grid-cols-3 gap-2 content-start pr-1">
              {nodes.length === 0 ? (
                <span className="text-[11px] text-secondary col-span-3 italic">
                  No nodes available
                </span>
              ) : (
                nodes.map((node) => {
                  const { label, icon, id } = node;
                  return (
                    <div
                      key={id}
                      draggable
                      onDragStart={(e) => onDragStart(e, { kind: "node", id })}
                      onClick={() => handleClick({ kind: "node", id })}
                      className="group relative p-2 bg-bg border border-border rounded text-sm cursor-grab active:cursor-grabbing text-text text-center font-extrabold flex items-center justify-center hover:bg-surface/50 transition-colors"
                    >
                      <LibraryIcon icon={icon} size={30} />
                      <Tooltip text={label} />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <Divider />

          <div className="flex flex-col gap-2 px-4 mb-2">
            <h5 className="text-xs text-secondary uppercase">Groups</h5>
            <div className="h-44 overflow-y-auto overflow-x-hidden flex flex-col gap-2 pr-1">
              {groups.length === 0 ? (
                <span className="text-[11px] text-secondary italic">
                  No groups available
                </span>
              ) : (
                groups.map((group) => {
                  const { label, icon, id } = group;
                  return (
                    <div
                      key={id}
                      draggable
                      onDragStart={(e) => onDragStart(e, { kind: "group", id })}
                      onClick={() => handleClick({ kind: "group", id })}
                      className="group relative px-3 py-2 bg-bg border border-dashed border-secondary rounded text-sm cursor-grab active:cursor-grabbing text-text font-medium flex items-center gap-2 hover:bg-surface/50 transition-colors max-w-44"
                    >
                      {icon && <LibraryIcon icon={icon} size={20} />}
                      <span className="truncate">{label}</span>
                      <Tooltip text={label} />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* loading overlay */}
          {isLibLoading && (
            <div className="absolute -inset-x-1 -top-3 -bottom-2 z-20 flex flex-col items-center justify-center bg-linear-to-b from-surface/20 via-surface/75 to-surface/30 dark:from-bg/20 dark:via-bg/75 dark:to-bg/30 backdrop-blur-xs overflow-hidden pointer-events-auto transition-opacity duration-300 glass-overlay-fade">
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 dark:via-white/15 to-transparent animate-shimmer pointer-events-none" />
              <div className="relative z-10 flex items-center justify-center p-2 rounded-full bg-surface/90 dark:bg-surface/90 backdrop-blur-md border border-border shadow-md text-primary animate-pulse">
                <Loader2 className="size-4 animate-spin text-primary" />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
});
