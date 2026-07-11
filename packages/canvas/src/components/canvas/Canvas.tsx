import { Controls, ReactFlow, ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { createRef, useMemo } from "react";
import { StoreApi, useStore } from "zustand";
import { useShallow } from "zustand/shallow";
import { CanvasStoreState } from "../../store";
import { DndWrapper } from "../dnd";
import { edgeTypes } from "../edges";
import { groupTypes } from "../groups";
import { nodeTypes as coreNodeTypes } from "../nodes";
import { Toolbar } from "../toolbar";
import { useCanvasHandlers } from "./useCanvasHandlers";

interface CanvasProps {
  canvasState: StoreApi<CanvasStoreState>;
}

const selector = (state: CanvasStoreState) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
});

const CanvasElement = ({ canvasState }: CanvasProps) => {
  const dndWrapperRef = createRef<HTMLDivElement>();

  const { edges, nodes, onEdgesChange, onNodesChange } = useStore(
    canvasState,
    useShallow(selector),
  );

  const { onDragOver, onDrop, onConnect, onNodeDrag, onNodeDragStop } =
    useCanvasHandlers(canvasState);

  const combinedNodeTypes = useMemo(() => ({ ...coreNodeTypes, ...groupTypes }), []);

  return (
    <div className="w-screen h-screen bg-bg relative" style={{ width: "100%", height: "100%" }}>
      <DndWrapper wrapperRef={dndWrapperRef} onDrop={onDrop} onDragOver={onDragOver}>
        <Toolbar />
        <ReactFlow
          nodes={nodes}
          nodeTypes={combinedNodeTypes}
          edges={edges}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDrag={onNodeDrag}
          onNodeDragStop={onNodeDragStop}
          fitView
          className="bg-transparent"
          proOptions={{ hideAttribution: true }}
        >
          <Controls position="top-right" orientation="horizontal" />
        </ReactFlow>
      </DndWrapper>
    </div>
  );
};

/**
 * The complete canvas for rendering everything
 */
const Canvas = (props: CanvasProps) => {
  return (
    <ReactFlowProvider>
      <CanvasElement {...props} />
    </ReactFlowProvider>
  );
};

export { Canvas };
