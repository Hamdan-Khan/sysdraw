import { BaseNodeData, RegisteredNodes, defaultNodesMap } from "@sysdraw/models";
import { NodeComponentType, NodePropsType } from "../../canvas";
import { GenericNode } from "./GenericNode";
import { NodeWrapper } from "./NodeWrapper";

/**
 * Map of all registered nodes components
 */
export const nodeTypes = Object.values(RegisteredNodes).reduce(
  (acc, nodeType) => {
    acc[nodeType] = (props: NodePropsType<BaseNodeData>) => {
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
  {} as Record<RegisteredNodes, NodeComponentType<BaseNodeData>>,
);
