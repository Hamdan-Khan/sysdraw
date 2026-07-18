import { ControlButton, Controls } from "@xyflow/react";
import { ArchiveRestore, Redo, Save, Undo } from "lucide-react";
import { StoreApi } from "zustand";
import { useCanvasStorage, useHistory } from "../../hooks";
import { CanvasStoreState } from "../../store";

export const ControlsBar = ({ canvasState }: { canvasState: StoreApi<CanvasStoreState> }) => {
  const { onSave, onRestore } = useCanvasStorage(canvasState);
  const { undo, redo, canUndo, canRedo } = useHistory(canvasState);

  return (
    <Controls position="top-right" orientation="horizontal">
      <ControlButton onClick={() => onSave()}>
        <Save />
      </ControlButton>
      <ControlButton onClick={() => onRestore()}>
        <ArchiveRestore />
      </ControlButton>
      <ControlButton disabled={!canUndo} onClick={() => undo()}>
        <Undo />
      </ControlButton>
      <ControlButton disabled={!canRedo} onClick={() => redo()}>
        <Redo />
      </ControlButton>
    </Controls>
  );
};
