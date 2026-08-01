import type { DnDTransferData } from "@/components/canvas/types";
import { Divider } from "@/components/common/Divider";
import { Tooltip } from "@/components/common/Tooltip";
import { useAddNodeAtCenter } from "@/hooks/useAddNodeAtCenter";
import { cn } from "@/lib/utils";
import { useCanvasStore } from "@/store/CanvasStoreProvider";
import { CanvasStoreState } from "@/store/store";
import { useLibraryRegistry, useLibraryRegistryStore } from "@sysdraw/models";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Loader2, Menu, Plus, Search, X } from "lucide-react";
import { memo, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/shallow";
import { LibraryDropdown } from "./library-dropdown/LibraryDropdown";
import { LibraryIcon } from "./library-dropdown/LibraryIcon";
import { LocalLibraryDialog } from "./library-dropdown/LocalLibraryDialog";
import { SearchInput } from "./SearchInput";

export const SYSDRAW_DRAG_DATA_FORMAT = "application/sysdraw";

const selector = (state: CanvasStoreState) => ({
  isInteractive: state.isInteractive,
});

export const Toolbar = memo(() => {
  const { isInteractive } = useCanvasStore(useShallow(selector));
  const registry = useLibraryRegistry();
  const selectedLib = useLibraryRegistryStore((s) => s.selectedLib);
  const { addNodeAtCenter } = useAddNodeAtCenter();

  const [isOpen, setIsOpen] = useState(true);
  const [isLibLoading, setIsLibLoading] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [nodeSearch, setNodeSearch] = useState("");
  const [groupSearch, setGroupSearch] = useState("");
  const [isNodeSearchOpen, setIsNodeSearchOpen] = useState(false);
  const [isGroupSearchOpen, setIsGroupSearchOpen] = useState(false);

  const nodesRef = useRef(null);
  const groupsRef = useRef(null);

  const handleSelectLibrary = async (id: string) => {
    setIsLibLoading(true);
    try {
      await registry.selectLibrary(id);
      setNodeSearch("");
      setGroupSearch("");
      setIsNodeSearchOpen(false);
      setIsGroupSearchOpen(false);
    } catch (err) {
      console.error("Failed to select library", err);
    } finally {
      setIsLibLoading(false);
    }
  };

  const { nodes, groups } = useMemo(() => {
    const all = selectedLib?.nodes || [];
    return {
      nodes: all.filter((n) => n.type === "node"),
      groups: all.filter((n) => n.type === "group"),
    };
  }, [selectedLib]);

  const filteredNodes = useMemo(() => {
    if (!nodeSearch.trim()) return nodes;
    const query = nodeSearch.toLowerCase().trim();
    return nodes.filter(
      (n) =>
        n.label.toLowerCase().includes(query) ||
        n.id.toLowerCase().includes(query),
    );
  }, [nodes, nodeSearch]);

  const filteredGroups = useMemo(() => {
    if (!groupSearch.trim()) return groups;
    const query = groupSearch.toLowerCase().trim();
    return groups.filter(
      (g) =>
        g.label.toLowerCase().includes(query) ||
        g.id.toLowerCase().includes(query),
    );
  }, [groups, groupSearch]);

  const COLUMNS = 3;
  const rowCount = Math.ceil(filteredNodes.length / COLUMNS);

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => nodesRef.current,
    estimateSize: () => 48,
    gap: 8,
  });

  const groupVirtualizer = useVirtualizer({
    count: filteredGroups.length,
    getScrollElement: () => groupsRef.current,
    estimateSize: () => 38,
    gap: 8,
  });

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
          type="button"
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
          <h5 className="text-xs text-secondary font-bold uppercase">
            Libraries
          </h5>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsUploadDialogOpen(true)}
              className="p-1 rounded text-secondary hover:text-text hover:bg-dim cursor-pointer transition-colors"
              aria-label="Add local library"
            >
              <Tooltip text="Add local library" />
              <Plus className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded text-secondary hover:text-text hover:bg-dim cursor-pointer transition-colors"
              aria-label="Close Toolbar"
            >
              <Tooltip text="Close toolbar" />
              <X className="size-3.5" />
            </button>
          </div>
        </div>

        <LibraryDropdown
          onSelectLibrary={handleSelectLibrary}
          onOpenUploadDialog={() => setIsUploadDialogOpen(true)}
        />

        <Divider />

        <div className="relative flex flex-col gap-3">
          <div className="flex flex-col gap-2 px-4">
            <div className="flex items-center justify-between gap-2 min-h-6">
              <h5 className="text-xs text-secondary font-bold uppercase">
                Nodes
              </h5>
              {isNodeSearchOpen ? (
                <SearchInput
                  searchValue={nodeSearch}
                  setSearchValue={setNodeSearch}
                  onSearchOpenChange={setIsNodeSearchOpen}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setIsNodeSearchOpen(true)}
                  className="p-1 rounded text-secondary hover:text-text hover:bg-dim cursor-pointer transition-colors"
                  aria-label="Search nodes"
                >
                  <Tooltip text="Search nodes" direction="up" />
                  <Search className="size-3.5" />
                </button>
              )}
            </div>

            <div
              ref={nodesRef}
              className="min-h-44 max-h-56 overflow-y-auto overflow-x-hidden pr-1"
            >
              {filteredNodes.length === 0 ? (
                <span className="text-[11px] text-secondary italic block">
                  No nodes found
                </span>
              ) : (
                <div
                  style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: "100%",
                    position: "relative",
                  }}
                >
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const startIndex = virtualRow.index * COLUMNS;
                    const rowNodes = filteredNodes.slice(
                      startIndex,
                      startIndex + COLUMNS,
                    );

                    return (
                      <div
                        key={virtualRow.key}
                        data-index={virtualRow.index}
                        ref={rowVirtualizer.measureElement}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                        className="grid grid-cols-3 gap-2"
                      >
                        {rowNodes.map((node) => {
                          const { label, icon, id } = node;
                          return (
                            <div
                              key={id}
                              draggable
                              onDragStart={(e) =>
                                onDragStart(e, { kind: "node", id })
                              }
                              onClick={() => handleClick({ kind: "node", id })}
                              className="group relative p-2 bg-bg border border-border rounded text-sm cursor-grab active:cursor-grabbing text-text text-center font-extrabold flex items-center justify-center hover:bg-surface/50 transition-colors"
                            >
                              <LibraryIcon icon={icon} size={30} />
                              <Tooltip text={label} />
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <Divider />

          <div className="flex flex-col gap-2 px-4 mb-2">
            <div className="flex items-center justify-between gap-2 min-h-6">
              <h5 className="text-xs text-secondary font-bold uppercase">
                Groups
              </h5>
              {isGroupSearchOpen ? (
                <SearchInput
                  searchValue={groupSearch}
                  setSearchValue={setGroupSearch}
                  onSearchOpenChange={setIsGroupSearchOpen}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setIsGroupSearchOpen(true)}
                  className="p-1 rounded text-secondary hover:text-text hover:bg-dim cursor-pointer transition-colors"
                  aria-label="Search groups"
                >
                  <Tooltip text="Search groups" direction="up" />
                  <Search className="size-3.5" />
                </button>
              )}
            </div>

            <div
              ref={groupsRef}
              className="min-h-36 max-h-44 overflow-y-auto overflow-x-hidden w-44 pr-1"
            >
              {filteredGroups.length === 0 ? (
                <span className="text-[11px] text-secondary italic block">
                  No groups found
                </span>
              ) : (
                <div
                  style={{
                    height: `${groupVirtualizer.getTotalSize()}px`,
                    width: "100%",
                    position: "relative",
                  }}
                >
                  {groupVirtualizer.getVirtualItems().map((virtualRow) => {
                    const group = filteredGroups[virtualRow.index];
                    const { label, icon, id } = group;
                    return (
                      <div
                        key={virtualRow.key}
                        data-index={virtualRow.index}
                        ref={groupVirtualizer.measureElement}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                      >
                        <div
                          draggable
                          onDragStart={(e) =>
                            onDragStart(e, { kind: "group", id })
                          }
                          onClick={() => handleClick({ kind: "group", id })}
                          className="group relative px-3 py-2 bg-bg border border-dashed border-secondary rounded text-sm cursor-grab active:cursor-grabbing text-text font-medium flex items-center gap-2 hover:bg-surface/50 transition-colors w-44 max-w-44"
                        >
                          {icon && <LibraryIcon icon={icon} size={20} />}
                          <span className="truncate">{label}</span>
                          <Tooltip text={label} />
                        </div>
                      </div>
                    );
                  })}
                </div>
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

      <LocalLibraryDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
      />
    </>
  );
});
