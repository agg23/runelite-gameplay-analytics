import { LoadingOverlay } from "@mantine/core";
import { FetchState } from "../../api/types";
import { ErrorBoundary } from "react-error-boundary";

interface LoadingErrorBoundaryProps<T> {
  data: FetchState<T>;
  children: (data: T) => React.ReactNode;
}

export const LoadingErrorBoundary = <T,>({
  data,

  // We'll see if using render props cause problems
  children,
}: LoadingErrorBoundaryProps<T>) => {
  return (
    <ErrorBoundary fallback={<div>An error occured</div>}>
      <LoadingOverlay visible={data.type !== "data"} />
      {data.type === "data" ? children(data.data) : null}
    </ErrorBoundary>
  );
};
