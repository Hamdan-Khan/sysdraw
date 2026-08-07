import { renderToSvg } from "@/lib/svg/svgRenderer";
import { CanvasStoreState } from "@/store/store";
import { MarkerType, Position, type Edge, type Node } from "@xyflow/react";
import { RegisteredEdges } from "@zero-sketch/models";
import { describe, expect, it, vi } from "vitest";

function createMockStore(
  nodes: Node[],
  edges: Edge[],
  grid = true,
): CanvasStoreState {
  const nodesMap = new Map(nodes.map((n) => [n.id, n]));
  return {
    nodes,
    nodesMap,
    edges,
    history: { past: [], future: [] },
    globalEdgeType: RegisteredEdges.STRAIGHT,
    globalEdgeAnimated: false,
    globalEdgeMarkerEnd: undefined,
    isInteractive: true,
    grid,
    isExporting: false,
    exportOptions: {
      background: "white",
      scale: 1,
      showGrid: true,
      padding: 20,
    },
    isNodeLocked: () => false,
    onNodesChange: () => {},
    onEdgesChange: () => {},
    setNodes: () => {},
    setEdges: () => {},
    commit: () => {},
    undo: () => {},
    redo: () => {},
    setIsInteractive: () => {},
    setGlobalEdgeType: () => {},
    setGlobalEdgeAnimated: () => {},
    setGlobalEdgeMarkerEnd: () => {},
    setGrid: () => {},
    setIsExporting: () => {},
    setExportOptions: () => {},
  };
}

describe("renderToSvg edge rendering", () => {
  const sampleNodes: Node[] = [
    {
      id: "node-1",
      position: { x: 100, y: 100 },
      measured: { width: 100, height: 60 },
      data: {
        title: "Node 1",
        handles: [
          { id: "h-bottom", type: "source", position: Position.Bottom },
        ],
      },
    },
    {
      id: "node-2",
      position: { x: 300, y: 300 },
      measured: { width: 100, height: 60 },
      data: {
        title: "Node 2",
        handles: [{ id: "h-top", type: "target", position: Position.Top }],
      },
    },
  ];

  it("renders edges layer before nodes layer", () => {
    const edges: Edge[] = [
      {
        id: "edge-1",
        source: "node-1",
        target: "node-2",
        sourceHandle: "h-bottom",
        targetHandle: "h-top",
        type: RegisteredEdges.STRAIGHT,
      },
    ];

    const store = createMockStore(sampleNodes, edges);
    const dataUrl = renderToSvg(store, 800, 600);
    const svgText = decodeURIComponent(
      dataUrl.replace(/^data:image\/svg\+xml;charset=utf-8,/, ""),
    );

    expect(svgText).toContain('<g id="edges-group">');
    expect(svgText).toContain('<g id="nodes-group">');

    const edgesIndex = svgText.indexOf('<g id="edges-group">');
    const nodesIndex = svgText.indexOf('<g id="nodes-group">');

    expect(edgesIndex).toBeLessThan(nodesIndex);
  });

  it("renders path elements for different edge types (straight, bezier, step, smoothstep)", () => {
    const edges: Edge[] = [
      {
        id: "edge-straight",
        source: "node-1",
        target: "node-2",
        sourceHandle: "h-bottom",
        targetHandle: "h-top",
        type: RegisteredEdges.STRAIGHT,
      },
      {
        id: "edge-bezier",
        source: "node-1",
        target: "node-2",
        sourceHandle: "h-bottom",
        targetHandle: "h-top",
        type: RegisteredEdges.BEZIER,
      },
      {
        id: "edge-step",
        source: "node-1",
        target: "node-2",
        sourceHandle: "h-bottom",
        targetHandle: "h-top",
        type: RegisteredEdges.STEP,
      },
      {
        id: "edge-smoothstep",
        source: "node-1",
        target: "node-2",
        sourceHandle: "h-bottom",
        targetHandle: "h-top",
        type: RegisteredEdges.SMOOTHSTEP,
      },
    ];

    const store = createMockStore(sampleNodes, edges);
    const dataUrl = renderToSvg(store, 800, 600);
    const svgText = decodeURIComponent(
      dataUrl.replace(/^data:image\/svg\+xml;charset=utf-8,/, ""),
    );

    // Should render 4 path elements in edges group
    const pathMatches = svgText.match(/<path [^>]*d="M/g);
    expect(pathMatches).not.toBeNull();
    expect(pathMatches!.length).toBeGreaterThanOrEqual(4);
  });

  it("renders marker defs and attaches marker-end attribute when markerEnd is set", () => {
    const edges: Edge[] = [
      {
        id: "edge-closed",
        source: "node-1",
        target: "node-2",
        sourceHandle: "h-bottom",
        targetHandle: "h-top",
        markerEnd: { type: MarkerType.ArrowClosed },
      },
    ];

    const store = createMockStore(sampleNodes, edges);
    const dataUrl = renderToSvg(store, 800, 600);
    const svgText = decodeURIComponent(
      dataUrl.replace(/^data:image\/svg\+xml;charset=utf-8,/, ""),
    );

    expect(svgText).toContain('id="svg-renderer-marker-arrowclosed"');
    expect(svgText).toContain(
      'marker-end="url(#svg-renderer-marker-arrowclosed)"',
    );
  });

  it("renders edge labels with pill rectangle background and centered text", () => {
    const edges: Edge[] = [
      {
        id: "edge-labeled",
        source: "node-1",
        target: "node-2",
        sourceHandle: "h-bottom",
        targetHandle: "h-top",
        label: "HTTP Request",
      },
    ];

    const store = createMockStore(sampleNodes, edges);
    const dataUrl = renderToSvg(store, 800, 600);
    const svgText = decodeURIComponent(
      dataUrl.replace(/^data:image\/svg\+xml;charset=utf-8,/, ""),
    );

    expect(svgText).toContain(">HTTP Request</text>");
    expect(svgText).toContain('<rect x="');
  });

  it("skips edge and logs console.error when specified handle is missing from node", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const invalidEdges: Edge[] = [
      {
        id: "edge-invalid",
        source: "node-1",
        target: "node-2",
        sourceHandle: "non-existent-handle",
        targetHandle: "h-top",
      },
    ];

    const store = createMockStore(sampleNodes, invalidEdges);
    const dataUrl = renderToSvg(store, 800, 600);
    const svgText = decodeURIComponent(
      dataUrl.replace(/^data:image\/svg\+xml;charset=utf-8,/, ""),
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      'Edge edge-invalid: source handle "non-existent-handle" not found on node "node-1".',
    );
    expect(svgText).not.toContain('id="edges-group"');

    consoleSpy.mockRestore();
  });

  it("skips edge and logs console.error when source or target node is missing", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const invalidEdges: Edge[] = [
      {
        id: "edge-missing-node",
        source: "node-1",
        target: "node-missing",
      },
    ];

    const store = createMockStore(sampleNodes, invalidEdges);
    renderToSvg(store, 800, 600);

    expect(consoleSpy).toHaveBeenCalledWith(
      'Edge edge-missing-node: source node "node-1" or target node "node-missing" not found.',
    );

    consoleSpy.mockRestore();
  });
});
