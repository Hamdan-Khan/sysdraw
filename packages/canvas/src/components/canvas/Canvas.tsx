import { CanvasContextMenu } from "@/components/context-menu/ContextMenu";
import { ControlsBar } from "@/components/controls/ControlsBar";
import { DndWrapper } from "@/components/dnd/DnDWrapper";
import { edgeTypes } from "@/components/edges/EdgeTypes";
import { createNodeTypes } from "@/components/nodes/createNodeTypes";
import { Toolbar } from "@/components/toolbar/Toolbar";
import { useCanvasExport } from "@/hooks/useCanvasExport";
import { useCanvasHandlers } from "@/hooks/useCanvasHandlers";
import { useCanvasStorage } from "@/hooks/useCanvasStorage";
import { useShortcuts } from "@/hooks/useShortcuts";
import { CanvasStoreProvider, useCanvasStore } from "@/store/CanvasStoreProvider";
import { CanvasStoreState } from "@/store/store";
import { LibraryRegistry, LibraryRegistryProvider, useLibraryRegistryStore } from "@sysdraw/models";
import { ReactFlow, ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { createRef, useMemo } from "react";
import { Toaster } from "sonner";
import { StoreApi } from "zustand";
import { useShallow } from "zustand/shallow";
import "./canvas.css";
import { CanvasGrid } from "./CanvasGrid";

export interface CanvasProps {
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

  // registers keyboard shortcuts and custom context menu
  const { contextMenu, closeContextMenu } = useShortcuts();

  // syncs current canvas to / from localStorage
  useCanvasStorage();

  // canvas export renderer, mounted on export operations
  const { ExportCanvas } = useCanvasExport();

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
          // snapToGrid={false}
          // snapGrid={[-5, -5]}
          // nodeDragThreshold={5}
        >
          <CanvasGrid id="canvas" />
        </ReactFlow>
      </DndWrapper>
      <CanvasContextMenu contextMenu={contextMenu} closeContextMenu={closeContextMenu} />
      {ExportCanvas}
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
