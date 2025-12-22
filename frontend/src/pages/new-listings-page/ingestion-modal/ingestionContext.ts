import { useDialog } from '@chakra-ui/react';
import { createContext, useContext } from 'react';

export interface IngestionScrapeData {
  id: string;
  url: string;
}

export interface IngestionContextValue {
  open: (data?: IngestionScrapeData) => void;
  close: () => void;
  context: IngestionScrapeData | null;
  dialog: ReturnType<typeof useDialog>;
}

export const IngestionContext = createContext<IngestionContextValue | null>(null);

export const useIngestion = () => {
  const context = useContext(IngestionContext);
  if (!context) {
    throw new Error('useIngestion must be used within an IngestionProvider');
  }
  return context;
};
