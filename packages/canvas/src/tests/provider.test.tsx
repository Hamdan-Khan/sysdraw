import { act, renderHook } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { CanvasStoreProvider, createCanvasStore, useCanvasStore } from "../store";

vi.unmock("zustand");

describe("CanvasStoreProvider & useCanvasStore", () => {
  it("throws an error when useCanvasStore is used outside CanvasStoreProvider", () => {
    // suppress console.error for expected error thrown in render
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useCanvasStore())).toThrow(
      "useCanvasStore must be used within a CanvasStoreProvider",
    );
    consoleError.mockRestore();
  });

  it("provides store state to useCanvasStore without selector", () => {
    const store = createCanvasStore({ nodes: [], edges: [] });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CanvasStoreProvider store={store}>{children}</CanvasStoreProvider>
    );

    const { result } = renderHook(() => useCanvasStore(), { wrapper });
    expect(result.current.nodes).toEqual([]);
    expect(result.current.edges).toEqual([]);
    expect(result.current.isInteractive).toBe(true);
  });

  it("selects specific slice with useCanvasStore(selector)", () => {
    const store = createCanvasStore({ nodes: [], edges: [] });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CanvasStoreProvider store={store}>{children}</CanvasStoreProvider>
    );

    const { result } = renderHook(() => useCanvasStore((s) => s.isInteractive), { wrapper });
    expect(result.current).toBe(true);

    act(() => {
      store.getState().setIsInteractive(false);
    });

    expect(result.current).toBe(false);
  });
});
