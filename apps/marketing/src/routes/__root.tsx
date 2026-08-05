import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, shrink-to-fit=no",
      },
      {
        title: "ZeroSketch | System Design for Everyone | Free to use",
      },
      {
        name: "title",
        content: "ZeroSketch | System Design for Everyone | Free to use",
      },
      {
        name: "description",
        content:
          "ZeroSketch is a free and open-source system design diagramming tool with zero-friction drag & drop, custom icon libraries, and high-level system architecture sketching.",
      },
      {
        name: "referrer",
        content: "origin",
      },
    ],
    links: [
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png",
      },
      {
        rel: "manifest",
        href: "/site.webmanifest",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="bg-bg text-text font-sans antialiased">
        <h1 className="sr-only">
          ZeroSketch | System Design for Everyone | Open source system design
          diagramming tool
        </h1>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
