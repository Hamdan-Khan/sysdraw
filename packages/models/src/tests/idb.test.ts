import { IDB_DATABASE_NAME, IDB_DATABASE_VERSION } from "@zero-sketch/common";
import "fake-indexeddb/auto";
import { openDB } from "idb";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { REGISTRY_CONFIG_KEY } from "../config";
import defaultLibrary from "../library/default_library.json";
import { LibraryRegistry } from "../library/LibraryRegistry";

describe("LibraryRegistry IndexedDB & LocalStorage Integration", () => {
  let activeRegistries: LibraryRegistry[] = [];
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  const createRegistry = () => {
    const reg = new LibraryRegistry({ url: "http://localhost/lib" });
    activeRegistries.push(reg);
    return reg;
  };

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    localStorage.clear();
  });

  afterEach(async () => {
    await Promise.allSettled(activeRegistries.map((reg) => reg.whenReady()));
    activeRegistries.forEach((reg) => reg.close());
    activeRegistries = [];
    indexedDB.deleteDatabase(IDB_DATABASE_NAME);
    localStorage.clear();
    consoleSpy.mockRestore();
  });

  it("automatically seeds IndexedDB with default library on first initialization", async () => {
    const registry = createRegistry();
    await registry.whenReady();

    // Verify Zustand state auto-loaded default library on first init
    expect(registry.getSnapshot().selectedLib).toEqual(defaultLibrary);

    // Verify raw IndexedDB contents
    const db = await openDB(IDB_DATABASE_NAME, IDB_DATABASE_VERSION);
    const storedLib = await db.get("libraries", defaultLibrary.id);
    expect(storedLib).toEqual(defaultLibrary);
    db.close();
  });

  it("persists selected library to localStorage", async () => {
    const registry = createRegistry();
    await registry.whenReady();

    await registry.selectLibrary("default");

    expect(registry.getSnapshot().selectedLib).toEqual(defaultLibrary);

    const storedConfig = JSON.parse(
      localStorage.getItem(REGISTRY_CONFIG_KEY) || "{}",
    );
    expect(storedConfig.selectedLib).toBe("default");
  });

  it("loads configured library from localStorage when re-instantiated", async () => {
    localStorage.setItem(
      REGISTRY_CONFIG_KEY,
      JSON.stringify({ selectedLib: defaultLibrary.id }),
    );

    const registry = createRegistry();
    await registry.whenReady();

    expect(registry.getSnapshot().selectedLib).toEqual(defaultLibrary);
  });

  it("fetches non-default library from remote and caches it in IndexedDB", async () => {
    const customMeta = {
      id: "custom-lib",
      name: "Custom Library",
      version: "1.0.0",
      path: "data/custom.json",
    };
    const customManifest = {
      ...customMeta,
      nodes: [{ id: "n1", type: "node", label: "Custom Node" }],
    };

    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async (url: RequestInfo | URL) => {
        const urlStr = String(url);
        if (urlStr.endsWith("metadata.json")) {
          return Response.json({ libraries: [customMeta] });
        }
        if (urlStr.endsWith("data/custom.json")) {
          return Response.json(customManifest);
        }
        return new Response(null, { status: 404 });
      });

    const registry = createRegistry();
    await registry.whenReady();

    await registry.selectLibrary("custom-lib");

    expect(registry.getSnapshot().selectedLib).toEqual(customManifest);

    // Verify it was saved into IndexedDB
    const db = await openDB(IDB_DATABASE_NAME, IDB_DATABASE_VERSION);
    const cachedInDb = await db.get("libraries", "custom-lib");
    expect(cachedInDb).toEqual(customManifest);
    db.close();

    fetchSpy.mockRestore();
  });

  it("uses cached library from IndexedDB when version matches remote metadata without fetching manifest", async () => {
    const cachedManifest = {
      id: "cached-lib",
      name: "Cached Library",
      version: "2.0.0",
      nodes: [],
    };

    // Pre-seed IndexedDB
    const db = await openDB(IDB_DATABASE_NAME, IDB_DATABASE_VERSION, {
      upgrade(d) {
        if (!d.objectStoreNames.contains("libraries")) {
          d.createObjectStore("libraries", { keyPath: "id" });
        }
      },
    });
    await db.put("libraries", cachedManifest);
    db.close();

    const remoteMeta = {
      id: "cached-lib",
      name: "Cached Library",
      version: "2.0.0",
      path: "data/cached.json",
    };

    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async (url: RequestInfo | URL) => {
        const urlStr = String(url);
        if (urlStr.endsWith("metadata.json")) {
          return Response.json({ libraries: [remoteMeta] });
        }
        throw new Error(`Unexpected fetch call to ${urlStr}`);
      });

    const registry = createRegistry();
    await registry.whenReady();

    await registry.selectLibrary("cached-lib");

    expect(registry.getSnapshot().selectedLib).toEqual(cachedManifest);
    // Fetch was called only for metadata.json, not data/cached.json
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    fetchSpy.mockRestore();
  });

  it("falls back to stale cached library in IndexedDB if remote fetch fails", async () => {
    const staleManifest = {
      id: "stale-lib",
      name: "Stale Library",
      version: "1.0.0",
      nodes: [],
    };

    // Pre-seed IndexedDB with old version 1.0.0
    const db = await openDB(IDB_DATABASE_NAME, IDB_DATABASE_VERSION, {
      upgrade(d) {
        if (!d.objectStoreNames.contains("libraries")) {
          d.createObjectStore("libraries", { keyPath: "id" });
        }
      },
    });
    await db.put("libraries", staleManifest);
    db.close();

    // Remote metadata indicates version 2.0.0 exists, but downloading manifest fails
    const remoteMeta = {
      id: "stale-lib",
      name: "Stale Library",
      version: "2.0.0",
      path: "data/stale.json",
    };

    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async (url: RequestInfo | URL) => {
        const urlStr = String(url);
        if (urlStr.endsWith("metadata.json")) {
          return Response.json({ libraries: [remoteMeta] });
        }
        return new Response(null, { status: 500, statusText: "Server Error" });
      });

    const registry = createRegistry();
    await registry.whenReady();

    await registry.selectLibrary("stale-lib");

    // Falls back to stale version from IDB
    expect(registry.getSnapshot().selectedLib).toEqual(staleManifest);

    fetchSpy.mockRestore();
  });

  it("allows calling close multiple times without error", async () => {
    const registry = createRegistry();
    await registry.whenReady();

    expect(() => {
      registry.close();
      registry.close();
    }).not.toThrow();
  });
});
