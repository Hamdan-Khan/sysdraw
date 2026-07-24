import { IDB_CONFIG_KEY, IDB_DATABASE_NAME, IDB_DATABASE_VERSION } from "@sysdraw/common";
import { DBSchema, IDBPDatabase, openDB } from "idb";
import { StoreApi, createStore } from "zustand/vanilla";
import { AppConfig } from "../config";
import defaultLibrary from "./default_library.json";
import { LibraryManifest, LibraryMetadata } from "./types";

const defaultLibraryMetadata: LibraryMetadata = {
  id: defaultLibrary.id,
  name: defaultLibrary.name,
  version: defaultLibrary.version,
};

interface LibraryRegistryState {
  loadedLibs: Record<string, LibraryManifest>;
}

interface SysdrawDB extends DBSchema {
  config: {
    key: string;
    value: AppConfig;
  };
  libraries: {
    key: string;
    value: LibraryManifest;
  };
}

class LibraryRegistry {
  private store: StoreApi<LibraryRegistryState>;
  private idb: IDBPDatabase<SysdrawDB> | null = null;
  private initPromise: Promise<void>;

  public constructor() {
    this.store = createStore<LibraryRegistryState>(() => ({
      loadedLibs: {},
    }));

    this.initPromise = this.initIDB();
  }

  public whenReady = (): Promise<void> => {
    return this.initPromise;
  };

  /** loads library from IDB and adds it to the store if it exists. */
  private async loadLibraryFromIDB(id: string) {
    if (this.store.getState().loadedLibs[id]) return;

    if (this.isIDBLoaded) {
      try {
        const lib = await this.idb!.get("libraries", id);
        if (lib) {
          this.store.setState((s) => ({
            loadedLibs: { ...s.loadedLibs, [id]: lib },
          }));
        }
      } catch (e) {
        console.error(`Failed to load library ${id} from IndexedDB`, e);
      }
    }
  }

  /**
   * initializes the IDB connection and loads all the selected libraries
   * from the app config. On first load (when app config is empty), it sets
   * the default library in the config and seeds the database with it.
   */
  private async initIDB() {
    try {
      this.idb = await openDB<SysdrawDB>(IDB_DATABASE_NAME, IDB_DATABASE_VERSION, {
        upgrade(db) {
          db.createObjectStore("config");
          db.createObjectStore("libraries", {
            keyPath: "id",
          });
        },
      });

      // seed the database with the default library if it's not already there
      const defaultLib = await this.idb.get("libraries", defaultLibrary.id);
      if (!defaultLib) {
        await this.idb.put("libraries", defaultLibrary);
      }

      // after initialization, get all the selected libs from the config and add
      // their library manifests to the store
      let appConfig = await this.idb.get("config", IDB_CONFIG_KEY);

      // if no libraries are selected, select the default one and update the config
      if (!appConfig || !appConfig.selectedLibs || appConfig.selectedLibs.length === 0) {
        appConfig = { selectedLibs: [defaultLibrary.id] };
        await this.idb.put("config", appConfig, IDB_CONFIG_KEY);
      }

      const promises = appConfig.selectedLibs.map((libId) => this.loadLibraryFromIDB(libId));

      if (promises) {
        await Promise.all(promises);
      }
    } catch (e) {
      console.error("Failed to initialize IndexedDB", e);
    }
  }

  private get isIDBLoaded(): boolean {
    return this.idb !== null;
  }

  public listAllLibraries = (): LibraryMetadata[] => {
    return [defaultLibraryMetadata];
  };

  public addLibrary = async (id: string): Promise<void> => {
    await this.initPromise;

    if (this.store.getState().loadedLibs[id]) return;

    await this.loadLibraryFromIDB(id);

    if (this.isIDBLoaded && this.store.getState().loadedLibs[id]) {
      try {
        let appConfig = await this.idb!.get("config", IDB_CONFIG_KEY);
        if (!appConfig) {
          appConfig = { selectedLibs: [] };
        }
        if (!appConfig.selectedLibs.includes(id)) {
          appConfig.selectedLibs = [...appConfig.selectedLibs, id];
          await this.idb!.put("config", appConfig, IDB_CONFIG_KEY);
        }
      } catch (e) {
        console.error(`Failed to update config in IndexedDB for library ${id}`, e);
      }
    }
  };

  public removeLibrary = async (id: string): Promise<void> => {
    // update state store
    this.store.setState((s) => {
      const { [id]: removedLib, ...rest } = s.loadedLibs;

      if (!removedLib) {
        console.error(`Couldn't find library with id: ${id} in the registry`);
        return s;
      }

      return { loadedLibs: rest };
    });

    await this.initPromise;

    // update the indexedDB config
    if (this.isIDBLoaded) {
      try {
        let appConfig = await this.idb!.get("config", IDB_CONFIG_KEY);
        if (appConfig?.selectedLibs) {
          appConfig.selectedLibs = appConfig.selectedLibs.filter((libId) => libId !== id);
          await this.idb!.put("config", appConfig, IDB_CONFIG_KEY);
        }
      } catch (e) {
        console.error(`Failed to update config in IndexedDB when removing library ${id}`, e);
      }
    }
  };

  public getStore = (): StoreApi<LibraryRegistryState> => {
    return this.store;
  };

  public getSnapshot = () => {
    return this.store.getState();
  };

  public close = (): void => {
    if (this.idb) {
      this.idb.close();
      this.idb = null;
    }
  };
}

export { LibraryRegistry, type LibraryRegistryState };

// todo: add proper error propagation, schema validation during load & saving
