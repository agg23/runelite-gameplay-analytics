import { RouterProvider } from "@tanstack/react-router";
import { ErrorBoundary } from "react-error-boundary";

import { router } from "./routes";

import "./App.css";

export const App = () => {
  return (
    <ErrorBoundary fallback={<div>A global error occured</div>}>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
};
