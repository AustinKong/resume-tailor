import { useDialog } from '@chakra-ui/react';
import { type ReactNode, useCallback, useMemo, useState } from 'react';

import { IngestionContext, type IngestionScrapeData } from './ingestionContext';

export function IngestionProvider({ children }: { children: ReactNode }) {
  const dialog = useDialog();
  const [context, setContext] = useState<IngestionScrapeData | null>(null);

  const open = useCallback(
    (data?: IngestionScrapeData) => {
      setContext(data ?? null);
      dialog.setOpen(true);
    },
    [dialog]
  );

  const close = useCallback(() => {
    dialog.setOpen(false);
    setContext(null);
  }, [dialog]);

  const value = useMemo(
    () => ({
      open,
      close,
      context,
      dialog,
    }),
    [open, close, context, dialog]
  );

  return <IngestionContext.Provider value={value}>{children}</IngestionContext.Provider>;
}
