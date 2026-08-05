import { Navbar } from "@/components/navbar/Navbar";
import { APP_URL, GITHUB_LIBRARY_REPO_URL, LIBRARY_URL } from "@/lib/constants";
import { Link } from "@cloudflare/kumo";
import { createFileRoute } from "@tanstack/react-router";
import { LibraryRegistry, LibraryRegistryProvider } from "@zero-sketch/models";
import { useMemo } from "react";
import { CommunityLibrariesSection } from "../components/libraries/CommunityLibrariesSection";
import { LocalLibrariesSection } from "../components/libraries/LocalLibrariesSection";

export const Route = createFileRoute("/libraries")({
  component: LibrariesPageComponent,
  head: () => ({
    meta: [
      {
        title: "Libraries | ZeroSketch Canvas",
      },
      {
        name: "title",
        content: "Libraries | ZeroSketch Canvas",
      },
      {
        name: "description",
        content:
          "Browse official cloud architecture icon sets, contribute official icon libraries, or build custom offline SVG packs in your browser.",
      },
      {
        property: "og:title",
        content: "Icon Libraries | ZeroSketch Canvas",
      },
      {
        property: "og:description",
        content:
          "Browse official cloud architecture icon sets, contribute official icon libraries, or build custom offline SVG packs in your browser.",
      },
      {
        property: "og:url",
        content: `${APP_URL}/libraries`,
      },
      {
        name: "twitter:title",
        content: "Icon Libraries | ZeroSketch Canvas",
      },
      {
        name: "twitter:description",
        content:
          "Browse official cloud architecture icon sets, contribute official icon libraries, or build custom offline SVG packs in your browser.",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: `${APP_URL}/libraries`,
      },
    ],
  }),
});

function LibrariesPageComponent() {
  const registry = useMemo(() => {
    return new LibraryRegistry({ url: LIBRARY_URL });
  }, []);

  return (
    <LibraryRegistryProvider registry={registry}>
      <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white isolate">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
          <div className="space-y-2 border-b border-neutral-300 pb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-black tracking-tight">
              ZeroSketch Libraries
            </h1>

            <p className="text-neutral-600 leading-relaxed">
              Browse official cloud architecture icon sets, build offline custom
              SVG icon packs in your browser, or submit a library by creating a{" "}
              <Link
                href={GITHUB_LIBRARY_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Pull Request on GitHub <Link.ExternalIcon />
              </Link>
            </p>
          </div>

          <CommunityLibrariesSection />

          <LocalLibrariesSection />
        </main>
      </div>
    </LibraryRegistryProvider>
  );
}
