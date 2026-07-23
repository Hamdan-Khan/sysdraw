import { act, renderHook } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
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

  it("initializes with an empty loadedLibs state", () => {
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

  it("adds the default library successfully", () => {
    registry.addLibrary(defaultLibrary.id);

    const snapshot = registry.getSnapshot();
    expect(snapshot.loadedLibs[defaultLibrary.id]).toEqual(defaultLibrary);
  });

  it("does not duplicate or re-add library if added multiple times", () => {
    registry.addLibrary(defaultLibrary.id);
    const firstState = registry.getSnapshot().loadedLibs;

    registry.addLibrary(defaultLibrary.id);
    const secondState = registry.getSnapshot().loadedLibs;

    expect(secondState).toBe(firstState);
    expect(Object.keys(secondState)).toHaveLength(1);
  });

  it("handles adding non-existent library ID gracefully", () => {
    registry.addLibrary("non-existent-lib-id");
    const snapshot = registry.getSnapshot();

    expect(snapshot.loadedLibs["non-existent-lib-id"]).toBeUndefined();
    expect(snapshot.loadedLibs).toEqual({});
  });

  it("removes an existing library from the registry", () => {
    registry.addLibrary(defaultLibrary.id);
    expect(registry.getSnapshot().loadedLibs[defaultLibrary.id]).toBeDefined();

    registry.removeLibrary(defaultLibrary.id);
    expect(registry.getSnapshot().loadedLibs[defaultLibrary.id]).toBeUndefined();
    expect(registry.getSnapshot().loadedLibs).toEqual({});
  });

  it("logs an error and preserves state when removing a non-existent library", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    registry.addLibrary(defaultLibrary.id);
    const stateBefore = registry.getSnapshot().loadedLibs;

    registry.removeLibrary("unknown-lib");

    expect(consoleError).toHaveBeenCalledWith(
      "Couldn't find library with id: unknown-lib in the registry",
    );
    expect(registry.getSnapshot().loadedLibs).toEqual(stateBefore);

    consoleError.mockRestore();
  });

  it("exposes the underlying Zustand store via getStore", () => {
    const store = registry.getStore();
    expect(store.getState()).toEqual(registry.getSnapshot());

    act(() => {
      registry.addLibrary(defaultLibrary.id);
    });

    expect(store.getState().loadedLibs[defaultLibrary.id]).toEqual(defaultLibrary);
  });
});

describe("LibraryRegistryProvider & Hooks", () => {
  let registry: LibraryRegistry;

  beforeEach(() => {
    registry = new LibraryRegistry();
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

  it("selects state slice and updates reactively with useLibraryRegistryStore", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LibraryRegistryProvider registry={registry}>{children}</LibraryRegistryProvider>
    );

    const { result } = renderHook(() => useLibraryRegistryStore((s) => s.loadedLibs), { wrapper });

    expect(result.current).toEqual({});

    act(() => {
      registry.addLibrary(defaultLibrary.id);
    });

    expect(result.current[defaultLibrary.id]).toEqual(defaultLibrary);

    act(() => {
      registry.removeLibrary(defaultLibrary.id);
    });

    expect(result.current).toEqual({});
  });
});
