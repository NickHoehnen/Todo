"use client";

import { ThemeProvider, CssBaseline, StyledEngineProvider } from "@mui/material";
import { useMemo, useState, useEffect } from "react";
import { getTheme } from "./theme";

export default function Providers({ children }: { children: React.ReactNode }) {
  // We default to "dark" for the initial Server-Side Render
  const [mode, setMode] = useState<"light" | "dark">("dark");

  useEffect(() => {
    // Once we are on the client, check for saved preferences
    const saved = localStorage.getItem("theme-mode") as "light" | "dark" | null;
    if (saved) {
      setMode(saved);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setMode(prefersDark ? "dark" : "light");
    }
  }, []);

  useEffect(() => {
    // Only update local storage if it's different from what's currently there
    const currentSaved = localStorage.getItem("theme-mode");
    if (currentSaved !== mode) {
      localStorage.setItem("theme-mode", mode);
    }
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