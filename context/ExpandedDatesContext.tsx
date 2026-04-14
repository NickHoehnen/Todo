'use client';

import { createContext, useContext, useState, useCallback, useMemo } from "react";

interface ExpansionContextType {
  expandedDates: Set<string>;
  toggleDate: (date: string) => void;
  setExpandedDates: (dates: Set<string>) => void;
}

const ExpansionContext = createContext<ExpansionContextType | undefined>(undefined);

export function ExpandedDatesProvider({ children }: { children: React.ReactNode }) {
  const [expandedDates, setExpandedDatesState] = useState<Set<string>>(new Set());

  // Toggles a single date
  const toggleDate = useCallback((date: string) => {
    setExpandedDatesState(prev => {
      const newSet = new Set(prev);
      if (newSet.has(date)) newSet.delete(date);
      else newSet.add(date);
      return newSet;
    });
  }, []);

  const setExpandedDates = useCallback((dates: Set<string>) => {
    setExpandedDatesState(dates);
  }, []);

  const contextValue = useMemo(() => ({
    expandedDates,
    toggleDate,
    setExpandedDates,
  }), [expandedDates, toggleDate, setExpandedDates]);

  return (
    <ExpansionContext.Provider value={contextValue}>
      {children}
    </ExpansionContext.Provider>
  );
}

export const useExpansion = () => {
  const context = useContext(ExpansionContext);
  if (!context) {
    throw new Error("useExpansion must be used within ExpandedDatesProvider");
  }
  return context;
};