import './index.css';

import { LocaleProvider } from '@chakra-ui/react';
import {
  Mutation,
  MutationCache,
  Query,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';

import { Provider as ChakraProvider } from '@/components/ui/provider';
import { toaster } from '@/components/ui/toaster.tsx';

import App from './App.tsx';

function handleError(
  error: Error,
  owner:
    | Query<unknown, unknown, unknown, readonly unknown[]>
    | Mutation<unknown, unknown, unknown, unknown>
) {
  if (owner?.meta?.suppressErrorToast) {
    return;
  }

  const description = error instanceof Error ? error.message : 'Something went wrong.';

  toaster.error({
    title: 'An error occurred',
    description,
    closable: true,
  });
}

// Add `meta: { suppressErrorToast: true }` to queries/mutations to suppress automatic toasts
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => handleError(error, query),
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _onMutation, mutation) => handleError(error, mutation),
  }),
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ChakraProvider>
        <LocaleProvider locale="en-US">
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </LocaleProvider>
      </ChakraProvider>
    </QueryClientProvider>
  </StrictMode>
);
