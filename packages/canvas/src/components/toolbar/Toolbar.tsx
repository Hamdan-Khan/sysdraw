import { RegisteredGroups, RegisteredNodes } from "@sysdraw/models";
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
      <div className="flex flex-col gap-3 px-4">
        <h5 className="text-xs text-secondary uppercase">Nodes</h5>
        {NODE_TYPES.map((type) => (
          <div
            key={type}
            draggable
            onDragStart={(e) => onDragStart(e, { kind: "node", type })}
            className="px-3 py-2 bg-bg border border-border rounded text-sm cursor-grab active:cursor-grabbing text-text text-center font-extrabold"
          >
            {type}
          </div>
        ))}
      </div>

      <Divider />

      <div className="flex flex-col gap-3 px-4 mb-2">
        <h5 className="text-xs text-secondary uppercase">Groups</h5>
        {GROUP_TYPES.map((type) => (
          <div
            key={type}
            draggable
            onDragStart={(e) => onDragStart(e, { kind: "group", type })}
            className="px-3 py-2 bg-bg border border-dashed border-secondary rounded text-sm cursor-grab active:cursor-grabbing text-text text-center"
          >
            {type}
          </div>
        ))}
      </div>
    </div>
  );
};

// todo: add icons instead of titles, titles should appear as tooltips
