import { Canvas, createCanvasStore } from "@sysdraw/canvas";
import { LibraryRegistry } from "@sysdraw/models";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Classic } from "../components/loading-ui/classic";

export const Route = createFileRoute("/")({
  ssr: false,
  pendingComponent: LoadingScreen,
  head: () => ({
    meta: [
      {
        title: "SysDraw - System Architecture & Diagramming",
      },
      {
        name: "description",
        content:
          "Interactive canvas for system architecture design and diagramming.",
      },
    ],
  }),
  component: HomeComponent,
});

function LoadingScreen() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-background text-foreground select-none">
      <div className="flex flex-col items-center gap-3">
        <Classic className="size-6 text-foreground" />
        <span className="text-xs font-medium text-muted-foreground tracking-wide">
          Loading canvas...
        </span>
      </div>
    </div>
  );
}

function HomeComponent() {
  const canvasState = useMemo(
    () => createCanvasStore({ nodes: [], edges: [] }),
    [],
  );
  const libraryRegistry = useMemo(() => new LibraryRegistry(), []);

  return <Canvas libraryRegistry={libraryRegistry} canvasState={canvasState} />;
}
