import { createContext, useContext } from 'react';

export interface HighlightContextValue {
  highlight: string | null;
  setHighlight: (text: string | null) => void;
  clearHighlight: () => void;
}

export const HighlightContext = createContext<HighlightContextValue | null>(null);

// IMPORTANT:
// Split the context so Details page (does not use the value) does not re-render on highlight changes
export const HighlightSetterContext = createContext<{
  setHighlight: (text: string | null) => void;
  clearHighlight: () => void;
} | null>(null);

export const HighlightValueContext = createContext<string | null>(null);

export const useHighlight = () => {
  const context = useContext(HighlightContext);
  if (!context) {
    throw new Error('useHighlight must be used within a HighlightProvider');
  }
  return context;
};

export const useHighlightSetter = () => {
  const context = useContext(HighlightSetterContext);
  if (!context) {
    throw new Error('useHighlightSetter must be used within a HighlightProvider');
  }
  return context;
};

export const useHighlightValue = () => {
  const context = useContext(HighlightValueContext);
  if (context === undefined) {
    throw new Error('useHighlightValue must be used within a HighlightProvider');
  }
  return context;
};
