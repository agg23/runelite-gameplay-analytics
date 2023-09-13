import {
  QueryFunction,
  QueryKey,
  UseQueryOptions,
  useQuery as useReactQuery,
} from "react-query";

export const useQuery = <
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>(
  queryKey: TQueryKey,
  queryFn: QueryFunction<TQueryFnData, TQueryKey>,
  options?: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>
) => {
  return useReactQuery<TQueryFnData, TError, TData, TQueryKey>({
    refetchInterval: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    ...options,
    queryKey,
    queryFn,
  });
};
