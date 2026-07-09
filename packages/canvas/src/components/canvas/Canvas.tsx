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
import { useCallback, useMemo } from "react";
import { InitialCanvasStoreState } from "../../store";
import { edgeTypes } from "../edges";
import { groupTypes } from "../groups";
import { nodeTypes as coreNodeTypes } from "../nodes";
import { Toolbar } from "../toolbar";

interface CanvasProps {
  canvasState: InitialCanvasStoreState;
}

const Canvas = ({ canvasState }: CanvasProps) => {
  const [nodes, , onNodesChange] = useNodesState(canvasState.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(canvasState.edges);
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((edges) => addEdge(connection, edges)),
    [setEdges],
  );

  const combinedNodeTypes = useMemo(() => ({ ...coreNodeTypes, ...groupTypes }), []);

  return (
    <div className="w-screen h-screen bg-bg relative" style={{ width: "100%", height: "100%" }}>
      <Toolbar />
      <ReactFlow
        nodes={nodes}
        nodeTypes={combinedNodeTypes}
        onNodesChange={onNodesChange}
        edges={edges}
        edgeTypes={edgeTypes}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        colorMode="system"
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#333" gap={16} />
        <MiniMap />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export { Canvas };
