export const GenericGroup = ({ data }: { data: { label: string; color?: string } }) => {
  return (
    <div className="w-full h-full border border-dashed border-dim-border rounded-xl p-2.5 relative bg-dim">
      <div
        className="absolute -top-3 left-5 bg-dim border border-dim-border rounded-2xl px-2 font-bold text-sm pointer-events-auto"
        style={{ color: data.color || "var(--color-secondary)" }}
      >
        {data.label}
      </div>
    </div>
  );
};
