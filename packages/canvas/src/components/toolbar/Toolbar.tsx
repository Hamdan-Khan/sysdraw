import { RegisteredGroups, RegisteredNodes } from "@sysdraw/models";

const NODE_TYPES = Object.values(RegisteredNodes);
const GROUP_TYPES = Object.values(RegisteredGroups);

export const Toolbar = () => {
  return (
    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-surface border border-border rounded-lg p-4 flex flex-col gap-3 shadow-md max-h-[80vh] overflow-y-auto">
      <div className="font-bold mb-2 text-primary">Library</div>

      <div className="text-xs text-secondary uppercase">Nodes</div>
      {NODE_TYPES.map((type) => (
        <div
          key={type}
          className="px-3 py-2 bg-bg border border-border rounded text-sm cursor-grab text-text text-center font-extrabold"
          title="Drag and drop feature coming soon"
        >
          {type}
        </div>
      ))}

      <div className="text-xs text-secondary uppercase mt-2">Groups</div>
      {GROUP_TYPES.map((type) => (
        <div
          key={type}
          className="px-3 py-2 bg-bg border border-dashed border-secondary rounded text-sm cursor-grab text-text text-center"
          title="Drag and drop feature coming soon"
        >
          {type}
        </div>
      ))}
    </div>
  );
};
