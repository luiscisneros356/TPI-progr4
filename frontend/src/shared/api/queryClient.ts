import { QueryClient } from '@tanstack/react-query'

/** Instancia única de TanStack Query (estado del servidor). */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
})
