import defaultLibrary from "./default_library.json";
import { LibraryManifest, LibraryMetadata } from "./types";

export const defaultLibraryMetadata: LibraryMetadata = {
  id: defaultLibrary.id,
  name: defaultLibrary.name,
  version: defaultLibrary.version,
};

class LibraryRegistry {
  private loadedLibs = new Map<string, LibraryManifest>();

  public listAllLibraries(): LibraryMetadata[] {
    return [defaultLibraryMetadata];
  }

  public addLibrary(id: string) {
    if (id === defaultLibrary.id) {
      this.loadedLibs.set(id, defaultLibrary);
    }
    // todo: else fetch it from the object storage
  }

  public removeLibrary(id: string) {
    if (this.loadedLibs.has(id)) {
      this.loadedLibs.delete(id);
      return;
    }

    console.error(`Couldn't remove library with id: ${id}, it was not found in the registry`);
  }
}

export { LibraryRegistry };
