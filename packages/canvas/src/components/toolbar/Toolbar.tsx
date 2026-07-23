import {
  defaultGroupsMap,
  NodeTypes,
  RegisteredGroups,
  useLibraryRegistryStore,
} from "@sysdraw/models";
import { useMemo } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/shallow";
import { CanvasStoreState, useCanvasStore } from "../../store";
import type { DnDTransferData } from "../canvas";
import { Divider, LibraryIcon, Tooltip } from "../common";
import { LibraryDropdown } from "./LibraryDropdown";

const GROUP_TYPES = Object.values(RegisteredGroups);

export const SYSDRAW_DRAG_DATA_FORMAT = "application/sysdraw";

const selector = (state: CanvasStoreState) => ({
  isInteractive: state.isInteractive,
});

export const Toolbar = () => {
  const { isInteractive } = useCanvasStore(useShallow(selector));
  const { loadedLibs } = useLibraryRegistryStore(useShallow((s) => ({ loadedLibs: s.loadedLibs })));

  const nodeTypes = useMemo(
    () =>
      Object.keys(loadedLibs)
        .map((key) => loadedLibs[key].nodes)
        .flat(),
    [loadedLibs],
  );

  /**
   * Handler for when a node or group is dragged from the toolbar
   */
  function onDragStart(event: React.DragEvent<HTMLDivElement>, data: DnDTransferData) {
    if (!isInteractive) {
      toast.error("Please unlock the canvas to add nodes and groups.");
      return;
    }
    event.dataTransfer.setData(SYSDRAW_DRAG_DATA_FORMAT, JSON.stringify(data));
    event.dataTransfer.effectAllowed = "move";
  }

  return (
    <div
      data-no-context-menu
      className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-surface border border-border rounded-lg py-2 flex flex-col gap-3 shadow-md"
    >
      <LibraryDropdown />
      <Divider />

      <div className="grid grid-cols-3 gap-3 px-4">
        <h5 className="text-xs text-secondary uppercase col-span-3">Nodes</h5>
        {nodeTypes.map((node) => {
          const { label, type, icon, id } = node;
          return (
            <div
              key={id}
              draggable
              onDragStart={(e) => onDragStart(e, { kind: "node", type: type as NodeTypes })}

              className="group relative px-3 py-2 bg-bg border border-border rounded text-sm cursor-grab active:cursor-grabbing text-text text-center font-extrabold flex items-center justify-center hover:bg-surface/50 transition-colors"
            >
              <LibraryIcon icon={icon} size={24} />
              <Tooltip text={label} />
            </div>
          );
        })}
      </div>

      <Divider />

      <div className="flex flex-col gap-3 px-4 mb-2">
        <h5 className="text-xs text-secondary uppercase">Groups</h5>
        {GROUP_TYPES.map((type) => {
          const data = defaultGroupsMap[type];
          return (
            <div
              key={type}
              draggable
              onDragStart={(e) => onDragStart(e, { kind: "group", type })}
              className="px-3 py-2 bg-bg border border-dashed border-secondary rounded text-sm cursor-grab active:cursor-grabbing text-text text-center"
            >
              {data.label}
            </div>
          );
        })}
      </div>
    </div>
  );
};
