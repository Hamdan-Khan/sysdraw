import { act, renderHook } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import defaultLibrary from "../library/default_library.json";
import {
  LibraryRegistry,
  LibraryRegistryProvider,
  useLibraryRegistry,
  useLibraryRegistryStore,
} from "../library/index";

describe("LibraryRegistry Instance", () => {
  let registry: LibraryRegistry;

  beforeEach(() => {
    registry = new LibraryRegistry({ url: "http://localhost/lib" });
  });

  afterEach(() => {
    registry?.close();
  });

  it("initializes with null or default library as selectedLib", async () => {
    await registry.whenReady();
    const snapshot = registry.getSnapshot();
    expect(snapshot.selectedLib?.id).toEqual(defaultLibrary.id);
  });

  it("lists all available library metadata", async () => {
    const libraries = await registry.listAllLibraries();
    expect(libraries).toHaveLength(1);
    expect(libraries[0]).toEqual({
      id: defaultLibrary.id,
      name: defaultLibrary.name,
      version: defaultLibrary.version,
      description:
        "Sysdraw's default library, sufficient for simple architecture diagrams.",
      icon: "https://dummyimage.com/100x100/54ffcc/005e0e.png&text=Sd",
      tags: ["basic"],
      path: "data/default_library.json",
    });
  });

  it("selects the default library successfully", async () => {
    await registry.selectLibrary(defaultLibrary.id);

    const snapshot = registry.getSnapshot();
    expect(snapshot.selectedLib?.id).toBe(defaultLibrary.id);
    expect(snapshot.selectedLib).toEqual(defaultLibrary);
  });

  it("exposes the underlying Zustand store via getStore", async () => {
    const store = registry.getStore();
    expect(store.getState()).toEqual(registry.getSnapshot());

    await act(async () => {
      await registry.selectLibrary(defaultLibrary.id);
    });

    expect(store.getState().selectedLib).toEqual(defaultLibrary);
  });
});

describe("LibraryRegistryProvider & Hooks", () => {
  let registry: LibraryRegistry;

  beforeEach(() => {
    registry = new LibraryRegistry({ url: "http://localhost/lib" });
  });

  afterEach(() => {
    registry?.close();
  });

  it("throws an error when useLibraryRegistry is used outside LibraryRegistryProvider", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => renderHook(() => useLibraryRegistry())).toThrow(
      "useLibraryRegistry must be used within a LibraryRegistryProvider",
    );

    consoleError.mockRestore();
  });

  it("throws an error when useLibraryRegistryStore is used outside LibraryRegistryProvider", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => renderHook(() => useLibraryRegistryStore((s) => s))).toThrow(
      "useLibraryRegistryStore must be used within a LibraryRegistryProvider",
    );

    consoleError.mockRestore();
  });

  it("provides access to the LibraryRegistry instance via useLibraryRegistry", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LibraryRegistryProvider registry={registry}>
        {children}
      </LibraryRegistryProvider>
    );

    const { result } = renderHook(() => useLibraryRegistry(), { wrapper });
    expect(result.current).toBe(registry);
  });

  it("selects state slice and updates reactively with useLibraryRegistryStore", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LibraryRegistryProvider registry={registry}>
        {children}
      </LibraryRegistryProvider>
    );

    const { result } = renderHook(
      () => useLibraryRegistryStore((s) => s.selectedLib),
      { wrapper },
    );

    await act(async () => {
      await registry.selectLibrary(defaultLibrary.id);
    });

    expect(result.current).toEqual(defaultLibrary);
  });
});
