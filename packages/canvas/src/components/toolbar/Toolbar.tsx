import {
  defaultGroupsMap,
  defaultNodesMap,
  RegisteredGroups,
  RegisteredNodes,
} from "@sysdraw/models";
import { IconsMap } from "../../assets";
import type { DnDTransferData } from "../canvas";
import { Divider } from "../common";

const NODE_TYPES = Object.values(RegisteredNodes);
const GROUP_TYPES = Object.values(RegisteredGroups);

export const SYSDRAW_DRAG_DATA_FORMAT = "application/sysdraw";

/**
 * Handler for when a node or group is dragged from the toolbar
 */
function onDragStart(event: React.DragEvent<HTMLDivElement>, data: DnDTransferData) {
  event.dataTransfer.setData(SYSDRAW_DRAG_DATA_FORMAT, JSON.stringify(data));
  event.dataTransfer.effectAllowed = "move";
}

export const Toolbar = () => {
  return (
    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-surface border border-border rounded-lg py-2 flex flex-col gap-3 shadow-md max-h-[80vh] overflow-y-auto">
      <div className="grid grid-cols-3 gap-3 px-4">
        <h5 className="text-xs text-secondary uppercase col-span-3">Nodes</h5>
        {NODE_TYPES.map((type) => {
          const Icon = IconsMap[type];
          const data = defaultNodesMap[type]();
          return (
            <div
              key={type}
              draggable
              onDragStart={(e) => onDragStart(e, { kind: "node", type })}
              className="group relative px-3 py-2 bg-bg border border-border rounded text-sm cursor-grab active:cursor-grabbing text-text text-center font-extrabold flex items-center justify-center hover:bg-surface/50 transition-colors"
            >
              <Icon size={24} strokeWidth={1.5} />
              <Tooltip text={data.label} />
            </div>
          );
        })}
      </div>

      <Divider />

      <div className="flex flex-col gap-3 px-4 mb-2">
        <h5 className="text-xs text-secondary uppercase">Groups</h5>
        {GROUP_TYPES.map((type) => {
          const data = defaultGroupsMap[type]();
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

const Tooltip = ({ text }: { text: string }) => {
  return (
    <>
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-md bg-black/90 text-white text-xs font-medium whitespace-nowrap opacity-0 scale-95 origin-bottom transition-all duration-150 ease-out group-hover:opacity-100 group-hover:scale-100 shadow-lg z-50">
        {text}
        {/* arrow */}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/90" />
      </span>
    </>
  );
};
