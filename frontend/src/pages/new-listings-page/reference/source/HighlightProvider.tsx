import { type ReactNode, useCallback, useMemo, useState } from 'react';

import { HighlightContext } from './highlightContext';

export function HighlightProvider({ children }: { children: ReactNode }) {
  const [highlight, setHighlightState] = useState<string | null>(null);

  const setHighlight = useCallback((text: string | null) => {
    setHighlightState(text);
  }, []);

  const clearHighlight = useCallback(() => {
    setHighlightState(null);
  }, []);

  const value = useMemo(
    () => ({
      highlight,
      setHighlight,
      clearHighlight,
    }),
    [highlight, setHighlight, clearHighlight]
  );

  return <HighlightContext.Provider value={value}>{children}</HighlightContext.Provider>;
}