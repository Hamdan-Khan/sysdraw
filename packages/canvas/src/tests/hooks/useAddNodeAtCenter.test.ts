import { useAddNodeAtCenter } from "@/hooks/useAddNodeAtCenter";
import { CanvasStoreProvider } from "@/store/CanvasStoreProvider";
import { act, renderHook } from "@testing-library/react";
import { LibraryRegistry, LibraryRegistryProvider } from "@zero-sketch/models";
import React, { createElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockSetNodes } from "../utils/mocks";

vi.mock("nanoid", () => ({ nanoid: () => "new-id" }));

const mockCommit = vi.fn();

vi.mock("@/hooks/useHistory", () => ({
  useHistory: () => ({
    commit: mockCommit,
    undo: vi.fn(),
    redo: vi.fn(),
    canUndo: false,
    canRedo: false,
  }),
}));

vi.mock("zustand", async (importOriginal) => {
  const actual = await importOriginal<typeof import("zustand")>();
  const { mockSetNodes, mockSetEdges } = await import("../utils/mocks");
  return {
    ...actual,
    useStore: (store: any, selector: any) =>
      store?.getState
        ? selector(store.getState())
        : selector({
            nodes: [],
            nodesMap: new Map(),
            setNodes: mockSetNodes,
            setEdges: mockSetEdges,
            commit: mockCommit,
            globalEdgeType: "straight",
          }),
  };
});

vi.mock("@zero-sketch/models", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@zero-sketch/models")>()),
  defaultNodesMap: { rectangle: { label: "default rect" } },
  defaultGroupsMap: { container: { label: "default group" } },
}));

vi.mock("@/components/canvas/utils", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/components/canvas/utils")>();
  return {
    ...actual,
    isGroup: vi.fn(
      (n) => n.type === "container" || n.type === "availability-zone",
    ),
  };
});

const mockLibraryRegistry = new LibraryRegistry({
  url: "http://localhost/lib",
});

const createWrapper = (store: any = {}) => {
  return ({ children }: { children: React.ReactNode }) =>
    createElement(LibraryRegistryProvider, {
      registry: mockLibraryRegistry,
      children: createElement(CanvasStoreProvider, { store, children }),
    });
};

describe("useAddNodeAtCenter", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await mockLibraryRegistry.selectLibrary("default");
  });

  it("places node at center and increments offset for same node, resetting for different node", () => {
    const { result } = renderHook(() => useAddNodeAtCenter(), {
      wrapper: createWrapper(),
    });

    // first click: database node (offset 0)
    act(() => result.current.addNodeAtCenter({ kind: "node", id: "database" }));
    expect(mockSetNodes).toHaveBeenCalledTimes(1);
    let updated = mockSetNodes.mock.calls[0][0]([]);
    const firstPos = updated[0].position;
    expect(updated[0].selected).toBe(true);

    mockSetNodes.mockClear();

    // second click: same database node (offset +20)
    act(() => result.current.addNodeAtCenter({ kind: "node", id: "database" }));
    expect(mockSetNodes).toHaveBeenCalledTimes(1);
    updated = mockSetNodes.mock.calls[0][0]([]);
    const secondPos = updated[0].position;
    expect(secondPos.x).toBe(firstPos.x + 20);
    expect(secondPos.y).toBe(firstPos.y + 20);

    mockSetNodes.mockClear();

    // third click: different node type "availability-zone" (resets offset to 0)
    act(() =>
      result.current.addNodeAtCenter({
        kind: "group",
        id: "availability-zone",
      }),
    );
    expect(mockSetNodes).toHaveBeenCalledTimes(1);
    updated = mockSetNodes.mock.calls[0][0]([]);
    const thirdPos = updated[0].position;
    // third pos for group should use 0 offset step from group center
    expect(thirdPos.x).not.toBe(secondPos.x + 20);
  });
});
