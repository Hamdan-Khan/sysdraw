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
