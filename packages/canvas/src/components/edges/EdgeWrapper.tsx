import { RegisteredEdges } from "@sysdraw/models";
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  getSmoothStepPath,
  getStraightPath,
  useViewport,
} from "@xyflow/react";
import { EdgeOptionBar } from "./EdgeOptionBar";

const defaultStyle = {};

export const EdgeWrapper = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = defaultStyle,
  markerEnd,
  markerStart,
  selected,
  type,
}: EdgeProps) => {
  const { zoom } = useViewport();

  const pathParams = {
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  };

  let edgePath = "";
  let labelX = 0;
  let labelY = 0;

  switch (type) {
    case RegisteredEdges.BEZIER:
      [edgePath, labelX, labelY] = getBezierPath(pathParams);
      break;
    case RegisteredEdges.STRAIGHT:
      [edgePath, labelX, labelY] = getStraightPath(pathParams);
      break;
    case RegisteredEdges.STEP:
      // step is smoothstep with borderRadius 0 (xyflow does not export getStepPath)
      [edgePath, labelX, labelY] = getSmoothStepPath({ ...pathParams, borderRadius: 0 });
      break;
    case RegisteredEdges.SMOOTHSTEP:
    default:
      [edgePath, labelX, labelY] = getSmoothStepPath(pathParams);
      break;
  }

  // raise z-index when selected so the option bar renders above other edges
  const edgeStyle = selected ? { ...style, zIndex: 1000 } : style;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        markerStart={markerStart}
        style={edgeStyle}
      />
      {selected && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              // counter-scale by 1/zoom so the bar stays the same visual size at any zoom level
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px) scale(${1 / zoom})`,
              pointerEvents: "all",
              zIndex: 1000,
            }}
            className="nodrag nopan"
          >
            <EdgeOptionBar edgeId={id} />
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};
