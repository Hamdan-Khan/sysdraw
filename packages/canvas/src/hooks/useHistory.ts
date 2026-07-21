import { useShallow } from "zustand/shallow";
import { CanvasStoreState, useCanvasStore } from "../store";

const selector = (state: CanvasStoreState) => ({
  history: state.history,
  commit: state.commit,
  undo: state.undo,
  redo: state.redo,
});

export const useHistory = () => {
  const { history, commit, undo, redo } = useCanvasStore(useShallow(selector));

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  return { canUndo, canRedo, commit, undo, redo };
};
