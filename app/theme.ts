// theme.ts
import { createTheme, PaletteMode } from "@mui/material";

export const getTheme = (mode: PaletteMode) =>
  createTheme({
    palette: {
      mode,
      ...(mode === "light"
        ? {
            // 🌞 LIGHT MODE
            primary: {
              main: "#2563eb", // blue-600
            },
            secondary: {
              main: "#7c3aed", // violet-600
            },
            background: {
              default: "#f8fafc", // slate-50
              paper: "#ffffff",
            },
            text: {
              primary: "#0f172a", // slate-900
              secondary: "#475569", // slate-600
            },
          }
        : {
            // 🌙 DARK MODE (blue-gray aesthetic)
            primary: {
              main: "#60a5fa", // blue-400
            },
            secondary: {
              main: "#a78bfa", // violet-400
            },
            background: {
              default: "#0f172a", // deep blue-gray (NOT pure black)
              paper: "#182135",   // slightly lighter panel
            },
            text: {
              primary: "#e2e8f0", // slate-200
              secondary: "#94a3b8", // slate-400
            },
          }),
    },

    shape: {
      borderRadius: 12,
    },

    typography: {
      fontFamily: `"Roboto", "Inter", "Helvetica", "Arial", sans-serif`,
      h1: { fontWeight: 700 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 600 },
      button: {
        textTransform: "none", // cleaner buttons
        fontWeight: 600,
      },
    },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            transition: "background-color 0.2s ease, color 0.2s ease",
          },
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none", // removes weird gradients in dark mode
          },
        },
      },

      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            padding: "8px 16px",
          },
        },
      },

      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
          },
        },
      },

      MuiAppBar: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor:
              theme.palette.mode === "dark"
                ? "#111827"
                : theme.palette.primary.main,
            boxShadow: "none",
            borderBottom:
              theme.palette.mode === "dark"
                ? "1px solid rgba(255,255,255,0.08)"
                : "none",
          }),
        },
      },
    },
  });