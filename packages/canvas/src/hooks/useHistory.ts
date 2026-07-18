import { StoreApi, useStore } from "zustand";
import { useShallow } from "zustand/shallow";
import { CanvasStoreState } from "../store";

const selector = (state: CanvasStoreState) => ({
  history: state.history,
  commit: state.commit,
  undo: state.undo,
  redo: state.redo,
});

export const useHistory = (canvasState: StoreApi<CanvasStoreState>) => {
  const { history, commit, undo, redo } = useStore(canvasState, useShallow(selector));

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  return { canUndo, canRedo, commit, undo, redo };
};
