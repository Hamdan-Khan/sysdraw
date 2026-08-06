import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { SITE_URL } from "../constants";
import { jsonLdSchema } from "../data/jsonLd";
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
        title:
          "ZeroSketch | System Design for Everyone | Open Source & Free to use",
      },
      {
        name: "title",
        content:
          "ZeroSketch | System Design for Everyone | Open Source & Free to use",
      },
      {
        name: "description",
        content:
          "Free and open-source system design diagramming tool with zero-friction drag & drop canvas, custom icon libraries, and high-level system architecture sketching.",
      },
      {
        name: "theme-color",
        content: "#ffffff",
      },
      {
        name: "referrer",
        content: "origin",
      },
      // open graph
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:site_name",
        content: "ZeroSketch",
      },
      {
        property: "og:locale",
        content: "en_US",
      },
      {
        property: "og:url",
        content: SITE_URL,
      },
      {
        property: "og:title",
        content:
          "ZeroSketch | System Design for Everyone | Open Source & Free to use",
      },
      {
        property: "og:description",
        content:
          "Free and open-source system design diagramming tool with zero-friction drag & drop canvas, custom icon libraries, and high-level system architecture sketching.",
      },
      {
        property: "og:image",
        content: `${SITE_URL}/og-image.png`,
      },
      {
        property: "og:image:width",
        content: "1200",
      },
      {
        property: "og:image:height",
        content: "630",
      },
      {
        property: "og:image:alt",
        content: "ZeroSketch | Open-Source System Design Diagramming Tool",
      },
      // Twitter
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:title",
        content:
          "ZeroSketch | System Design for Everyone | Open Source & Free to use",
      },
      {
        name: "twitter:description",
        content:
          "Free and open-source system design diagramming tool with zero-friction drag & drop canvas, custom icon libraries, and high-level system architecture sketching.",
      },
      {
        name: "twitter:image",
        content: `${SITE_URL}/og-image.png`,
      },
      {
        name: "twitter:image:alt",
        content: "ZeroSketch | Open-Source System Design Diagramming Tool",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: `${SITE_URL}/`,
      },
      {
        rel: "icon",
        href: "/favicon.ico",
        sizes: "any",
      },
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/logo.svg",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "192x192",
        href: "/android-chrome-192x192.png",
      },
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
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(jsonLdSchema),
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
