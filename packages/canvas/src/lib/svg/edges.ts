import {
  CanvasNodeData,
  defaultHandles,
} from "@/components/nodes/createNodeTypes";
import {
  Edge,
  getBezierPath,
  getSmoothStepPath,
  getStraightPath,
  MarkerType,
  Node,
  Position,
} from "@xyflow/react";
import { NodeHandleConfig, RegisteredEdges } from "@zero-sketch/models";
import { createSvgElement } from "./utils";

function getHandlePosition(
  nodeX: number,
  nodeY: number,
  nodeWidth: number,
  nodeHeight: number,
  position: Position,
): { x: number; y: number } {
  switch (position) {
    case Position.Top:
      return { x: nodeX + nodeWidth / 2, y: nodeY };
    case Position.Bottom:
      return { x: nodeX + nodeWidth / 2, y: nodeY + nodeHeight };
    case Position.Left:
      return { x: nodeX, y: nodeY + nodeHeight / 2 };
    case Position.Right:
      return { x: nodeX + nodeWidth, y: nodeY + nodeHeight / 2 };
    default:
      return { x: nodeX + nodeWidth / 2, y: nodeY + nodeHeight / 2 };
  }
}

function resolveHandle(
  node: Node,
  handleId: string | null | undefined,
  handleType: "source" | "target",
): { x: number; y: number; position: Position } | null {
  const nodeData = node.data as CanvasNodeData;
  const handles = nodeData?.handles || defaultHandles;

  let handleConfig: NodeHandleConfig | null = null;
  if (handleId) {
    handleConfig = handles.find((h) => h.id === handleId) ?? null;
  } else {
    handleConfig = handles.find((h) => h.type === handleType) || handles[0];
  }

  if (!handleConfig) {
    return null;
  }

  const nodeWidth = node.measured?.width || 0;
  const nodeHeight = node.measured?.height || 0;
  const position =
    handleConfig.position ||
    (handleType === "source" ? Position.Bottom : Position.Top);

  const coords = getHandlePosition(
    node.position.x,
    node.position.y,
    nodeWidth,
    nodeHeight,
    position,
  );

  return { ...coords, position };
}

function getMarkerEndUrl(markerEnd: Edge["markerEnd"]): string | undefined {
  if (!markerEnd) return undefined;
  const type = typeof markerEnd === "string" ? markerEnd : markerEnd.type;
  if (type === MarkerType.ArrowClosed || type === "arrowclosed") {
    return "url(#svg-renderer-marker-arrowclosed)";
  }
  if (type === MarkerType.Arrow || type === "arrow") {
    return "url(#svg-renderer-marker-arrow)";
  }
  return undefined;
}

export function renderEdgesGroup(
  edges: Edge[],
  nodesMap: Map<string, Node>,
): SVGGElement | null {
  if (edges.length === 0) return null;

  const edgesGroup = createSvgElement("g", { id: "edges-group" });

  edges.forEach((edge) => {
    const sourceNode = nodesMap.get(edge.source);
    const targetNode = nodesMap.get(edge.target);

    if (!sourceNode || !targetNode) {
      console.error(
        `Edge ${edge.id}: source node "${edge.source}" or target node "${edge.target}" not found.`,
      );
      return;
    }

    const sourceHandle = resolveHandle(sourceNode, edge.sourceHandle, "source");
    const targetHandle = resolveHandle(targetNode, edge.targetHandle, "target");

    if (!sourceHandle) {
      console.error(
        `Edge ${edge.id}: source handle "${edge.sourceHandle}" not found on node "${edge.source}".`,
      );
      return;
    }

    if (!targetHandle) {
      console.error(
        `Edge ${edge.id}: target handle "${edge.targetHandle}" not found on node "${edge.target}".`,
      );
      return;
    }

    const pathParams = {
      sourceX: sourceHandle.x,
      sourceY: sourceHandle.y,
      sourcePosition: sourceHandle.position,
      targetX: targetHandle.x,
      targetY: targetHandle.y,
      targetPosition: targetHandle.position,
    };

    let edgePath = "";
    let labelX = 0;
    let labelY = 0;

    const edgeType = edge.type || RegisteredEdges.STRAIGHT;

    switch (edgeType) {
      case RegisteredEdges.BEZIER:
        [edgePath, labelX, labelY] = getBezierPath(pathParams);
        break;
      case RegisteredEdges.STRAIGHT:
        [edgePath, labelX, labelY] = getStraightPath(pathParams);
        break;
      case RegisteredEdges.STEP:
        [edgePath, labelX, labelY] = getSmoothStepPath({
          ...pathParams,
          borderRadius: 0,
        });
        break;
      case RegisteredEdges.SMOOTHSTEP:
      default:
        [edgePath, labelX, labelY] = getSmoothStepPath(pathParams);
        break;
    }

    const strokeColor = (edge.style?.stroke as string) || "#94a3b8";
    const strokeWidth = (edge.style?.strokeWidth as number | string) || 1;

    const pathAttrs: Record<string, string | number> = {
      d: edgePath,
      fill: "none",
      stroke: strokeColor,
      "stroke-width": strokeWidth,
    };

    const markerUrl = getMarkerEndUrl(edge.markerEnd);
    if (markerUrl) {
      pathAttrs["marker-end"] = markerUrl;
    }

    const pathEl = createSvgElement("path", pathAttrs);
    edgesGroup.appendChild(pathEl);

    if (edge.label) {
      const labelTextStr = String(edge.label);
      const fontSize = 12;
      const paddingX = 8;
      const paddingY = 4;
      const textWidth = Math.max(20, labelTextStr.length * (fontSize * 0.55));
      const pillWidth = Math.round(textWidth + paddingX * 2);
      const pillHeight = Math.round(fontSize + paddingY * 2);

      const labelG = createSvgElement("g");
      const rectEl = createSvgElement("rect", {
        x: labelX - pillWidth / 2,
        y: labelY - pillHeight / 2,
        width: pillWidth,
        height: pillHeight,
        fill: "#ffffff",
        rx: 4,
        ry: 4,
      });
      const textEl = createSvgElement("text", {
        x: labelX,
        y: labelY,
        "text-anchor": "middle",
        "dominant-baseline": "central",
        "font-family": "Inter, system-ui, sans-serif",
        "font-size": fontSize,
        "font-weight": "500",
        fill: "#0f172a",
      });
      textEl.textContent = labelTextStr;

      labelG.appendChild(rectEl);
      labelG.appendChild(textEl);
      edgesGroup.appendChild(labelG);
    }
  });

  if (edgesGroup.childNodes.length === 0) {
    return null;
  }

  return edgesGroup;
}
