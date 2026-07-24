import { IconType, LibraryManifest, NodeHandleConfig } from "@sysdraw/models";
import { Position } from "@xyflow/react";
import { NodeComponentType, NodePropsType } from "../canvas";
import { LibraryIcon } from "../toolbar/LibraryIcon";
import { GenericGroup, GroupWrapper } from "./group";
import { NodeWrapper } from "./node/NodeWrapper";

type CanvasNodeData = {
  label?: string;
  color?: string;
  handles?: NodeHandleConfig[];
  icon?: IconType;
};

export const defaultHandles: NodeHandleConfig[] = [
  { id: "top", type: "target", position: Position.Top },
  { id: "bottom", type: "source", position: Position.Bottom },
];

/**
 * Creates a dynamic nodeTypes map from loaded library manifests
 */
export const createNodeTypes = (
  loadedLibs: Record<string, LibraryManifest>,
): Record<string, NodeComponentType<CanvasNodeData>> => {
  const nodeTypes: Record<string, NodeComponentType<CanvasNodeData>> = {};

  const allNodes = Object.values(loadedLibs).flatMap((lib) => lib.nodes);

  for (const libNode of allNodes) {
    nodeTypes[libNode.id] = (props: NodePropsType<CanvasNodeData>) => {
      if (libNode.type === "group") {
        const handles = props.data?.handles || [];
        return (
          <GroupWrapper
            selected={props.selected}
            handles={handles}
            width={props.width}
            height={props.height}
          >
            <GenericGroup
              data={{ label: props.data?.label || libNode.label, color: props.data?.color }}
            />
          </GroupWrapper>
        );
      } else {
        const handles = props.data?.handles || defaultHandles;
        const icon = props.data?.icon || libNode.icon;

        return (
          <NodeWrapper
            selected={props.selected}
            handles={handles}
            width={props.width}
            height={props.height}
          >
            <LibraryIcon icon={icon} className="w-full h-full text-text drop-shadow-sm" />
          </NodeWrapper>
        );
      }
    };
  }

  return nodeTypes;
};
