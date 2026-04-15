"use client";
import React from 'react';
import { Provider as ChakraUIProvider } from '@/components/ui/provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthLocalStorageInitializer } from '@/components/AuthLocalStorageInitializer';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <ChakraUIProvider>
      <AuthLocalStorageInitializer />
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ChakraUIProvider>
  );
}
