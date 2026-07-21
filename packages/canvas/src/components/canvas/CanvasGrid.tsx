import { Background, BackgroundVariant, useViewport } from "@xyflow/react";
import { useShallow } from "zustand/shallow";
import { CanvasStoreState, useCanvasStore } from "../../store";

const selector = (state: CanvasStoreState) => ({
  grid: state.grid,
});

export const CanvasGrid = () => {
  const { grid } = useCanvasStore(useShallow(selector));
  const { zoom } = useViewport();

  if (!grid) {
    return null;
  }

  return (
    <>
      {/* minor lines */}
      <Background
        id="minor-grid-lines"
        gap={10}
        variant={BackgroundVariant.Lines}
        // farthest zoom value is 0.5, and we want to hide the minor grids at that zoom level
        color={`rgba(150, 150, 150, ${0.2 * (zoom - 0.5)})`}
        lineWidth={1}
      />
      {/* major lines */}
      <Background
        id="major-grid-lines"
        gap={50}
        variant={BackgroundVariant.Lines}
        color="rgba(150, 150, 150, 0.3)"
        lineWidth={1}
      />
    </>
  );
};
