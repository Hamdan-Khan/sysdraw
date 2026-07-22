import { RegisteredEdges } from "@sysdraw/models";
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  getSmoothStepPath,
  getStraightPath,
  ReactFlowState,
  useReactFlow,
  useStore,
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
  label,
}: EdgeProps) => {
  const { zoom } = useViewport();
  const { setEdges, setNodes } = useReactFlow();

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
      [edgePath, labelX, labelY] = getSmoothStepPath({ ...pathParams, borderRadius: 0 });
      break;
    case RegisteredEdges.SMOOTHSTEP:
    default:
      [edgePath, labelX, labelY] = getSmoothStepPath(pathParams);
      break;
  }

  // raise z-index when selected so the option bar renders above other edges
  const edgeStyle = selected ? { ...style, zIndex: 1000 } : style;

  const handleLabelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nodes) =>
      nodes.some((n) => n.selected) ? nodes.map((n) => ({ ...n, selected: false })) : nodes,
    );
    setEdges((edges) =>
      edges.map((edge) => ({
        ...edge,
        selected: edge.id === id,
      })),
    );
  };

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        markerStart={markerStart}
        style={edgeStyle}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              transformOrigin: "center center",
              pointerEvents: "all",
            }}
            className="nodrag nopan px-2 py-0.5 rounded bg-white text-primary text-xs font-medium whitespace-nowrap cursor-pointer select-none"
            onClick={handleLabelClick}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
      {selected && (
        <EdgeOptionBarContainer edgeId={id} labelX={labelX} labelY={labelY} zoom={zoom} />
      )}
    </>
  );
};

/**
 * selector that returns true if only one element is selected (node or edge)
 *
 * to avoid rendering multiple edge option bars when multiple elements are selected.
 */
const isOnlySelectedSelector = (s: ReactFlowState) => {
  let count = 0;
  for (const n of s.nodes) {
    if (n.selected) {
      count++;
    }
  }
  for (const e of s.edges) {
    if (e.selected) {
      count++;
    }
  }
  return count === 1;
};

const EdgeOptionBarContainer = ({
  edgeId,
  labelX,
  labelY,
  zoom,
}: {
  edgeId: string;
  labelX: number;
  labelY: number;
  zoom: number;
}) => {
  const isOnlySelected = useStore(isOnlySelectedSelector);

  if (!isOnlySelected) {
    return null;
  }

  return (
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
        <EdgeOptionBar edgeId={edgeId} />
      </div>
    </EdgeLabelRenderer>
  );
};
