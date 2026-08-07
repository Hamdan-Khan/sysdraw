import { QueryClientProvider } from "@tanstack/react-query";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import appCss from "../index.css?url";
import { APP_URL } from "../lib/constants";
import { queryClient } from "../lib/queryClient";

const DESCRIPTION =
  "Interactive drag & drop system design canvas with customizable icon packs, to sketch software architecture, export diagrams, and manage icon libraries directly in your browser.";

const webAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "@id": `${APP_URL}/#webapp`,
  name: "ZeroSketch Canvas",
  url: APP_URL,
  applicationCategory: "DesignApplication",
  operatingSystem: "All",
  browserRequirements: "Requires JavaScript. Requires HTML5 Canvas.",
  isAccessibleForFree: true,
  description: DESCRIPTION,
};

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content:
          "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover, shrink-to-fit=no",
      },
      {
        name: "referrer",
        content: "origin",
      },
      {
        name: "mobile-web-app-capable",
        content: "yes",
      },
      {
        name: "apple-mobile-web-app-capable",
        content: "yes",
      },
      {
        name: "apple-mobile-web-app-status-bar-style",
        content: "default",
      },
      {
        name: "apple-mobile-web-app-title",
        content: "ZeroSketch",
      },
      {
        name: "application-name",
        content: "ZeroSketch Canvas",
      },
      {
        name: "theme-color",
        content: "#ffffff",
      },
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
        content: DESCRIPTION,
      },
      // Open Graph / Web App
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:site_name",
        content: "ZeroSketch Canvas",
      },
      {
        property: "og:locale",
        content: "en_US",
      },
      {
        property: "og:url",
        content: APP_URL,
      },
      {
        property: "og:title",
        content:
          "ZeroSketch | A high level system design tool | Open Source & Free to use",
      },
      {
        property: "og:description",
        content: DESCRIPTION,
      },
      {
        property: "og:image",
        content: `${APP_URL}/og-image.png`,
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
        content: "ZeroSketch Web Application Canvas Workspace",
      },
      // Twitter Card
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:title",
        content:
          "ZeroSketch | A high level system design tool | Open Source & Free to use",
      },
      {
        name: "twitter:description",
        content: DESCRIPTION,
      },
      {
        name: "twitter:image",
        content: `${APP_URL}/og-image.png`,
      },
      {
        name: "twitter:image:alt",
        content: "ZeroSketch Web Application Canvas Workspace",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: `${APP_URL}/`,
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
        children: JSON.stringify(webAppJsonLd),
      },
    ],
  }),
  component: RootComponent,
  notFoundComponent: () => (
    <div className="flex h-screen w-screen items-center justify-center text-slate-500 font-sans">
      404 - Page Not Found
    </div>
  ),
});

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootDocument>
        <Outlet />
      </RootDocument>
    </QueryClientProvider>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <noscript>You need to enable JavaScript to run this app.</noscript>
        <header>
          <h1 className="sr-only">ZeroSketch</h1>
        </header>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
