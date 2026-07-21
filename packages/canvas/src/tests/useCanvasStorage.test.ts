import { act, renderHook } from "@testing-library/react";
import React, { createElement } from "react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StoreApi } from "zustand";
import { CANVAS_LOCALSTORAGE_KEY, useCanvasStorage } from "../hooks";
import { CanvasStoreProvider, CanvasStoreState } from "../store";
import { mockSetViewport } from "./mocks";
import { makeEdge, makeNode, makeStore } from "./utils";

vi.unmock("zustand");

const createWrapper = (store: StoreApi<CanvasStoreState>) => {
  return ({ children }: { children: React.ReactNode }) =>
    createElement(CanvasStoreProvider, { store }, children);
};

describe("useCanvasStorage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("saves the flow snapshot and notifies", () => {
    const store = makeStore([makeNode("1")], []);
    const { result } = renderHook(() => useCanvasStorage(), { wrapper: createWrapper(store) });

    act(() => result.current.onSave());

    const expectedObject = {
      nodes: [makeNode("1")],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 },
    };

    expect(JSON.parse(localStorage.getItem(CANVAS_LOCALSTORAGE_KEY)!)).toEqual(expectedObject);
    expect(toast).toHaveBeenCalledWith("Snapshot saved!");
  });

  it("restores nodes, edges, and viewport from a saved snapshot", async () => {
    const flow = {
      nodes: [makeNode("n1")],
      edges: [makeEdge("e1", "n1", "n2")],
      viewport: { x: 5, y: 6, zoom: 2 },
    };
    localStorage.setItem(CANVAS_LOCALSTORAGE_KEY, JSON.stringify(flow));

    const store = makeStore();
    const { result } = renderHook(() => useCanvasStorage(), { wrapper: createWrapper(store) });
    await act(async () => result.current.onRestore());

    expect(store.getState().nodes).toEqual(flow.nodes);
    expect(store.getState().edges).toEqual(flow.edges);
    expect(mockSetViewport).toHaveBeenCalledWith({ x: 5, y: 6, zoom: 2 });
  });

  describe("onRestore", () => {
    // to not pollute the test logs with logged errors
    beforeEach(() => {
      vi.spyOn(console, "error").mockImplementation(() => {});
    });

    it("shows a toast and does nothing if no snapshot is stored", async () => {
      const store = makeStore();
      const { result } = renderHook(() => useCanvasStorage(), { wrapper: createWrapper(store) });
      await act(async () => result.current.onRestore());

      expect(toast).toHaveBeenCalledWith("No stored snapshot found.");
      expect(store.getState().nodes).toEqual([]);
      expect(mockSetViewport).not.toHaveBeenCalled();
    });

    it("restores nodes, edges, and viewport from a valid snapshot", async () => {
      const flow = {
        nodes: [makeNode("n1")],
        edges: [makeEdge("e1", "n1", "n2")],
        viewport: { x: 5, y: 6, zoom: 2 },
      };
      localStorage.setItem(CANVAS_LOCALSTORAGE_KEY, JSON.stringify(flow));

      const store = makeStore();
      const { result } = renderHook(() => useCanvasStorage(), { wrapper: createWrapper(store) });
      await act(async () => result.current.onRestore());

      expect(store.getState().nodes).toEqual(flow.nodes);
      expect(store.getState().edges).toEqual(flow.edges);
      expect(mockSetViewport).toHaveBeenCalledWith(flow.viewport);
      expect(toast).toHaveBeenCalledWith("Snapshot restored!");
    });

    it("falls back to a failure toast on malformed JSON", async () => {
      localStorage.setItem(CANVAS_LOCALSTORAGE_KEY, "{not valid json");
      const store = makeStore();
      const { result } = renderHook(() => useCanvasStorage(), { wrapper: createWrapper(store) });
      await act(async () => result.current.onRestore());

      expect(toast).toHaveBeenCalledWith("Failed to restore snapshot.");
      expect(mockSetViewport).not.toHaveBeenCalled();
    });

    it("falls back to a failure toast when stored JSON has no viewport", async () => {
      // valid JSON, but missing `viewport`causing the destructure to throw, caught by the try/catch
      localStorage.setItem(CANVAS_LOCALSTORAGE_KEY, JSON.stringify({ nodes: [], edges: [] }));
      const store = makeStore();
      const { result } = renderHook(() => useCanvasStorage(), { wrapper: createWrapper(store) });
      await act(async () => result.current.onRestore());

      expect(toast).toHaveBeenCalledWith("Failed to restore snapshot.");
      expect(mockSetViewport).not.toHaveBeenCalled();
    });
  });
});
