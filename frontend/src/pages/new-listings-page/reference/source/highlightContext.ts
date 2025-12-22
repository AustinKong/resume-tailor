import { createContext, useContext } from 'react';

export interface HighlightContextValue {
  highlight: string | null;
  setHighlight: (text: string | null) => void;
  clearHighlight: () => void;
}

export const HighlightContext = createContext<HighlightContextValue | null>(null);

export const useHighlight = () => {
  const context = useContext(HighlightContext);
  if (!context) {
    throw new Error('useHighlight must be used within a HighlightProvider');
  }
  return context;
};