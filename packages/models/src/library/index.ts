import { StoreApi, createStore } from "zustand/vanilla";
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

class LibraryRegistry {
  private store: StoreApi<LibraryRegistryState>;

  public constructor() {
    this.store = createStore<LibraryRegistryState>(() => ({
      loadedLibs: {},
    }));
  }

  public listAllLibraries = (): LibraryMetadata[] => {
    return [defaultLibraryMetadata];
  };

  public addLibrary = (id: string) => {
    if (this.store.getState().loadedLibs[id]) return;

    if (id === defaultLibrary.id) {
      this.store.setState((s) => ({
        loadedLibs: { ...s.loadedLibs, [id]: defaultLibrary },
      }));
    }
    // todo: else fetch it from the object storage
  };

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

export * from "./LibraryRegistryProvider";
export * from "./types";
export { LibraryRegistry, type LibraryRegistryState };
