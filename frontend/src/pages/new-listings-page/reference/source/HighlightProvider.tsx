import { type ReactNode, useCallback, useMemo, useState } from 'react';

import {
  HighlightContext,
  HighlightSetterContext,
  HighlightValueContext,
} from './highlightContext';

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

  const setterValue = useMemo(
    () => ({
      setHighlight,
      clearHighlight,
    }),
    [setHighlight, clearHighlight]
  );

  return (
    <HighlightContext.Provider value={value}>
      <HighlightSetterContext.Provider value={setterValue}>
        <HighlightValueContext.Provider value={highlight}>
          {children}
        </HighlightValueContext.Provider>
      </HighlightSetterContext.Provider>
    </HighlightContext.Provider>
  );
}
