import { QueryClientProvider } from "@tanstack/react-query";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import appCss from "../index.css?url";
import { queryClient } from "../lib/queryClient";

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
        name: "apple-mobile-web-app-title",
        content: "ZeroSketch",
      },
      {
        title: "ZeroSketch | System Design Canvas",
      },
      {
        name: "title",
        content: "ZeroSketch | A high level system design tool | Free to use",
      },
      {
        name: "description",
        content:
          "ZeroSketch is a free, high level system design diagramming tool that lets you easily create software architecture diagrams.",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
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
        <Toaster richColors position="top-right" />
        <Scripts />
      </body>
    </html>
  );
}
