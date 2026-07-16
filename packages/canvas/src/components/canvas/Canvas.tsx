import { ControlButton, Controls, ReactFlow, ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ArchiveRestore, Save } from "lucide-react";
import { createRef } from "react";
import { Toaster } from "sonner";
import { StoreApi, useStore } from "zustand";
import { useShallow } from "zustand/shallow";
import { useCanvasHandlers } from "../../hooks/useCanvasHandlers";
import { useCanvasStorage } from "../../hooks/useCanvasStorage";
import { useGlobalCopyPasteShortcuts } from "../../hooks/useCopyPaste";
import { CanvasStoreState } from "../../store";
import { DndWrapper } from "../dnd";
import { edgeTypes } from "../edges";
import { groupTypes } from "../groups";
import { nodeTypes as coreNodeTypes } from "../nodes";
import { Toolbar } from "../toolbar";
import "./canvas.css";

interface CanvasProps {
  canvasState: StoreApi<CanvasStoreState>;
}

const selector = (state: CanvasStoreState) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
});

const combinedNodeTypes = { ...coreNodeTypes, ...groupTypes };

const CanvasElement = ({ canvasState }: CanvasProps) => {
  const dndWrapperRef = createRef<HTMLDivElement>();

  const { edges, nodes, onEdgesChange, onNodesChange } = useStore(
    canvasState,
    useShallow(selector),
  );

  const { onDragOver, onDrop, onConnect, onNodeDrag, onNodeDragStop } =
    useCanvasHandlers(canvasState);

  const { setRfInstance, onSave, onRestore } = useCanvasStorage(canvasState);

  useGlobalCopyPasteShortcuts();

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
          onInit={setRfInstance}
        >
          <Controls position="top-right" orientation="horizontal">
            <ControlButton onClick={() => onSave()}>
              <Save />
            </ControlButton>
            <ControlButton onClick={() => onRestore()}>
              <ArchiveRestore />
            </ControlButton>
          </Controls>
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
      <Toaster />
      <CanvasElement {...props} />
    </ReactFlowProvider>
  );
};

export { Canvas };
