import { IDB_CONFIG_KEY, IDB_DATABASE_NAME, IDB_DATABASE_VERSION } from "@sysdraw/common";
import "fake-indexeddb/auto";
import { openDB } from "idb";
import { afterEach, describe, expect, it } from "vitest";
import defaultLibrary from "../library/default_library.json";
import { LibraryRegistry } from "../library/LibraryRegistry";

describe("LibraryRegistry IndexedDB Integration", () => {
  let activeRegistries: LibraryRegistry[] = [];

  const createRegistry = () => {
    const reg = new LibraryRegistry();
    activeRegistries.push(reg);
    return reg;
  };

  afterEach(() => {
    activeRegistries.forEach((reg) => reg.close());
    activeRegistries = [];
    indexedDB.deleteDatabase(IDB_DATABASE_NAME);
  });

  it("automatically seeds IndexedDB with default library and config on first initialization", async () => {
    const registry = createRegistry();
    await registry.whenReady();

    // Verify Zustand state auto-loaded default library on first init
    expect(registry.getSnapshot().loadedLibs[defaultLibrary.id]).toEqual(defaultLibrary);

    // Verify raw IndexedDB contents
    const db = await openDB(IDB_DATABASE_NAME, IDB_DATABASE_VERSION);
    const storedLib = await db.get("libraries", defaultLibrary.id);
    expect(storedLib).toEqual(defaultLibrary);

    const storedConfig = await db.get("config", IDB_CONFIG_KEY);
    expect(storedConfig).toEqual({ selectedLibs: [defaultLibrary.id] });
    db.close();
  });

  it("persists library addition to IndexedDB config", async () => {
    const registry = createRegistry();
    await registry.whenReady();

    await registry.addLibrary("default");

    const db = await openDB(IDB_DATABASE_NAME, IDB_DATABASE_VERSION);
    const config = await db.get("config", IDB_CONFIG_KEY);
    expect(config.selectedLibs).toContain("default");
    db.close();
  });

  it("persists library removal from IndexedDB config", async () => {
    const registry = createRegistry();
    await registry.whenReady();

    await registry.removeLibrary(defaultLibrary.id);

    expect(registry.getSnapshot().loadedLibs[defaultLibrary.id]).toBeUndefined();

    const db = await openDB(IDB_DATABASE_NAME, IDB_DATABASE_VERSION);
    const config = await db.get("config", IDB_CONFIG_KEY);
    expect(config.selectedLibs).not.toContain(defaultLibrary.id);
    db.close();
  });

  it("loads configured libraries when re-instantiated with pre-existing IndexedDB state", async () => {
    const registry1 = createRegistry();
    await registry1.whenReady();

    // Close first connection before starting new session
    registry1.close();

    // Re-instantiate LibraryRegistry in a new session simulation
    const registry2 = createRegistry();
    await registry2.whenReady();

    expect(registry2.getSnapshot().loadedLibs[defaultLibrary.id]).toEqual(defaultLibrary);
  });
});
