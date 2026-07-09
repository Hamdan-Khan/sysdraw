import {
  BaseGroupData,
  BaseNodeData,
  defaultGroupsMap,
  defaultNodesMap,
  RegisteredGroups,
  RegisteredNodes,
} from "@sysdraw/models";
import {
  addEdge,
  Background,
  Controls,
  OnConnect,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { createRef, useCallback, useMemo } from "react";
import { InitialCanvasStoreState } from "../../store";
import { DndWrapper } from "../dnd";
import { edgeTypes } from "../edges";
import { groupTypes } from "../groups";
import { nodeTypes as coreNodeTypes } from "../nodes";
import { SYSDRAW_DRAG_DATA_FORMAT, Toolbar } from "../toolbar";
import { DnDTransferData } from "./types";

interface CanvasProps {
  canvasState: InitialCanvasStoreState;
}

const CanvasElement = ({ canvasState }: CanvasProps) => {
  const dndWrapperRef = createRef<HTMLDivElement>();
  const [nodes, setNodes, onNodesChange] = useNodesState(canvasState.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(canvasState.edges);
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((edges) => addEdge(connection, edges)),
    [setEdges],
  );
  const { screenToFlowPosition } = useReactFlow();

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const raw = event.dataTransfer.getData(SYSDRAW_DRAG_DATA_FORMAT);

      if (!raw) {
        console.error("No drag n drop data (e.dataTransfer) found.");
        return;
      }

      const { kind, type }: DnDTransferData = JSON.parse(raw);

      // screenToFlowPosition converts client (screen) coords straight to
      // flow coords, accounting for pan/zoom
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      let defaultData: BaseNodeData | BaseGroupData;

      if (kind === "node") {
        defaultData = defaultNodesMap[type as RegisteredNodes];
      } else {
        defaultData = defaultGroupsMap[type as RegisteredGroups];
      }

      if (!defaultData) {
        console.error(`Error getting the default data for the node "${type}" and kind "${kind}"`);
        return;
      }

      setNodes((nodes) => [
        ...nodes,
        { id: crypto.randomUUID(), type, position, data: defaultData },
      ]);
    },
    [screenToFlowPosition, setNodes],
  );

  const combinedNodeTypes = useMemo(() => ({ ...coreNodeTypes, ...groupTypes }), []);

  return (
    <div className="w-screen h-screen bg-bg relative" style={{ width: "100%", height: "100%" }}>
      <DndWrapper wrapperRef={dndWrapperRef} onDrop={onDrop} onDragOver={onDragOver}>
        <Toolbar />
        <ReactFlow
          nodes={nodes}
          nodeTypes={combinedNodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          edges={edges}
          edgeTypes={edgeTypes}
          onConnect={onConnect}
          fitView
          className="bg-transparent"
          proOptions={{ hideAttribution: true }}
        >
          <Background color="var(--color-border)" gap={16} />
          <Controls position="top-right" orientation="horizontal" />
        </ReactFlow>
      </DndWrapper>
    </div>
  );
};

/**
 * The complete canvas for rendering the
 */
const Canvas = (props: CanvasProps) => {
  return (
    <ReactFlowProvider>
      <CanvasElement {...props} />
    </ReactFlowProvider>
  );
};

export { Canvas };
