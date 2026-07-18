import { act, renderHook } from "@testing-library/react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CANVAS_LOCALSTORAGE_KEY, useCanvasStorage } from "../hooks";
import { mockSetEdges, mockSetNodes, mockSetViewport } from "./mocks";

describe("useCanvasStorage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("does nothing on save if no rfInstance is set", () => {
    const { result } = renderHook(() => useCanvasStorage({} as any));
    act(() => result.current.onSave());
    expect(localStorage.getItem(CANVAS_LOCALSTORAGE_KEY)).toBeNull();
    expect(toast).not.toHaveBeenCalled();
  });

  it("saves the flow snapshot and notifies", () => {
    const { result } = renderHook(() => useCanvasStorage({} as any));
    const toObject = vi.fn(() => ({
      nodes: [{ id: "1" }],
      edges: [],
      viewport: { x: 1, y: 2, zoom: 1 },
    }));
    act(() => result.current.setRfInstance({ toObject } as any));
    act(() => result.current.onSave());

    expect(JSON.parse(localStorage.getItem(CANVAS_LOCALSTORAGE_KEY)!)).toEqual(toObject());
    expect(toast).toHaveBeenCalledWith("Snapshot saved!");
  });

  it("restores nodes, edges, and viewport from a saved snapshot", async () => {
    const flow = {
      nodes: [{ id: "n1" }],
      edges: [{ id: "e1" }],
      viewport: { x: 5, y: 6, zoom: 2 },
    };
    localStorage.setItem(CANVAS_LOCALSTORAGE_KEY, JSON.stringify(flow));

    const { result } = renderHook(() => useCanvasStorage({} as any));
    await act(async () => result.current.onRestore());

    expect(mockSetNodes).toHaveBeenCalledWith(flow.nodes);
    expect(mockSetEdges).toHaveBeenCalledWith(flow.edges);
    expect(mockSetViewport).toHaveBeenCalledWith({ x: 5, y: 6, zoom: 2 });
  });

  describe("onRestore", () => {
    // to not pollute the test logs with logged errors
    beforeEach(() => {
      vi.spyOn(console, "error").mockImplementation(() => {});
    });

    it("shows a toast and does nothing if no snapshot is stored", async () => {
      const { result } = renderHook(() => useCanvasStorage({} as any));
      await act(async () => result.current.onRestore());

      expect(toast).toHaveBeenCalledWith("No stored snapshot found.");
      expect(mockSetNodes).not.toHaveBeenCalled();
      expect(mockSetViewport).not.toHaveBeenCalled();
    });

    it("restores nodes, edges, and viewport from a valid snapshot", async () => {
      const flow = {
        nodes: [{ id: "n1" }],
        edges: [{ id: "e1" }],
        viewport: { x: 5, y: 6, zoom: 2 },
      };
      localStorage.setItem(CANVAS_LOCALSTORAGE_KEY, JSON.stringify(flow));

      const { result } = renderHook(() => useCanvasStorage({} as any));
      await act(async () => result.current.onRestore());

      expect(mockSetNodes).toHaveBeenCalledWith(flow.nodes);
      expect(mockSetEdges).toHaveBeenCalledWith(flow.edges);
      expect(mockSetViewport).toHaveBeenCalledWith(flow.viewport);
      expect(toast).toHaveBeenCalledWith("Snapshot restored!");
    });

    it("falls back to a failure toast on malformed JSON", async () => {
      localStorage.setItem(CANVAS_LOCALSTORAGE_KEY, "{not valid json");
      const { result } = renderHook(() => useCanvasStorage({} as any));
      await act(async () => result.current.onRestore());

      expect(toast).toHaveBeenCalledWith("Failed to restore snapshot.");
      expect(mockSetViewport).not.toHaveBeenCalled();
    });

    it("falls back to a failure toast when stored JSON has no viewport", async () => {
      // valid JSON, but missing `viewport`causing the destructure to throw, caught by the try/catch
      localStorage.setItem(CANVAS_LOCALSTORAGE_KEY, JSON.stringify({ nodes: [], edges: [] }));
      const { result } = renderHook(() => useCanvasStorage({} as any));
      await act(async () => result.current.onRestore());

      expect(toast).toHaveBeenCalledWith("Failed to restore snapshot.");
      expect(mockSetViewport).not.toHaveBeenCalled();
    });
  });
});
