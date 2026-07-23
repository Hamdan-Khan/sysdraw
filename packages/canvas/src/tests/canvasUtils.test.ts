import { Node } from "@xyflow/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clampPositionInsideGroup,
  getIntersectingArea,
  isChildNode,
  isGroup,
  sortNodesAndGroups,
} from "../components/canvas/utils";
import { makeGroupNode, makeNode, makeRegularNode } from "./utils/utils";

// mock @sysdraw/models so tests aren't coupled to the real registered group list
vi.mock("@sysdraw/models", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@sysdraw/models")>();
  return {
    ...actual,
    RegisteredGroups: {
      GROUP_A: "group-a",
      GROUP_B: "group-b",
    },
  };
});

describe("getIntersectingArea", () => {
  it("returns 0 when both rects are undefined", () => {
    expect(getIntersectingArea(undefined, undefined)).toBe(0);
  });

  it("returns 0 when one rect is missing", () => {
    expect(getIntersectingArea({ x: 0, y: 0, width: 100, height: 100 }, undefined)).toBe(0);
  });

  it("returns 0 when a rect has zero width or height", () => {
    expect(
      getIntersectingArea(
        { x: 0, y: 0, width: 0, height: 100 },
        { x: 0, y: 0, width: 100, height: 100 },
      ),
    ).toBe(0);
  });

  it("returns 0 when rects do not overlap (side by side)", () => {
    const a = { x: 0, y: 0, width: 50, height: 50 };
    const b = { x: 60, y: 0, width: 50, height: 50 };
    expect(getIntersectingArea(a, b)).toBe(0);
  });

  it("returns the correct pixel area for a partial overlap", () => {
    // overlap of 25*25 = 625
    const a = { x: 0, y: 0, width: 50, height: 50 };
    const b = { x: 25, y: 25, width: 50, height: 50 };
    expect(getIntersectingArea(a, b)).toBe(625);
  });

  it("returns the full inner area when one rect is contained within the other", () => {
    const outer = { x: 0, y: 0, width: 200, height: 200 };
    const inner = { x: 50, y: 50, width: 50, height: 50 };
    expect(getIntersectingArea(inner, outer)).toBe(2500);
  });
});

describe("clampPositionInsideGroup", () => {
  it("returns position unchanged when already inside bounds", () => {
    expect(clampPositionInsideGroup({ x: 10, y: 20 }, 30, 30, 200, 200)).toEqual({ x: 10, y: 20 });
  });

  it("clamps negative x and y to 0", () => {
    expect(clampPositionInsideGroup({ x: -10, y: -5 }, 30, 30, 200, 200)).toEqual({ x: 0, y: 0 });
  });

  it("clamps x that would push node outside the right edge", () => {
    // nodeW=50, groupW=100, max x = 50
    // position.x = 80 which is > 50, so clamped to 50
    expect(clampPositionInsideGroup({ x: 80, y: 0 }, 50, 30, 100, 200)).toEqual({ x: 50, y: 0 });
  });

  it("clamps y that would push node outside the bottom edge", () => {
    expect(clampPositionInsideGroup({ x: 0, y: 90 }, 30, 50, 200, 100)).toEqual({ x: 0, y: 50 });
  });
});

describe("isGroup", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns true for a node whose data.kind is group", () => {
    expect(isGroup(makeNode("x", { data: { kind: "group" } }))).toBe(true);
  });

  it("returns false for a node with a non-group kind", () => {
    expect(isGroup(makeNode("x", { data: { kind: "node" } }))).toBe(false);
  });

  it("returns false for a node with no type or data.kind", () => {
    expect(isGroup(makeNode("x", { type: undefined, data: {} }))).toBe(false);
  });
});

describe("sortNodesAndGroups", () => {
  const getMap = (nodes: Node[]) => new Map(nodes.map((n) => [n.id, n]));

  it("places group nodes before regular nodes", () => {
    const nodes = [makeRegularNode("r1"), makeGroupNode("g1"), makeRegularNode("r2")];
    const sorted = sortNodesAndGroups(nodes, getMap(nodes));

    const types = sorted.map((n) => (n.type === "group-a" ? "group" : "node"));
    expect(types).toEqual(["group", "node", "node"]);
  });

  it("places parent groups before their child groups", () => {
    // g-parent has no parentId; g-child is nested inside g-parent
    const gParent = makeGroupNode("g-parent");
    const gChild = makeGroupNode("g-child", "g-parent");
    const nodes = [gChild, gParent, makeRegularNode("r1")];

    const sorted = sortNodesAndGroups(nodes, getMap(nodes));
    const groupIds = sorted.filter((n) => n.type === "group-a").map((n) => n.id);

    expect(groupIds.indexOf("g-parent")).toBeLessThan(groupIds.indexOf("g-child"));
  });

  it("handles deeply nested groups in correct depth order", () => {
    const g1 = makeGroupNode("g1");
    const g2 = makeGroupNode("g2", "g1");
    const g3 = makeGroupNode("g3", "g2");
    const nodes = [g3, g2, g1];

    const sorted = sortNodesAndGroups(nodes, getMap(nodes));
    const ids = sorted.map((n) => n.id);

    expect(ids.indexOf("g1")).toBeLessThan(ids.indexOf("g2"));
    expect(ids.indexOf("g2")).toBeLessThan(ids.indexOf("g3"));
  });

  it("does not infinite-loop on cyclic parentIds", () => {
    // g1 - g2 - g1 (cycle)
    const g1 = makeGroupNode("g1", "g2");
    const g2 = makeGroupNode("g2", "g1");
    const nodes = [g1, g2];

    expect(() => sortNodesAndGroups(nodes, getMap(nodes))).not.toThrow();
  });
});

describe("isChildNode", () => {
  it("returns false when node1 has no parentId", () => {
    const n1 = makeRegularNode("n1");
    const n2 = makeGroupNode("n2");
    expect(isChildNode(n1, n2, new Map([n1, n2].map((n) => [n.id, n])))).toBe(false);
  });

  it("returns true when node1 is a direct child of node2", () => {
    const parent = makeGroupNode("parent");
    const child = makeRegularNode("child", "parent");
    expect(isChildNode(child, parent, new Map([parent, child].map((n) => [n.id, n])))).toBe(true);
  });

  it("returns true when node1 is a grandchild of node2", () => {
    const grandparent = makeGroupNode("grandparent");
    const parent = makeGroupNode("parent", "grandparent");
    const child = makeRegularNode("child", "parent");
    expect(
      isChildNode(child, grandparent, new Map([grandparent, parent, child].map((n) => [n.id, n]))),
    ).toBe(true);
  });

  it("returns false for completely unrelated nodes", () => {
    const a = makeGroupNode("a");
    const b = makeGroupNode("b");
    const c = makeRegularNode("c", "b");
    expect(isChildNode(c, a, new Map([a, b, c].map((n) => [n.id, n])))).toBe(false);
  });
});
