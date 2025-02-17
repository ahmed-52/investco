import * as React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import type { ThemeOptions, Shadows } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

interface AppThemeProps {
  children: React.ReactNode;
  disableCustomTheme?: boolean;
  themeComponents?: ThemeOptions["components"];
}

export default function AppTheme(props: AppThemeProps) {
  const { children, disableCustomTheme, themeComponents } = props;

  const theme = React.useMemo(() => {
    return disableCustomTheme
      ? createTheme()
      : createTheme({
          palette: {
            mode: "light",
            primary: {
              main: "#1976d2",
            },
            secondary: {
              main: "#dc004e",
            },
            background: {
              default: "#f4f6f8",
              paper: "#ffffff",
            },
          },
          typography: {
            fontFamily: "Roboto, Arial, sans-serif",
            body1: {
              fontSize: "1rem",
            },
            body2: {
              fontSize: "0.875rem",
            },
          },
          shape: {
            borderRadius: 8,
          },
          shadows: [
            "none",
            "0px 2px 4px rgba(0,0,0,0.1)",
            "0px 3px 5px rgba(0,0,0,0.12)",
            "0px 4px 6px rgba(0,0,0,0.15)",
            "0px 5px 8px rgba(0,0,0,0.2)",
            "0px 6px 10px rgba(0,0,0,0.25)",
            "0px 7px 12px rgba(0,0,0,0.3)",
            "0px 8px 14px rgba(0,0,0,0.35)",
            "0px 9px 16px rgba(0,0,0,0.4)",
            "0px 10px 18px rgba(0,0,0,0.45)",
            "0px 11px 20px rgba(0,0,0,0.5)",
            "0px 12px 22px rgba(0,0,0,0.55)",
            "0px 13px 24px rgba(0,0,0,0.6)",
            "0px 14px 26px rgba(0,0,0,0.65)",
            "0px 15px 28px rgba(0,0,0,0.7)",
            "0px 16px 30px rgba(0,0,0,0.75)",
            "0px 17px 32px rgba(0,0,0,0.8)",
            "0px 18px 34px rgba(0,0,0,0.85)",
            "0px 19px 36px rgba(0,0,0,0.9)",
            "0px 20px 38px rgba(0,0,0,0.95)",
            "0px 21px 40px rgba(0,0,0,1)",
            "0px 22px 42px rgba(0,0,0,1)",
            "0px 23px 44px rgba(0,0,0,1)",
            "0px 24px 46px rgba(0,0,0,1)",
            "0px 25px 48px rgba(0,0,0,1)",
          ] as Shadows, // Explicitly set as Shadows type
          components: {
            ...themeComponents,
          },
        });
  }, [disableCustomTheme, themeComponents]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
