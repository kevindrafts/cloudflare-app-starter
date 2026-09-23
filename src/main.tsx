import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  Link,
  lazyRouteComponent,
} from "@tanstack/react-router";
import { Shell } from "./components/Shell";
import { applyPreferences, readPreferences } from "./lib/preferences";
import "./styles.css";
applyPreferences(readPreferences());
const rootRoute = createRootRoute({
  component: Shell,
  notFoundComponent: () => (
    <div className="py-16">
      <p className="eyebrow mb-4">404 · A little off track</p>
      <h1 className="page-heading">This page doesn’t live here.</h1>
      <Link to="/" className="inline-block underline mt-6">
        Back to your workspace
      </Link>
    </div>
  ),
  errorComponent: ({ reset }) => (
    <div role="alert">
      <h1 className="page-heading">Something went wrong.</h1>
      <button onClick={reset} className="underline mt-4">
        Try again
      </button>
    </div>
  ),
});
const routeTree = rootRoute.addChildren([
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: lazyRouteComponent(() => import("./pages/Projects"), "Overview"),
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/projects",
    component: lazyRouteComponent(() => import("./pages/Projects"), "Projects"),
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/settings",
    component: lazyRouteComponent(() => import("./pages/Settings"), "Settings"),
  }),
]);
const router = createRouter({ routeTree });
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
const client = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 15000, retry: 1, refetchOnWindowFocus: false },
  },
});
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
);
