import { RouterProvider } from "@tanstack/react-router";
import { ErrorBoundary } from "react-error-boundary";
import { QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";

import { router } from "./routes";

import "./App.css";
import { queryClient } from "./api/query";

export const App = () => {
  return (
    <ErrorBoundary fallback={<div>A global error occured</div>}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
};
