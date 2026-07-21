import { createContext, ReactNode, useContext } from "react";
import { StoreApi, useStore } from "zustand";
import { CanvasStoreState } from "./store";

const CanvasStoreContext = createContext<StoreApi<CanvasStoreState> | null>(null);

export interface CanvasStoreProviderProps {
  store: StoreApi<CanvasStoreState>;
  children: ReactNode;
}

function CanvasStoreProvider({ store, children }: CanvasStoreProviderProps) {
  return <CanvasStoreContext.Provider value={store}>{children}</CanvasStoreContext.Provider>;
}

function useCanvasStore<T = CanvasStoreState>(selector: (state: CanvasStoreState) => T): T {
  const store = useContext(CanvasStoreContext);
  if (!store) {
    throw new Error("useCanvasStore must be used within a CanvasStoreProvider");
  }
  return useStore(store, selector);
}

export { CanvasStoreContext, CanvasStoreProvider, useCanvasStore };
