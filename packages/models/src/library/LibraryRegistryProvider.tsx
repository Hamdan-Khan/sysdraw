import { createContext, ReactNode, useContext, useMemo } from "react";
import { useStore } from "zustand";
import { LibraryRegistry, LibraryRegistryState } from "./index";

const LibraryRegistryContext = createContext<LibraryRegistry | null>(null);

interface LibraryRegistryProviderProps {
  registry: LibraryRegistry;
  children: ReactNode;
}

function LibraryRegistryProvider({ registry, children }: LibraryRegistryProviderProps) {
  const registryInstance = useMemo(() => registry, [registry]);

  return (
    <LibraryRegistryContext.Provider value={registryInstance}>
      {children}
    </LibraryRegistryContext.Provider>
  );
}

/**
 * hook to access the current `LibraryRegistry` store's state
 * @param selector a selector function to extract the desired state from the store
 * @returns selected state
 */
function useLibraryRegistryStore<T = LibraryRegistryState>(
  selector: (state: LibraryRegistryState) => T,
): T {
  const registry = useContext(LibraryRegistryContext);
  if (!registry) {
    throw new Error("useLibraryRegistryStore must be used within a LibraryRegistryProvider");
  }
  return useStore(registry.getStore(), selector);
}

/**
 * hook to access the current `LibraryRegistry` instance.
 * allows calling methods like `addLibrary`, `removeLibrary`, etc.
 */
function useLibraryRegistry(): LibraryRegistry {
  const registry = useContext(LibraryRegistryContext);
  if (!registry) {
    throw new Error("useLibraryRegistry must be used within a LibraryRegistryProvider");
  }
  return registry;
}

export {
  LibraryRegistryContext,
  LibraryRegistryProvider,
  // oxlint-disable-next-line react/only-export-components
  useLibraryRegistry,
  // oxlint-disable-next-line react/only-export-components
  useLibraryRegistryStore,
};
