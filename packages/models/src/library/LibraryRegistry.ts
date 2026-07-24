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

  public constructor() {
    this.store = createStore<LibraryRegistryState>(() => ({
      loadedLibs: {},
    }));

    this.initIDB();
  }

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

      const promises = appConfig?.selectedLibs?.map((libId) => this.addLibrary(libId));

      if (promises) {
        await Promise.all(promises);
      }
    } catch (e) {
      console.error("Failed to initialize IndexedDB", e);
    }
  }

  private isIDBLoaded = (): boolean => {
    return this.idb !== null;
  };

  public listAllLibraries = (): LibraryMetadata[] => {
    return [defaultLibraryMetadata];
  };

  public async addLibrary(id: string) {
    if (this.store.getState().loadedLibs[id]) return;

    // fetch the lib from the idb and add it to the state store
    if (this.isIDBLoaded()) {
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
    // todo: else fetch it from the object storage
  }

  public removeLibrary = (id: string) => {
    this.store.setState((s) => {
      const { [id]: removedLib, ...rest } = s.loadedLibs;

      if (!removedLib) {
        console.error(`Couldn't find library with id: ${id} in the registry`);
        return s;
      }

      return { loadedLibs: rest };
    });
  };

  public getStore = (): StoreApi<LibraryRegistryState> => {
    return this.store;
  };

  public getSnapshot = () => {
    return this.store.getState();
  };
}

export { LibraryRegistry, type LibraryRegistryState };

// todo: add proper error propagation, schema validation during load & saving
