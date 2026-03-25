"use client";

import { ThemeProvider, CssBaseline, StyledEngineProvider } from "@mui/material";
import { useMemo, useState, useEffect } from "react";
import { getTheme } from "./theme";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<"light" | "dark">("dark");

  useEffect(() => {
    // 2. This ONLY runs on the client
    const saved = localStorage.getItem("theme-mode") as "light" | "dark" | null;
    if (saved) {
      setMode(saved);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setMode(prefersDark ? "dark" : "light");
    }
  }, []);

  // Update storage when mode changes
  useEffect(() => {
    localStorage.setItem("theme-mode", mode);
  }, [mode]);

  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </StyledEngineProvider>
  );
}