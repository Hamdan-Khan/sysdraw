import { IDB_DATABASE_NAME, IDB_DATABASE_VERSION } from "@sysdraw/common";
import "fake-indexeddb/auto";
import { openDB } from "idb";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { REGISTRY_CONFIG_KEY } from "../config";
import defaultLibrary from "../library/default_library.json";
import { LibraryRegistry } from "../library/LibraryRegistry";

describe("LibraryRegistry IndexedDB & LocalStorage Integration", () => {
  let activeRegistries: LibraryRegistry[] = [];

  const createRegistry = () => {
    const reg = new LibraryRegistry({ url: "http://localhost/lib" });
    activeRegistries.push(reg);
    return reg;
  };

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    activeRegistries.forEach((reg) => reg.close());
    activeRegistries = [];
    indexedDB.deleteDatabase(IDB_DATABASE_NAME);
    localStorage.clear();
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
});
