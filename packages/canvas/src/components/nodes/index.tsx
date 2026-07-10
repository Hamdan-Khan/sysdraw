import { RegisteredNodes, defaultNodesMap, type BaseNodeData } from "@sysdraw/models";
import type { Node, NodeProps } from "@xyflow/react";
import { GenericNode } from "./GenericNode";
import { NodeWrapper } from "./NodeWrapper";

type NodePropsType = NodeProps<Node<BaseNodeData>>;
type NodeComponentType = React.ComponentType<NodePropsType>;

/**
 * Map of all registered nodes components
 */
export const nodeTypes = Object.values(RegisteredNodes).reduce(
  (acc, nodeType) => {
    acc[nodeType] = (props: NodePropsType) => {
      const defaultData = defaultNodesMap[nodeType];
      const handles = props.data.handles || defaultData.handles;

      return (
        <NodeWrapper selected={props.selected} handles={handles}>
          <GenericNode type={nodeType} />
        </NodeWrapper>
      );
    };
    return acc;
  },
  {} as Record<RegisteredNodes, NodeComponentType>,
);
