import { RegisteredGroups } from "@sysdraw/models";
import { InternalNode, Node } from "@xyflow/react";

/**
 * x, y (position) and width, height of a node
 */
export type NodeRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/**
 * Extracts the absolute position rect of a node from its InternalNode
 */
export const getNodeRect = (internalNode: InternalNode<Node>): NodeRect => ({
  x: internalNode.internals.positionAbsolute.x,
  y: internalNode.internals.positionAbsolute.y,
  width: internalNode.measured.width ?? 0,
  height: internalNode.measured.height ?? 0,
});

/**
 * Returns the pixel area of the overlap between two node rects.
 * Returns 0 when either rect is missing or has no area.
 */
export const getIntersectingArea = (node?: NodeRect, group?: NodeRect): number => {
  if (!node || !group) {
    return 0;
  }
  const { x: x1, y: y1, width: w1, height: h1 } = node;
  const { x: x2, y: y2, width: w2, height: h2 } = group;

  if (!w1 || !h1 || !w2 || !h2) {
    return 0;
  }

  const overlapLeft = Math.max(x1, x2);
  const overlapRight = Math.min(x1 + w1, x2 + w2);
  const overlapTop = Math.max(y1, y2);
  const overlapBottom = Math.min(y1 + h1, y2 + h2);

  const overlapX = Math.max(0, overlapRight - overlapLeft);
  const overlapY = Math.max(0, overlapBottom - overlapTop);

  return Math.round(overlapX * overlapY);
};

/**
 * Given a node's relative position inside a group, clamps it so
 * the node snaps into the target group node.
 *
 * Helps avoid partial intersection when reparenting
 *
 * @returns relative position of node clamped inside the group.
 */
export const clampPositionInsideGroup = (
  relativePosistion: { x: number; y: number },
  nodeW: number,
  nodeH: number,
  groupW: number,
  groupH: number,
): { x: number; y: number } => {
  const x = Math.min(Math.max(relativePosistion.x, 0), groupW - nodeW);
  const y = Math.min(Math.max(relativePosistion.y, 0), groupH - nodeH);
  return { x, y };
};

export const RegisteredGroupsSet = new Set(Object.values(RegisteredGroups));

/**
 * returns true if the given node is a sysdraw group node
 */
export const isGroup = (node: Node): boolean => {
  if (!node.type) return false;
  return RegisteredGroupsSet.has(node.type as RegisteredGroups);
};

/**
 * sorts nodes and groups so that parent groups appear before their child groups in the
 * array because xyflow renders nodes in the order they appear in the array and it
 * requires parent nodes to be drawn before child nodes
 */
export const sortNodesAndGroups = (nodes: Node[]): Node[] => {
  const sysdrawNodes = nodes.filter((n) => !RegisteredGroupsSet.has(n.type as RegisteredGroups));
  const sysdrawGroups = nodes.filter((n) => RegisteredGroupsSet.has(n.type as RegisteredGroups));

  const sortedGroups: Node[] = [];
  sysdrawGroups.forEach((group) => {
    // not a child group, so it can be placed anywhere in the array
    if (!group.parentId) {
      sortedGroups.push(group);
    } else {
      // to see if a child group already exists earlier in the array
      // we'll replace it with the parent group, and add the child group to the end instead
      let childIndex = -1;
      let i = 0;
      for (const v of sortedGroups) {
        if (v.parentId === group.id) {
          childIndex = i;
          break;
        }
        i++;
      }

      // a child group earlier in the array is found
      if (childIndex >= 0) {
        let tempChild = sortedGroups[childIndex];
        sortedGroups[childIndex] = group;
        sortedGroups.push(tempChild);
      } else {
        sortedGroups.push(group);
      }
    }
  });

  return [...sortedGroups, ...sysdrawNodes];
};
