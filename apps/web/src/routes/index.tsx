import { APP_URL, LIBRARY_URL } from "@/lib/constants";
import { createFileRoute } from "@tanstack/react-router";
import { Canvas, createCanvasStore } from "@zero-sketch/canvas";
import { LibraryRegistry } from "@zero-sketch/models";
import { useMemo } from "react";
import { Classic } from "../components/loading-ui/classic";

export const Route = createFileRoute("/")({
  ssr: false,
  pendingComponent: LoadingScreen,
  head: () => ({
    meta: [
      {
        title: "ZeroSketch | System Design Canvas",
      },
      {
        name: "title",
        content:
          "ZeroSketch | A high level system design tool | Open Source & Free to use",
      },
      {
        name: "description",
        content:
          "Interactive drag & drop system design canvas to sketch software architecture, export diagrams, and manage icon libraries directly in your browser.",
      },
      {
        property: "og:title",
        content:
          "ZeroSketch | A high level system design tool | Open Source & Free to use",
      },
      {
        property: "og:description",
        content:
          "Interactive drag & drop system design canvas to sketch software architecture, export diagrams, and manage icon libraries directly in your browser.",
      },
      {
        property: "og:url",
        content: `${APP_URL}/`,
      },
    ],
    links: [
      {
        rel: "canonical",
        href: `${APP_URL}/`,
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
  const libraryRegistry = useMemo(() => {
    return new LibraryRegistry({ url: LIBRARY_URL });
  }, []);

  return (
    <>
      <h1 className="sr-only">ZeroSketch System Design Canvas</h1>
      <Canvas libraryRegistry={libraryRegistry} canvasState={canvasState} />
    </>
  );
}
