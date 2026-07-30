import { NodeComponentType, NodePropsType } from "@/components/canvas/types";
import { LibraryIcon } from "@/components/toolbar/LibraryIcon";
import {
  IconType,
  LibraryManifest,
  NodeHandleConfig,
  NodeKinds,
} from "@sysdraw/models";
import { Position } from "@xyflow/react";
import { GenericGroup } from "./group/GenericGroup";
import { GroupWrapper } from "./group/GroupWrapper";
import { NodeWrapper } from "./node/NodeWrapper";

type CanvasNodeData = {
  label?: string;
  title?: string;
  color?: string;
  handles?: NodeHandleConfig[];
  icon?: IconType;
  kind?: NodeKinds;
};

export const defaultHandles: NodeHandleConfig[] = [
  { id: "top", type: "target", position: Position.Top },
  { id: "bottom", type: "source", position: Position.Bottom },
];

// oxlint-disable-next-line react/only-export-components
const NodeComponent = (props: NodePropsType<CanvasNodeData>) => {
  if (props.data?.kind === "group") {
    const handles = props.data?.handles || [];
    return (
      <GroupWrapper
        selected={props.selected}
        handles={handles}
        width={props.width}
        height={props.height}
      >
        <GenericGroup
          data={{
            label: props.data?.label || "Group",
            color: props.data?.color,
          }}
        />
      </GroupWrapper>
    );
  }

  const handles = props.data?.handles || defaultHandles;
  const icon = props.data?.icon;

  return (
    <NodeWrapper
      selected={props.selected}
      handles={handles}
      width={props.width}
      height={props.height}
      title={props.data?.title}
    >
      <LibraryIcon
        icon={icon}
        className="w-full h-full text-text drop-shadow-sm"
      />
    </NodeWrapper>
  );
};

/**
 * creates a dynamic nodeTypes map from loaded library manifests,
 * with a fallback for nodes whose libraries are not loaded at the moment.
 */
export const createNodeTypes = (
  loadedLibs: Record<string, LibraryManifest>,
): Record<string, NodeComponentType<CanvasNodeData>> => {
  const nodeTypes: Record<string, NodeComponentType<CanvasNodeData>> = {};

  const allNodes = Object.values(loadedLibs).flatMap((lib) => lib.nodes);

  for (const libNode of allNodes) {
    nodeTypes[libNode.id] = NodeComponent;
  }

  // wrap the map with a proxy object to handle access of node types that are not
  // part of the loaded library
  return new Proxy(nodeTypes, {
    get(target, prop: string | symbol) {
      if (typeof prop === "string" && prop in target) {
        return target[prop];
      }
      return NodeComponent;
    },
  });
};
