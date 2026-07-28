import { CANVAS_LOCALSTORAGE_KEY, useCanvasStorage } from "@/hooks/useCanvasStorage";
import { CanvasStoreProvider } from "@/store/CanvasStoreProvider";
import { CanvasStoreState } from "@/store/store";
import { LibraryRegistry, LibraryRegistryProvider } from "@sysdraw/models";
import { act, renderHook, waitFor } from "@testing-library/react";
import React, { createElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StoreApi } from "zustand";
import { mockSetViewport } from "../utils/mocks";
import { makeEdge, makeNode, makeStore } from "../utils/utils";

vi.unmock("zustand");

const createWrapper = (store: StoreApi<CanvasStoreState>, registry?: LibraryRegistry) => {
  const libRegistry = registry || new LibraryRegistry();
  return ({ children }: { children: React.ReactNode }) =>
    createElement(CanvasStoreProvider, {
      store,
      children: createElement(LibraryRegistryProvider, {
        registry: libRegistry,
        children,
      }),
    });
};

describe("useCanvasStorage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("saves the flow snapshot when onSave is called directly", () => {
    const store = makeStore([makeNode("1")], []);
    const { result } = renderHook(() => useCanvasStorage(), { wrapper: createWrapper(store) });

    act(() => result.current.onSave());

    const expectedObject = {
      nodes: [makeNode("1")],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 },
    };

    expect(JSON.parse(localStorage.getItem(CANVAS_LOCALSTORAGE_KEY)!)).toEqual(expectedObject);
  });

  it("auto-restores nodes, edges, and viewport from localStorage on mount", async () => {
    const flow = {
      nodes: [makeNode("n1")],
      edges: [makeEdge("e1", "n1", "n2")],
      viewport: { x: 5, y: 6, zoom: 2 },
    };
    localStorage.setItem(CANVAS_LOCALSTORAGE_KEY, JSON.stringify(flow));

    const store = makeStore();
    const libRegistry = new LibraryRegistry();
    renderHook(() => useCanvasStorage(), { wrapper: createWrapper(store, libRegistry) });

    await act(async () => {
      await libRegistry.whenReady();
    });

    await waitFor(() => {
      expect(store.getState().nodes).toEqual(flow.nodes);
    });

    expect(store.getState().edges).toEqual(flow.edges);
    expect(mockSetViewport).toHaveBeenCalledWith({ x: 5, y: 6, zoom: 2 });
  });

  it("auto-saves when nodes or edges change after mount (debounced)", async () => {
    const store = makeStore();
    const libRegistry = new LibraryRegistry();
    renderHook(() => useCanvasStorage(), { wrapper: createWrapper(store, libRegistry) });

    await act(async () => {
      await libRegistry.whenReady();
    });

    const newNode = makeNode("n-auto");
    act(() => {
      store.getState().setNodes([newNode]);
    });

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem(CANVAS_LOCALSTORAGE_KEY)!);
      expect(stored?.nodes).toEqual([newNode]);
    });
  });
});
