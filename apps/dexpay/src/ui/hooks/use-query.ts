import {
  useQuery as useReactQuery,
  useMutation as useReactMutation,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';

// Helper types
type AnyFunction = (...args: any[]) => any;
type InferParams<T> = T extends (...args: infer P) => any ? P : never;
type InferResponse<T> = T extends (...args: infer P) => Promise<infer R>
  ? R
  : never;

// Enhanced useQuery hook
export function useQuery<TService extends AnyFunction>(
  serviceMethod: TService,
  params?: InferParams<TService> | InferParams<TService>[0],
  options?: Omit<
    UseQueryOptions<InferResponse<TService>>,
    'queryKey' | 'queryFn'
  >,
) {
  // Create query key from service method name and params
  const queryKey = [serviceMethod.toString(), params];
  const queryFn = () =>
    serviceMethod(...(Array.isArray(params) ? params : [params]));

  return useReactQuery({
    queryKey,
    queryFn,
    ...options,
  });
}

// Enhanced useMutation hook
export function useMutation<TService extends AnyFunction>(
  serviceMethod: TService,
  options?: Omit<
    UseMutationOptions<InferResponse<TService>, Error, InferParams<TService>>,
    'mutationFn'
  >,
) {
  return useReactMutation({
    mutationFn: (params) =>
      serviceMethod(...(Array.isArray(params) ? params : [params])),
    ...options,
  });
}
