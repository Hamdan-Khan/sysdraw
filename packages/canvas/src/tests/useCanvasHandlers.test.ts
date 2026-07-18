import { act, renderHook } from "@testing-library/react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCanvasHandlers } from "../hooks/useCanvasHandlers";
import { mockGetInternalNode, mockGetIntersectingNodes, mockGetNodes, mockSetNodes } from "./mocks";

vi.mock("nanoid", () => ({ nanoid: () => "new-id" }));

vi.mock("../hooks/useHistory", () => ({
  useHistory: () => ({
    commit: vi.fn(),
    undo: vi.fn(),
    redo: vi.fn(),
    canUndo: false,
    canRedo: false,
  }),
}));

vi.mock("@sysdraw/models", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@sysdraw/models")>()),
  defaultNodesMap: { rectangle: { label: "default rect" } },
  defaultGroupsMap: { container: { label: "default group" } },
}));

vi.mock("../components/canvas", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../components/canvas")>();
  return {
    ...actual,
    isGroup: vi.fn((n) => n.type === "container"),
    isChildNode: vi.fn(() => false),
    getNodeRect: vi.fn((internal) => internal.rect),
    getIntersectingArea: vi.fn(),
    clampPositionInsideGroup: vi.fn((pos) => pos),
  };
});

const makeEvent = (kind: string, type: string) => ({
  preventDefault: vi.fn(),
  clientX: 100,
  clientY: 100,
  dataTransfer: {
    getData: () => JSON.stringify({ kind, type }),
    dropEffect: "",
  },
});

describe("useCanvasHandlers", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("onDrop", () => {
    it("does nothing if no drag data is present", () => {
      const { result } = renderHook(() => useCanvasHandlers({} as any));
      act(() =>
        result.current.onDrop({
          preventDefault: vi.fn(),
          dataTransfer: { getData: () => "" },
        } as any),
      );
      expect(mockSetNodes).not.toHaveBeenCalled();
    });

    it("prepends a dropped group, appends a dropped node", () => {
      const { result } = renderHook(() => useCanvasHandlers({} as any));
      const existing = [{ id: "existing", type: "rectangle", position: { x: 0, y: 0 }, data: {} }];

      act(() => result.current.onDrop(makeEvent("node", "rectangle") as any));
      let updated = mockSetNodes.mock.calls[0][0](existing);
      expect(updated.at(-1).type).toBe("rectangle");

      mockSetNodes.mockClear();
      act(() => result.current.onDrop(makeEvent("group", "container") as any));
      updated = mockSetNodes.mock.calls[0][0](existing);
      expect(updated[0].type).toBe("container");
    });
  });

  describe("onNodeDragStop", () => {
    const draggedNode = { id: "n1", measured: { width: 20, height: 20 } };
    const group = { id: "g1", type: "container" };

    beforeEach(() => {
      mockGetNodes.mockReturnValue([draggedNode, group]);
      mockGetIntersectingNodes.mockReturnValue([group]);
      mockGetInternalNode.mockImplementation((id) =>
        id === "g1"
          ? { rect: { x: 0, y: 0, width: 100, height: 100 } }
          : {
              rect: { x: 10, y: 10, width: 20, height: 20 },
              internals: { positionAbsolute: { x: 10, y: 10 } },
            },
      );
    });

    it("rejects the drop and shows an error when the node is too big for the group", async () => {
      const { getIntersectingArea } = await import("../components/canvas");
      // full overlap, ratio 1
      vi.mocked(getIntersectingArea).mockReturnValue(400);

      const { result } = renderHook(() => useCanvasHandlers({} as any));
      const bigNode = { ...draggedNode, measured: { width: 150, height: 150 } };
      act(() => result.current.onNodeDragStop({} as any, bigNode as any, [bigNode] as any));

      expect(toast.error).toHaveBeenCalledWith("Group is too small to contain the node");
      expect(mockSetNodes).not.toHaveBeenCalled();
    });

    it("reparents the node into the group on a valid drop", async () => {
      const { getIntersectingArea } = await import("../components/canvas");
      vi.mocked(getIntersectingArea).mockReturnValue(400);

      const { result } = renderHook(() => useCanvasHandlers({} as any));
      act(() => result.current.onNodeDragStop({} as any, draggedNode as any, [draggedNode] as any));

      expect(mockSetNodes).toHaveBeenCalledTimes(1);
      const updated = mockSetNodes.mock.calls[0][0]([draggedNode, group]);
      const reparented = updated.find((n: any) => n.id === "n1");
      expect(reparented.parentId).toBe("g1");
    });

    it("unparents the node when no valid drop target is found", () => {
      // no candidate groups
      mockGetIntersectingNodes.mockReturnValue([]);
      const parented = { ...draggedNode, parentId: "old-group" };

      const { result } = renderHook(() => useCanvasHandlers({} as any));
      act(() => result.current.onNodeDragStop({} as any, parented as any, [parented] as any));

      const updated = mockSetNodes.mock.calls[0][0]([parented]);
      expect(updated[0].parentId).toBeUndefined();
      expect(updated[0].position).toEqual({ x: 10, y: 10 });
    });
  });
});
