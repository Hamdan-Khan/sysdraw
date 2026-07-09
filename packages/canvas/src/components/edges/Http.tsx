import type { BaseEdgeData } from "@sysdraw/models";
import { BaseEdge, Edge, EdgeLabelRenderer, EdgeProps, getBezierPath } from "@xyflow/react";

export const HttpEdgeComponent = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  data,
}: EdgeProps<Edge<BaseEdgeData>>) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            }}
            className="absolute bg-surface px-2 py-1 rounded text-xs text-text border border-border pointer-events-auto nodrag nopan"
          >
            {data.protocol && <strong className="text-primary mr-1">{data.protocol}</strong>}
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};
