'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DataRow {
  [key: string]: string | number | null | undefined;
}

interface DataContextType {
  data: DataRow[];
  setData: (data: DataRow[]) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<DataRow[]>([]);

  return (
    <DataContext.Provider value={{ data, setData }}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
};
