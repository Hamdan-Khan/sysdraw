import {
  addEdge,
  Background,
  Controls,
  MiniMap,
  OnConnect,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback } from "react";
import { InitialCanvasStoreState } from "../store";

interface CanvasProps {
  canvasState: InitialCanvasStoreState;
}

const Canvas = ({ canvasState }: CanvasProps) => {
  const [nodes, onNodesChange] = useNodesState(canvasState.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(canvasState.edges);
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((edges) => addEdge(connection, edges)),
    [setEdges],
  );

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#0a0a0a" }}>
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        colorMode="dark"
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#333" gap={16} />
        <MiniMap />
        <Controls />
      </ReactFlow>
      ;
    </div>
  );
};

export { Canvas };
