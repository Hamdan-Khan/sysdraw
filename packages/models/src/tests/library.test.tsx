import { IDB_DATABASE_NAME } from "@sysdraw/common";
import { act, renderHook } from "@testing-library/react";
import "fake-indexeddb/auto";
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
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    registry = new LibraryRegistry({ url: "http://localhost/lib" });
  });

  afterEach(async () => {
    try {
      await registry?.whenReady();
    } catch {}
    registry?.close();
    indexedDB.deleteDatabase(IDB_DATABASE_NAME);
    localStorage.clear();
    consoleSpy.mockRestore();
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
  it("throws an error if constructor url option is missing or empty", () => {
    expect(() => new LibraryRegistry({ url: "" })).toThrow(
      "LibraryRegistry requires a url",
    );
  });

  it("fetches and returns library metadata list from remote when available", async () => {
    const mockMetaList = [
      {
        id: "aws-icons",
        name: "AWS Icons",
        version: "1.0.0",
        description: "AWS Cloud Icons",
        path: "data/aws.json",
      },
    ];

    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(Response.json({ libraries: mockMetaList }));

    const libraries = await registry.listAllLibraries();
    expect(fetchSpy).toHaveBeenCalledWith("http://localhost/lib/metadata.json");
    expect(libraries).toEqual(mockMetaList);

    fetchSpy.mockRestore();
  });

  it("falls back to default library metadata when remote fetch fails", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockRejectedValueOnce(new Error("Network Error"));

    const libraries = await registry.listAllLibraries();
    expect(libraries).toHaveLength(1);
    expect(libraries[0].id).toBe(defaultLibrary.id);

    fetchSpy.mockRestore();
  });

  it("falls back to default library metadata when remote data has unexpected shape", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(Response.json({ libraries: "invalid_format" }));

    const libraries = await registry.listAllLibraries();
    expect(libraries).toHaveLength(1);
    expect(libraries[0].id).toBe(defaultLibrary.id);

    fetchSpy.mockRestore();
  });

  it("sets selectedLib to null when selecting an unknown library with no cache or remote", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockRejectedValue(new Error("404 Not Found"));

    await act(async () => {
      await registry.selectLibrary("non-existent-id");
    });

    expect(registry.getSnapshot().selectedLib).toBeNull();

    fetchSpy.mockRestore();
  });

  it("adds a local library and listLocalLibraries returns it", async () => {
    const mockLocalLib = {
      id: "custom-1",
      name: "Custom Icons",
      version: "1.0.0",
      description: "My custom icons",
      nodes: [
        {
          id: "n1",
          type: "node",
          label: "Server",
        },
      ],
    };

    const addResult = await registry.addLocalLibrary(mockLocalLib);
    expect(addResult).toEqual({ success: true });

    const localLibs = await registry.listLocalLibraries();
    expect(localLibs).toHaveLength(1);
    expect(localLibs[0].name).toBe("Custom Icons");

    const state = registry.getSnapshot();
    expect(state.localLibraries).toHaveLength(1);
    expect(state.localLibraries[0].id).toBe("custom-1");
  });

  it("detects name conflict when adding a local library with an existing name", async () => {
    const lib1 = {
      id: "custom-1",
      name: "Network Icons",
      version: "1.0.0",
      nodes: [],
    };

    const lib2 = {
      id: "custom-2",
      name: "network icons ", // case & space insensitive duplicate
      version: "1.0.0",
      nodes: [],
    };

    await registry.addLocalLibrary(lib1);
    const conflictResult = await registry.addLocalLibrary(lib2);

    expect(conflictResult.success).toBe(false);
    if (!conflictResult.success) {
      expect(conflictResult.conflict?.id).toBe("custom-1");
    }

    // Overwrite with force: true
    const forceResult = await registry.addLocalLibrary(lib2, true);
    expect(forceResult).toEqual({ success: true });
  });

  it("deletes a local library and falls back to default if deleted lib was selected", async () => {
    const mockLocalLib = {
      id: "custom-del",
      name: "Delete Me",
      version: "1.0.0",
      nodes: [],
    };

    await registry.addLocalLibrary(mockLocalLib);
    await registry.selectLibrary("custom-del");

    expect(registry.getSnapshot().selectedLib?.id).toBe("custom-del");

    await registry.deleteLocalLibrary("custom-del");
    expect(registry.getSnapshot().selectedLib?.id).toBe(defaultLibrary.id);
    expect(registry.getSnapshot().localLibraries).toHaveLength(0);
  });

  it("merges remote and local libraries when calling listAllLibraries", async () => {
    const mockMetaList = [
      {
        id: "aws-icons",
        name: "AWS Icons",
        version: "1.0.0",
        path: "data/aws.json",
      },
    ];

    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async () =>
        Response.json({ libraries: mockMetaList }),
      );

    const localLib = {
      id: "my-local",
      name: "My Local",
      version: "1.0.0",
      nodes: [],
    };

    await registry.addLocalLibrary(localLib);

    const allLibs = await registry.listAllLibraries();
    expect(allLibs.map((l) => l.id)).toEqual([
      "aws-icons",
      "default",
      "my-local",
    ]);

    fetchSpy.mockRestore();
  });
});

describe("LibraryRegistryProvider & Hooks", () => {
  let registry: LibraryRegistry;
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    registry = new LibraryRegistry({ url: "http://localhost/lib" });
  });

  afterEach(async () => {
    try {
      await registry?.whenReady();
    } catch {}
    registry?.close();
    consoleSpy.mockRestore();
  });

  it("throws an error when useLibraryRegistry is used outside LibraryRegistryProvider", () => {
    expect(() => renderHook(() => useLibraryRegistry())).toThrow(
      "useLibraryRegistry must be used within a LibraryRegistryProvider",
    );
  });

  it("throws an error when useLibraryRegistryStore is used outside LibraryRegistryProvider", () => {
    expect(() => renderHook(() => useLibraryRegistryStore((s) => s))).toThrow(
      "useLibraryRegistryStore must be used within a LibraryRegistryProvider",
    );
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

  it("updates returned registry when provider registry prop changes", async () => {
    const secondRegistry = new LibraryRegistry({
      url: "http://localhost/lib2",
    });

    let setRegFn: (r: LibraryRegistry) => void = () => {};

    const Wrapper = ({ children }: { children: React.ReactNode }) => {
      const [currentReg, setCurrentReg] = React.useState(registry);
      setRegFn = setCurrentReg;
      return (
        <LibraryRegistryProvider registry={currentReg}>
          {children}
        </LibraryRegistryProvider>
      );
    };

    const { result } = renderHook(() => useLibraryRegistry(), {
      wrapper: Wrapper,
    });

    expect(result.current).toBe(registry);

    act(() => {
      setRegFn(secondRegistry);
    });

    expect(result.current).toBe(secondRegistry);

    await secondRegistry.whenReady();
    secondRegistry.close();
  });
});
