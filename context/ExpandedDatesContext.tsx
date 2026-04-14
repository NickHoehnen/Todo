'use client'; // 👈 Required for Next.js App Router!

import { createContext, useContext, useState, useCallback, useMemo } from "react";

// The context object
const ExpansionContext = createContext<{ 
  expandedDates: Set<string>; 
  toggleDate: (date: string) => void 
} | undefined>(undefined);

// The Provider component (Renamed for clarity)
export function ExpandedDatesProvider({ children }: { children: React.ReactNode }) {
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  // useCallback prevents this function from being recreated on every render
  const toggleDate = useCallback((date: string) => {
    setExpandedDates(prev => {
      const prevCopy = new Set(prev);
      if (prevCopy.has(date)) prevCopy.delete(date);
      else prevCopy.add(date);
      return prevCopy;
    });
  }, []);

  // useMemo ensures the context value only changes when expandedDates actually changes
  const contextValue = useMemo(() => ({
    expandedDates,
    toggleDate
  }), [expandedDates, toggleDate]);

  return (
    <ExpansionContext.Provider value={contextValue}>
      {children}
    </ExpansionContext.Provider>
  );
}

// The Hook
export const useExpansion = () => {
  const context = useContext(ExpansionContext);
  if (!context) {
    throw new Error("useExpansion must be used within ExpandedDatesProvider");
  }
  return context;
};