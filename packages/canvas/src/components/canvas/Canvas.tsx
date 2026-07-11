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
  Controls,
  Node,
  OnConnect,
  OnNodeDrag,
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
import { clampPositionInsideGroup, getIntersectingArea, getNodeRect } from "./utils";

interface CanvasProps {
  canvasState: InitialCanvasStoreState;
}

const CanvasElement = ({ canvasState }: CanvasProps) => {
  const dndWrapperRef = createRef<HTMLDivElement>();
  const [nodes, setNodes, onNodesChange] = useNodesState(canvasState.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(canvasState.edges);
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((prev) => addEdge(connection, prev)),
    [setEdges],
  );
  const { screenToFlowPosition, getIntersectingNodes, getInternalNode } = useReactFlow();

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

      setNodes((prev) => [...prev, { id: crypto.randomUUID(), type, position, data: defaultData }]);
    },
    [screenToFlowPosition, setNodes],
  );

  /**
   * returns the group nodes that the node is intersecting with
   */
  const getIntersectingNodeGroup = useCallback(
    (node: Node) => {
      return getIntersectingNodes(node).filter((n) => {
        const { type } = n;
        if (!type) {
          return false;
        }
        const isGroup = Object.values(RegisteredGroups).includes(type as RegisteredGroups);
        const isNotTheDraggingNode = n.id !== node.id;

        return isGroup && isNotTheDraggingNode;
      });
    },
    [getIntersectingNodes],
  );

  const onNodeDrag: OnNodeDrag<Node> = useCallback(
    (e: MouseEvent | TouchEvent, node: Node) => {
      const intersections = getIntersectingNodeGroup(node);
      const group = intersections[0];

      let area = 0;

      if (group) {
        const nodeInternal = getInternalNode(node.id);
        const groupInternal = getInternalNode(group.id);
        if (!nodeInternal || !groupInternal) {
          return;
        }
        area = getIntersectingArea(getNodeRect(nodeInternal), getNodeRect(groupInternal));
      }

      const nodeArea = (node.measured?.width ?? 0) * (node.measured?.height ?? 0);
      // 1/4th of the dragged node should be intersecting to be considered as intersecting
      const isIntersectingEnough = nodeArea !== 0 ? area / nodeArea >= 0.25 : false;

      // apply the bold borders style to the group node when the node is dragged over it
      setNodes((ns) =>
        ns.map((n) => {
          // if its the target group node
          if (n.id === group?.id && isIntersectingEnough) {
            return {
              ...n,
              className: "ring-2 ring-primary bg-primary/5 rounded-xl transition-all",
            };
          }
          // if its not the target group, remove the styles
          if (n.className?.includes("ring-2")) {
            return { ...n, className: "" };
          }
          return n;
        }),
      );
    },
    [getIntersectingNodeGroup, setNodes, getInternalNode],
  );

  const onNodeDragStop: OnNodeDrag<Node> = useCallback(
    (e: MouseEvent | TouchEvent, node: Node) => {
      const intersections = getIntersectingNodeGroup(node);
      const dropTarget = intersections[0];

      if (dropTarget) {
        const nodeInternal = getInternalNode(node.id);
        const groupInternal = getInternalNode(dropTarget.id);

        if (!nodeInternal || !groupInternal) {
          return;
        }

        const nodeRect = getNodeRect(nodeInternal);
        const groupRect = getNodeRect(groupInternal);

        const area = getIntersectingArea(nodeRect, groupRect);
        const nodeArea = nodeRect.width * nodeRect.height;
        // only reparent when at least 1/4th of the node overlaps the group
        const isIntersectingEnough = nodeArea !== 0 ? area / nodeArea >= 0.25 : false;

        if (isIntersectingEnough) {
          setNodes((ns) =>
            ns.map((n) => {
              // remove the bold style from the group once node is dropped
              if (n.id === dropTarget.id) {
                return { ...n, className: "" };
              }
              if (n.id === node.id) {
                const rawRelPos = {
                  x: nodeRect.x - groupRect.x,
                  y: nodeRect.y - groupRect.y,
                };
                // clamp so the node is fully inside the group
                const position = clampPositionInsideGroup(
                  rawRelPos,
                  nodeRect.width,
                  nodeRect.height,
                  groupRect.width,
                  groupRect.height,
                );
                return { ...n, position, parentId: dropTarget.id };
              }
              return n;
            }),
          );
        } else {
          // if not enough intersection, remove the styles and remove the parent
          setNodes((ns) =>
            ns.map((n) => {
              if (n.className?.includes("ring-2")) {
                return { ...n, className: "" };
              }
              if (n.id === node.id) {
                return {
                  ...n,
                  position: nodeInternal.internals.positionAbsolute,
                  parentId: undefined,
                };
              }
              return n;
            }),
          );
        }
      } else {
        // if dropped outside, remove parent if it had one
        if (node.parentId) {
          setNodes((ns) =>
            ns.map((n) => {
              if (n.id === node.id) {
                const nodeInternal = getInternalNode(node.id);
                if (!nodeInternal) {
                }
                return {
                  ...n,
                  position: nodeInternal.internals.positionAbsolute,
                  parentId: undefined,
                };
              }
              if (n.className?.includes("ring-2")) {
                return { ...n, className: "" };
              }
              return n;
            }),
          );
        } else {
          setNodes((ns) =>
            ns.map((n) => {
              if (n.className?.includes("ring-2")) {
                return { ...n, className: "" };
              }
              return n;
            }),
          );
        }
      }
    },
    [getIntersectingNodeGroup, getInternalNode, setNodes],
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
