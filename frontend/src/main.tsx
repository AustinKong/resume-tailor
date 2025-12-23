import './index.css';

import { LocaleProvider } from '@chakra-ui/react';
import { Mutation, MutationCache, Query, QueryCache, QueryClient } from '@tanstack/react-query';
import {
  type PersistedClient,
  type Persister,
  PersistQueryClientProvider,
} from '@tanstack/react-query-persist-client';
import { del, get, set } from 'idb-keyval';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';

import { Provider as ChakraProvider } from '@/components/ui/provider';
import { toaster } from '@/components/ui/toaster.tsx';

import { App } from './App.tsx';

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

// // DEBUG
// queryClient.getQueryCache().subscribe((event) => {
//   // We only care when data is updated (manual or via fetch)
//   if (event.type === 'updated' && event.action.type === 'success') {
//     const query = event.query;

//     if (query.queryKey[0] === 'listings') {
//       console.log('Cache sync via Subscribe', query.state.data);

//       toaster.create({
//         title: 'DEBUG: Cache Sync',
//         description: `Listings updated (${new Date().toLocaleTimeString()})`,
//         type: 'info',
//         duration: 2000,
//       });
//     }
//   }
// });

const persister: Persister = {
  persistClient: async (client: PersistedClient) => {
    await set('my-app-cache', client);
  },
  restoreClient: async () => {
    return await get('my-app-cache');
  },
  removeClient: async () => {
    await del('my-app-cache');
  },
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            // Only save listings in IndexDB
            const isSuccess = query.state.status === 'success';
            const shouldPersist = query.queryKey[0] === 'listings';

            return isSuccess && shouldPersist;
          },
        },
      }}
      onSuccess={() => toaster.success({ title: 'DEBUG: Cache restored' })}
    >
      <ChakraProvider>
        <LocaleProvider locale="en-US">
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </LocaleProvider>
      </ChakraProvider>
    </PersistQueryClientProvider>
  </StrictMode>
);
