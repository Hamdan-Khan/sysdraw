import { LibraryRegistry, LibraryRegistryProvider, useLibraryRegistryStore } from "@sysdraw/models";
import { ReactFlow, ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { createRef, useMemo } from "react";
import { Toaster } from "sonner";
import { StoreApi } from "zustand";
import { useShallow } from "zustand/shallow";
import { useCanvasHandlers, useShortcuts } from "../../hooks";
import { CanvasStoreProvider, CanvasStoreState, useCanvasStore } from "../../store";
import { CanvasContextMenu } from "../context-menu";
import { ControlsBar } from "../controls";
import { DndWrapper } from "../dnd";
import { edgeTypes } from "../edges";
import { createNodeTypes } from "../nodes";
import { Toolbar } from "../toolbar";
import "./canvas.css";
import { CanvasGrid } from "./CanvasGrid";

interface CanvasProps {
  canvasState: StoreApi<CanvasStoreState>;
  libraryRegistry: LibraryRegistry;
}

const selector = (state: CanvasStoreState) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  isInteractive: state.isInteractive,
});

const CanvasElement = () => {
  const dndWrapperRef = createRef<HTMLDivElement>();

  const { loadedLibs } = useLibraryRegistryStore(useShallow((s) => ({ loadedLibs: s.loadedLibs })));

  const nodeTypes = useMemo(() => createNodeTypes(loadedLibs), [loadedLibs]);

  const { edges, nodes, onEdgesChange, onNodesChange, isInteractive } = useCanvasStore(
    useShallow(selector),
  );

  const {
    onDragOver,
    onDrop,
    onConnect,
    onNodeDragStart,
    onNodeDrag,
    onNodeDragStop,
    onNodeContextMenu,
    onEdgeContextMenu,
    onPaneContextMenu,
  } = useCanvasHandlers();

  const { contextMenu, closeContextMenu } = useShortcuts();

  return (
    <div className="w-screen h-screen bg-bg relative" style={{ width: "100%", height: "100%" }}>
      <DndWrapper wrapperRef={dndWrapperRef} onDrop={onDrop} onDragOver={onDragOver}>
        <Toolbar />
        <ControlsBar />
        <ReactFlow
          nodes={nodes}
          nodeTypes={nodeTypes}
          edges={edges}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStart={onNodeDragStart}
          onNodeDrag={onNodeDrag}
          onNodeDragStop={onNodeDragStop}
          onNodeContextMenu={onNodeContextMenu}
          onEdgeContextMenu={onEdgeContextMenu}
          onPaneContextMenu={onPaneContextMenu}
          nodesDraggable={isInteractive}
          nodesConnectable={isInteractive}
          elementsSelectable={isInteractive}
          fitView
          className="bg-transparent"
          proOptions={{ hideAttribution: true }}
        >
          <CanvasGrid />
        </ReactFlow>
      </DndWrapper>
      <CanvasContextMenu contextMenu={contextMenu} closeContextMenu={closeContextMenu} />
    </div>
  );
};

/**
 * The complete canvas for rendering everything
 */
const Canvas = ({ canvasState, libraryRegistry }: CanvasProps) => {
  return (
    <CanvasStoreProvider store={canvasState}>
      <LibraryRegistryProvider registry={libraryRegistry}>
        <ReactFlowProvider>
          <Toaster />
          <CanvasElement />
        </ReactFlowProvider>
      </LibraryRegistryProvider>
    </CanvasStoreProvider>
  );
};

export { Canvas };
