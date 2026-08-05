import { IDB_DATABASE_NAME, IDB_DATABASE_VERSION } from "@zero-sketch/common";
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
    "ZeroSketch's default library, sufficient for simple architecture diagrams.",
  icon: "https://dummyimage.com/100x100/54ffcc/005e0e.png&text=Sd",
  tags: ["basic"],
  path: "data/default_library.json",
};

interface LibraryRegistryState {
  selectedLib: LibraryManifest | null;
  localLibraries: LibraryMetadata[];
}

type AddLibraryResult = { success: boolean; conflict?: LibraryMetadata };

interface ZeroSketchDB extends DBSchema {
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
  private idb: IDBPDatabase<ZeroSketchDB> | null = null;
  private initPromise: Promise<void>;
  private config: RegistryConfig;
  private remoteLibrariesList: LibraryMetadata[] | null = null;

  public constructor({ url }: LibraryRegistryOptions) {
    if (!url) {
      throw new Error("LibraryRegistry requires a url");
    }
    this.baseUrl = url.replace(/\/$/, "");
    this.config = this.loadConfigFromLocalStorage();

    this.store = createStore<LibraryRegistryState>(() => ({
      selectedLib: null,
      localLibraries: [],
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
    if (typeof window === "undefined") {
      return;
    }
    try {
      this.idb = await openDB<ZeroSketchDB>(
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

      await this.listLocalLibraries();
      await this.selectLibrary(this.config.selectedLib);
    } catch (e) {
      console.error("Failed to initialize IndexedDB", e);
    }
  }

  private get isIDBLoaded(): boolean {
    return this.idb !== null;
  }

  /**
   * lists all local libraries stored in the registry.
   * also updates the local store state
   */
  public listLocalLibraries = async (): Promise<LibraryMetadata[]> => {
    if (!this.isIDBLoaded) {
      return this.store.getState().localLibraries;
    }

    // to get the exclusively local libraries, we filter out the remote libraries
    // from the idb, because remote libs are the source of truth for us
    try {
      const allManifests = await this.idb!.getAll("libraries");
      const remoteIds = new Set(
        (this.remoteLibrariesList ?? [defaultLibraryMetadata]).map((m) => m.id),
      );

      const localMetas: LibraryMetadata[] = allManifests
        .filter((manifest) => {
          if (remoteIds.has(manifest.id)) {
            return false;
          }
          if (!this.remoteLibrariesList && manifest.path) {
            return false;
          }
          return true;
        })
        .map((manifest) => {
          const { nodes: _nodes, ...metadata } = manifest;
          return metadata;
        });

      this.store.setState({ localLibraries: localMetas });
      return localMetas;
    } catch (e) {
      console.error("Failed to list local libraries from IndexedDB", e);
      return this.store.getState().localLibraries;
    }
  };

  public listAllLibraries = async (): Promise<LibraryMetadata[]> => {
    let remoteList: LibraryMetadata[] = [defaultLibraryMetadata];

    try {
      const response = await fetch(`${this.baseUrl}/metadata.json`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.libraries)) {
          remoteList = data.libraries;
        }
      }
    } catch (e) {
      console.error("Failed to fetch library metadata from remote:", e);
    }

    this.remoteLibrariesList = remoteList;

    const localList = await this.listLocalLibraries();
    const remoteIds = new Set(remoteList.map((m) => m.id));
    const uniqueLocalList = localList.filter((m) => !remoteIds.has(m.id));

    return [...remoteList, ...uniqueLocalList];
  };

  /**
   * adds a local library to the regitry and stores it in idb.
   * in case of a conflict (duplicate name), it fails and returns a conflict
   */
  public addLocalLibrary = async (
    manifest: LibraryManifest,
    force?: boolean,
  ): Promise<AddLibraryResult> => {
    await this.whenReady();

    const normalizedName = manifest.name.trim().toLowerCase();
    const currentLocal = this.store.getState().localLibraries;
    const remoteList = this.remoteLibrariesList ?? [defaultLibraryMetadata];

    const conflictingLocal = currentLocal.find((m) => {
      return m.name.trim().toLowerCase() === normalizedName;
    });
    const conflictingRemote = remoteList.find(
      (m) => m.name.trim().toLowerCase() === normalizedName,
    );

    const conflict = conflictingLocal || conflictingRemote;

    // dont proceed if there is a conflict and the force flag is not set
    if (conflict && !force) {
      return { success: false, conflict };
    }

    if (this.isIDBLoaded) {
      await this.idb!.put("libraries", manifest);
    }

    await this.listLocalLibraries();
    return { success: true };
  };

  public deleteLocalLibrary = async (id: string): Promise<void> => {
    await this.whenReady();

    if (this.isIDBLoaded) {
      await this.idb!.delete("libraries", id);
    }

    await this.listLocalLibraries();

    if (
      this.config.selectedLib === id ||
      this.store.getState().selectedLib?.id === id
    ) {
      await this.selectLibrary(defaultLibraryMetadata.id);
    }
  };

  /**
   * retrieves a local library manifest by id
   */
  public getLibraryManifest = async (
    id: string,
  ): Promise<LibraryManifest | null> => {
    await this.whenReady();
    if (this.isIDBLoaded) {
      try {
        const cached = await this.idb!.get("libraries", id);
        return cached ?? null;
      } catch (e) {
        console.error(`Failed to get library manifest for ${id} from IDB`, e);
      }
    }
    return null;
  };

  /**
   * selects a library for use in the application, by updating the local config
   * and loading the library into the registry
   */
  public selectLibrary = async (id: string): Promise<void> => {
    this.config.selectedLib = id;
    this.saveConfigToLocalStorage();

    /**  remote library's metadata, without the nodes / groups data */
    let meta: LibraryMetadata | null = null;
    try {
      // fetch libraries list if not available in memory
      if (!this.remoteLibrariesList) {
        await this.listAllLibraries();
      }
      meta = this.remoteLibrariesList?.find((m) => m.id === id) ?? null;
    } catch (e) {
      console.error("Failed to list libraries when selecting library", e);
    }

    /** cached library from idb */
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
    } else if (
      cachedLib &&
      ((meta && cachedLib.version === meta.version) || !meta)
    ) {
      // use the idb cached library if it matches version or is a local library (no remote meta)
      manifestToUse = cachedLib;
    } else if (meta && meta.path) {
      // otherwise, fetch the library from the remote server and cache it
      try {
        const cleanPath = meta.path.replace(/^\//, "");
        const response = await fetch(`${this.baseUrl}/${cleanPath}`);
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
      manifestToUse = defaultLibrary as LibraryManifest;
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

export { LibraryRegistry, type AddLibraryResult, type LibraryRegistryState };
