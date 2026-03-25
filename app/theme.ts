// theme.ts
import { createTheme, PaletteMode } from "@mui/material";

export const getTheme = (mode: PaletteMode) =>
  createTheme({
    palette: {
      mode,
      ...(mode === "light"
        ? {
            // LIGHT MODE (Tailwind Slate/Blue/Indigo vibes)
            primary: { 
              main: "#2563eb", // blue-600
              light: "#60a5fa",
              dark: "#1d4ed8",
              contrastText: "#ffffff",
            },
            secondary: { 
              main: "#7c3aed", // violet-600
              light: "#a78bfa",
              dark: "#5b21b6",
              contrastText: "#ffffff",
            },
            error: { 
              main: "#ef4444", // red-500
              light: "#fecaca",
              dark: "#b91c1c",
            },
            warning: { 
              main: "#f59e0b", // amber-500
              light: "#fef3c7",
              dark: "#b45309",
            },
            info: { 
              main: "#0ea5e9", // sky-500
              light: "#e0f2fe",
              dark: "#0369a1",
            },
            success: { 
              main: "#10b981", // emerald-500
              light: "#d1fae5",
              dark: "#047857",
            },
            divider: "#e2e8f0", // slate-200
            background: {
              default: "#f8fafc", // slate-50
              paper: "#ffffff",
            },
            text: {
              primary: "#0f172a", // slate-900
              secondary: "#475569", // slate-600
              disabled: "#94a3b8",
            },
          }
        : {
            // DARK MODE (Deep Navy/Slate)
            primary: { 
              main: "#60a5fa", // blue-400
              light: "#93c5fd",
              dark: "#2563eb",
              contrastText: "#0f172a",
            },
            secondary: { 
              main: "#a78bfa", // violet-400
              light: "#c4b5fd",
              dark: "#7c3aed",
            },
            error: { 
              main: "#f87171", // red-400
              dark: "#991b1b",
            },
            warning: { 
              main: "#fbbf24", // amber-400
              dark: "#78350f",
            },
            info: { 
              main: "#38bdf8", // sky-400
              dark: "#0c4a6e",
            },
            success: { 
              main: "#34d399", // emerald-400
              dark: "#064e3b",
            },
            divider: "#334155", // slate-700
            background: {
              default: "#070b1d", // slate-950 (very deep dark)
              paper: "#0f172a",   // slate-900
            },
            text: {
              primary: "#f1f5f9", // slate-100
              secondary: "#94a3b8", // slate-400
              disabled: "#475569",
            },
          }),
    },

    shape: {
      borderRadius: 12,
    },

    typography: {
      fontFamily: 'var(--font-geist-sans), Inter, Roboto, sans-serif',
      h1: { fontSize: "2.5rem", fontWeight: 700, letterSpacing: "-0.02em" },
      h2: { fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.02em" },
      h3: { fontSize: "1.5rem", fontWeight: 600, letterSpacing: "-0.01em" },
      body1: { lineHeight: 1.6 },
      button: {
        textTransform: "none",
        fontWeight: 600,
      },
    },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            transition: "background-color 0.2s ease, color 0.2s ease",
            scrollbarWidth: "thin",
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: mode === "light" ? "#cbd5e1" : "#334155",
              borderRadius: "8px",
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none", 
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: false,
        },
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: "8px 10px",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: mode === "light" 
              ? "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)"
              : "0 10px 15px -3px rgb(0 0 0 / 0.4)",
          },
        },
      },
    },
  });