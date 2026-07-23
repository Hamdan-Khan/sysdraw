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

/**
 * returns true if the given node is a sysdraw group node
 */
export const isGroup = (node: Node): boolean => {
  if (!node.type) return false;
  return node.data?.kind === "group";
};

/**
 * sorts nodes and groups so that parent groups appear before their child groups in the
 * array because xyflow renders nodes in the order they appear in the array and it
 * requires parent nodes to be drawn before child nodes
 */
export const sortNodesAndGroups = (nodes: Node[], nodesMap: Map<string, Node>): Node[] => {
  const sysdrawNodes = nodes.filter((n) => !isGroup(n));
  const sysdrawGroups = nodes.filter((n) => isGroup(n));

  const depthCache = new Map<string, number>();

  const getDepth = (nodeId: string): number => {
    if (depthCache.has(nodeId)) return depthCache.get(nodeId)!;

    const node = nodesMap.get(nodeId);
    if (!node || !node.parentId) {
      depthCache.set(nodeId, 0);
      return 0;
    }

    // prevent infinite loop from cyclic dependencies
    depthCache.set(nodeId, 0);

    const depth = 1 + getDepth(node.parentId);
    depthCache.set(nodeId, depth);
    return depth;
  };

  sysdrawGroups.sort((a, b) => getDepth(a.id) - getDepth(b.id));

  return [...sysdrawGroups, ...sysdrawNodes];
};

/**
 * checks if node1 is a child of node2 (or any of its ancestors)
 *
 * @param node1 - node to check
 * @param node2 - potential parent node
 * @param nodesMap - map of all nodes in the canvas
 */
export const isChildNode = (node1: Node, node2: Node, nodesMap: Map<string, Node>): boolean => {
  if (!node1.parentId) {
    return false;
  }

  let parentId: string | null = node1.parentId ?? null;

  while (parentId != node2.id && parentId != null) {
    const parentNode = nodesMap.get(parentId);
    parentId = parentNode?.parentId ?? null;
  }

  return parentId === node2.id;
};
