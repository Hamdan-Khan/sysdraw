import { IDB_DATABASE_NAME, IDB_DATABASE_VERSION } from "@sysdraw/common";
import { DBSchema, IDBPDatabase, openDB } from "idb";
import { StoreApi, createStore } from "zustand/vanilla";
import { REGISTRY_CONFIG_KEY, RegistryConfig } from "../config";
import defaultLibrary from "./default_library.json";
import { LibraryManifest, LibraryMetadata } from "./types";

const defaultLibraryMetadata: LibraryMetadata = {
  id: defaultLibrary.id,
  name: defaultLibrary.name,
  version: defaultLibrary.version,
  description:
    "Sysdraw's default library, sufficient for simple architecture diagrams.",
  icon: "https://dummyimage.com/100x100/54ffcc/005e0e.png&text=Sd",
  tags: ["basic"],
  path: "data/default_library.json",
};

interface LibraryRegistryState {
  selectedLib: LibraryManifest | null;
}

interface SysdrawDB extends DBSchema {
  libraries: {
    key: string;
    value: LibraryManifest;
  };
}

interface LibraryRegistryOptions {
  /** URL of the remote libraries repository */
  url: string;
}

class LibraryRegistry {
  private store: StoreApi<LibraryRegistryState>;
  private baseUrl: string;
  private idb: IDBPDatabase<SysdrawDB> | null = null;
  private initPromise: Promise<void>;
  private config: RegistryConfig;
  private librariesList: LibraryMetadata[] | null = null;

  public constructor({ url }: LibraryRegistryOptions) {
    if (!url) {
      throw new Error("LibraryRegistry requires a url");
    }
    this.baseUrl = url;
    this.config = this.loadConfigFromLocalStorage();

    this.store = createStore<LibraryRegistryState>(() => ({
      selectedLib: null,
    }));

    this.initPromise = this.initIDB();
  }

  private loadConfigFromLocalStorage(): RegistryConfig {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      try {
        const stored = localStorage.getItem(REGISTRY_CONFIG_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed.selectedLib === "string") {
            return parsed;
          }
        }
      } catch (e) {
        console.error("Failed to read registry config from localStorage", e);
      }
    }
    // ssr fallback
    return { selectedLib: defaultLibraryMetadata.id };
  }

  private saveConfigToLocalStorage() {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      try {
        localStorage.setItem(REGISTRY_CONFIG_KEY, JSON.stringify(this.config));
      } catch (e) {
        console.error("Failed to save registry config to localStorage", e);
      }
    }
  }

  public whenReady = (): Promise<void> => {
    return this.initPromise;
  };

  /**
   * initializes the IDB connection and loads the selected library from local config.
   * Seeds the database with default library if not present.
   */
  private async initIDB() {
    try {
      this.idb = await openDB<SysdrawDB>(
        IDB_DATABASE_NAME,
        IDB_DATABASE_VERSION,
        {
          upgrade(db) {
            if (!db.objectStoreNames.contains("libraries")) {
              db.createObjectStore("libraries", {
                keyPath: "id",
              });
            }
          },
        },
      );

      // seed the database with the default library if it's not already there
      const defaultLib = await this.idb.get("libraries", defaultLibrary.id);
      if (!defaultLib) {
        await this.idb.put("libraries", defaultLibrary as LibraryManifest);
      }

      await this.selectLibrary(this.config.selectedLib);
    } catch (e) {
      console.error("Failed to initialize IndexedDB", e);
    }
  }

  private get isIDBLoaded(): boolean {
    return this.idb !== null;
  }

  public listAllLibraries = async (): Promise<LibraryMetadata[]> => {
    if (!this.baseUrl) {
      this.librariesList = [defaultLibraryMetadata];
      return [defaultLibraryMetadata];
    }

    try {
      const baseUrl = this.baseUrl.replace(/\/$/, "");
      const response = await fetch(`${baseUrl}/metadata.json`);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch library metadata: ${response.statusText}`,
        );
      }
      const data = await response.json();
      if (Array.isArray(data.libraries)) {
        this.librariesList = data.libraries;
        return data.libraries;
      }
      return [defaultLibraryMetadata];
    } catch (e) {
      console.error("Failed to fetch library metadata from remote:", e);
      this.librariesList = [defaultLibraryMetadata];
      return [defaultLibraryMetadata];
    }
  };

  /**
   * selects a library for use in the application, by updating the local config
   * and loading the library into the registry
   */
  public selectLibrary = async (id: string): Promise<void> => {
    this.config.selectedLib = id;
    this.saveConfigToLocalStorage();

    let meta: LibraryMetadata | null = null;
    try {
      // fetch libraries list if not available in memory
      if (!this.librariesList) {
        await this.listAllLibraries();
      }
      meta = this.librariesList?.find((m) => m.id === id) ?? null;
    } catch (e) {
      console.error("Failed to list libraries when selecting library", e);
    }

    let cachedLib: LibraryManifest | null = null;
    if (this.isIDBLoaded) {
      try {
        cachedLib = (await this.idb!.get("libraries", id)) ?? null;
      } catch (e) {
        console.error(`Failed to load library ${id} from IndexedDB`, e);
      }
    }

    let manifestToUse: LibraryManifest | null = null;

    if (id === defaultLibraryMetadata.id) {
      // if default library is requested,we can use it directly as its a part of this module
      manifestToUse = defaultLibrary as unknown as LibraryManifest;
    } else if (cachedLib && meta && cachedLib.version === meta.version) {
      // use the idb cached library if it is the same version as the remote one
      manifestToUse = cachedLib;
    } else if (meta && meta.path && this.baseUrl) {
      // otherwise, fetch the library from the remote server and cache it
      try {
        const baseUrl = this.baseUrl.replace(/\/$/, "");
        const cleanPath = meta.path.replace(/^\//, "");
        const response = await fetch(`${baseUrl}/${cleanPath}`);
        if (response.ok) {
          const fetchedManifest = await response.json();
          manifestToUse = fetchedManifest;
          if (this.isIDBLoaded) {
            await this.idb!.put("libraries", fetchedManifest);
          }
        }
      } catch (e) {
        console.error(`Failed to fetch library ${id} from remote:`, e);
      }
    }

    // fallback to an outdated cached version if all else fails
    // todo: we should probably show an error to the user in this case
    if (!manifestToUse && cachedLib) {
      manifestToUse = cachedLib;
    } else if (id === defaultLibraryMetadata.id) {
      manifestToUse = defaultLibrary as unknown as LibraryManifest;
    }

    this.store.setState({
      selectedLib: manifestToUse,
    });
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
