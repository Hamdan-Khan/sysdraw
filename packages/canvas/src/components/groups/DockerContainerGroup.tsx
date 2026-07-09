import type { BaseGroupData } from "@sysdraw/models";
import { Node, NodeProps } from "@xyflow/react";

export const DockerContainerGroupComponent = ({
  data,
  width,
  height,
}: NodeProps<Node<BaseGroupData>>) => {
  return (
    <div
      style={{
        width: width || 400,
        height: height || 300,
      }}
      className="border-2 border-dashed border-border bg-transparent rounded-xl p-2.5 relative"
    >
      <div
        className="absolute -top-3 left-5 bg-bg px-2 font-bold text-sm"
        style={{ color: data.color || "var(--color-secondary)" }}
      >
        {data.label}
      </div>
    </div>
  );
};
