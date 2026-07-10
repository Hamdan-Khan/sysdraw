import type { BaseGroupData } from "@sysdraw/models";

export const GenericGroup = ({ data }: { data: BaseGroupData }) => {
  return (
    <div className="w-full h-full border-2 border-dashed border-border bg-transparent rounded-xl p-2.5 relative">
      <div
        className="absolute -top-3 left-5 bg-bg px-2 font-bold text-sm pointer-events-auto"
        style={{ color: data.color || "var(--color-secondary)" }}
      >
        {data.label}
      </div>
    </div>
  );
};
