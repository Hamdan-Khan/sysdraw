import { NodeKinds, NodeTypes } from "@sysdraw/models";

/**
 * Data transferred when dragging a node or group from the toolbar to the canvas
 */
export type DnDTransferData = {
  kind: NodeKinds;
  type: NodeTypes;
};
