import { Background, BackgroundVariant } from "@xyflow/react";
import { StoreApi, useStore } from "zustand";
import { useShallow } from "zustand/shallow";
import { CanvasStoreState } from "../../store";

const selector = (state: CanvasStoreState) => ({
  grid: state.grid,
});

export const CanvasGrid = ({ canvasState }: { canvasState: StoreApi<CanvasStoreState> }) => {
  const { grid } = useStore(canvasState, useShallow(selector));

  if (!grid) {
    return null;
  }

  return (
    <>
      {/* minor lines */}
      <Background
        id="minor-grid-lines"
        gap={20}
        variant={BackgroundVariant.Lines}
        color="rgba(150, 150, 150, 0.15)"
        lineWidth={1}
      />
      {/* major lines */}
      <Background
        id="major-grid-lines"
        gap={100}
        variant={BackgroundVariant.Lines}
        color="rgba(150, 150, 150, 0.3)"
        lineWidth={1}
      />
    </>
  );
};
