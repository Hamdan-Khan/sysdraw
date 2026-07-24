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
    registry = new LibraryRegistry();
  });

  afterEach(() => {
    registry?.close();
  });

  it("initializes with an empty loadedLibs state prior to ready", () => {
    const snapshot = registry.getSnapshot();
    expect(snapshot.loadedLibs).toEqual({});
  });

  it("lists all available library metadata", () => {
    const libraries = registry.listAllLibraries();
    expect(libraries).toHaveLength(1);
    expect(libraries[0]).toEqual({
      id: defaultLibrary.id,
      name: defaultLibrary.name,
      version: defaultLibrary.version,
    });
  });

  it("adds the default library successfully", async () => {
    await registry.addLibrary(defaultLibrary.id);

    const snapshot = registry.getSnapshot();
    expect(snapshot.loadedLibs[defaultLibrary.id]).toEqual(defaultLibrary);
  });

  it("does not duplicate or re-add library if added multiple times", async () => {
    await registry.addLibrary(defaultLibrary.id);
    const firstState = registry.getSnapshot().loadedLibs;

    await registry.addLibrary(defaultLibrary.id);
    const secondState = registry.getSnapshot().loadedLibs;

    expect(secondState).toBe(firstState);
    expect(Object.keys(secondState)).toHaveLength(1);
  });

  it("handles adding non-existent library ID gracefully", async () => {
    await registry.addLibrary("non-existent-lib-id");
    const snapshot = registry.getSnapshot();

    expect(snapshot.loadedLibs["non-existent-lib-id"]).toBeUndefined();
  });

  it("removes an existing library from the registry", async () => {
    await registry.addLibrary(defaultLibrary.id);
    expect(registry.getSnapshot().loadedLibs[defaultLibrary.id]).toBeDefined();

    await registry.removeLibrary(defaultLibrary.id);
    expect(registry.getSnapshot().loadedLibs[defaultLibrary.id]).toBeUndefined();
    expect(registry.getSnapshot().loadedLibs).toEqual({});
  });

  it("logs an error and preserves state when removing a non-existent library", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    await registry.addLibrary(defaultLibrary.id);
    const stateBefore = registry.getSnapshot().loadedLibs;

    await registry.removeLibrary("unknown-lib");

    expect(consoleError).toHaveBeenCalledWith(
      "Couldn't find library with id: unknown-lib in the registry",
    );
    expect(registry.getSnapshot().loadedLibs).toEqual(stateBefore);

    consoleError.mockRestore();
  });

  it("exposes the underlying Zustand store via getStore", async () => {
    const store = registry.getStore();
    expect(store.getState()).toEqual(registry.getSnapshot());

    await act(async () => {
      await registry.addLibrary(defaultLibrary.id);
    });

    expect(store.getState().loadedLibs[defaultLibrary.id]).toEqual(defaultLibrary);
  });
});

describe("LibraryRegistryProvider & Hooks", () => {
  let registry: LibraryRegistry;

  beforeEach(() => {
    registry = new LibraryRegistry();
  });

  afterEach(() => {
    registry?.close();
  });

  it("throws an error when useLibraryRegistry is used outside LibraryRegistryProvider", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => renderHook(() => useLibraryRegistry())).toThrow(
      "useLibraryRegistry must be used within a LibraryRegistryProvider",
    );

    consoleError.mockRestore();
  });

  it("throws an error when useLibraryRegistryStore is used outside LibraryRegistryProvider", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => renderHook(() => useLibraryRegistryStore((s) => s))).toThrow(
      "useLibraryRegistryStore must be used within a LibraryRegistryProvider",
    );

    consoleError.mockRestore();
  });

  it("provides access to the LibraryRegistry instance via useLibraryRegistry", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LibraryRegistryProvider registry={registry}>{children}</LibraryRegistryProvider>
    );

    const { result } = renderHook(() => useLibraryRegistry(), { wrapper });
    expect(result.current).toBe(registry);
  });

  it("selects state slice and updates reactively with useLibraryRegistryStore", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LibraryRegistryProvider registry={registry}>{children}</LibraryRegistryProvider>
    );

    const { result } = renderHook(() => useLibraryRegistryStore((s) => s.loadedLibs), { wrapper });

    expect(result.current).toEqual({});

    await act(async () => {
      await registry.addLibrary(defaultLibrary.id);
    });

    expect(result.current[defaultLibrary.id]).toEqual(defaultLibrary);

    await act(async () => {
      await registry.removeLibrary(defaultLibrary.id);
    });

    expect(result.current).toEqual({});
  });
});
