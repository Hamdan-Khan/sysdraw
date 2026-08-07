import { LibraryIcon } from "@/components/toolbar/library-dropdown/LibraryIcon";
import {
  GROUP_CONTAINER_CLASS_ID,
  GROUP_LABEL_CLASS_ID,
} from "@zero-sketch/common";
import { CanvasNodeData } from "../createNodeTypes";

export const GenericGroup = ({ data }: { data: CanvasNodeData }) => {
  return (
    <div
      className={`w-full h-full border border-dashed border-dim-border rounded-xl p-2.5 relative bg-dim ${GROUP_CONTAINER_CLASS_ID}`}
    >
      <div
        className={`absolute -top-3 left-5 bg-dim border border-dim-border rounded-2xl px-2 py-1 font-bold text-sm pointer-events-auto flex items-center gap-1 ${GROUP_LABEL_CLASS_ID}`}
        style={{ color: data?.color || "var(--color-secondary)" }}
      >
        {data?.icon ? (
          <LibraryIcon
            icon={data?.icon}
            className="w-5 h-5 text-text drop-shadow-sm"
          />
        ) : null}
        {data.label}
      </div>
    </div>
  );
};
