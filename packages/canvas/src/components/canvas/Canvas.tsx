import { ReactFlow, ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { createRef } from "react";
import { Toaster } from "sonner";
import { StoreApi, useStore } from "zustand";
import { useShallow } from "zustand/shallow";
import { useCanvasHandlers, useShortcuts } from "../../hooks";
import { CanvasStoreState } from "../../store";
import { CanvasContextMenu } from "../context-menu";
import { ControlsBar } from "../controls";
import { DndWrapper } from "../dnd";
import { edgeTypes } from "../edges";
import { groupTypes } from "../nodes/group";
import { nodeTypes as coreNodeTypes } from "../nodes/node";
import { Toolbar } from "../toolbar";
import "./canvas.css";
import { CanvasGrid } from "./CanvasGrid";

interface CanvasProps {
  canvasState: StoreApi<CanvasStoreState>;
}

const selector = (state: CanvasStoreState) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  isInteractive: state.isInteractive,
});

const combinedNodeTypes = { ...coreNodeTypes, ...groupTypes };

const CanvasElement = ({ canvasState }: CanvasProps) => {
  const dndWrapperRef = createRef<HTMLDivElement>();

  const { edges, nodes, onEdgesChange, onNodesChange, isInteractive } = useStore(
    canvasState,
    useShallow(selector),
  );

  const { onDragOver, onDrop, onConnect, onNodeDragStart, onNodeDrag, onNodeDragStop } =
    useCanvasHandlers(canvasState);

  const { contextMenu, closeContextMenu } = useShortcuts(canvasState);

  return (
    <div className="w-screen h-screen bg-bg relative" style={{ width: "100%", height: "100%" }}>
      <DndWrapper wrapperRef={dndWrapperRef} onDrop={onDrop} onDragOver={onDragOver}>
        <Toolbar canvasState={canvasState} />
        <ControlsBar canvasState={canvasState} />
        <ReactFlow
          nodes={nodes}
          nodeTypes={combinedNodeTypes}
          edges={edges}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStart={onNodeDragStart}
          onNodeDrag={onNodeDrag}
          onNodeDragStop={onNodeDragStop}
          nodesDraggable={isInteractive}
          nodesConnectable={isInteractive}
          // todo: fix nodes being able to be deleted after selected and switched to un-interative mode
          elementsSelectable={isInteractive}
          fitView
          className="bg-transparent"
          proOptions={{ hideAttribution: true }}
        >
          <CanvasGrid canvasState={canvasState} />
        </ReactFlow>
      </DndWrapper>
      <CanvasContextMenu
        canvasState={canvasState}
        contextMenu={contextMenu}
        closeContextMenu={closeContextMenu}
      />
    </div>
  );
};

/**
 * The complete canvas for rendering everything
 */
const Canvas = (props: CanvasProps) => {
  return (
    <ReactFlowProvider>
      <Toaster />
      <CanvasElement {...props} />
    </ReactFlowProvider>
  );
};

export { Canvas };
