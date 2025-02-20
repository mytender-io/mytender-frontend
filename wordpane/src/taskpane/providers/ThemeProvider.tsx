import React from "react";
import { createTheme, ThemeProvider as MUIThemeProvider } from "@mui/material/styles";

const ThemeProvider = ({ children }) => {
  const theme = createTheme({
    palette: {
      primary: {
        main: "#F5861999",
      },
      grey: {
        "100": "#D3D3D3",
      },
    },
    typography: {
      button: {
        textTransform: "none",
      },
      fontFamily: "calc(--font-family)",
      subtitle1: {
        color: "#F5861999",
        fontSize: "14px",
      },
      body1: {
        fontSize: "14px",
      },
    },
    components: {
      MuiMenuItem: {
        styleOverrides: {
          root: {
            fontSize: "13px",
            minHeight: "36px",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            "&.MuiButton-root.Mui-disabled": {
              borderColor: "#F4F4F4",
              color: "#C2C2C2",
            },
            "&.MuiButton-colorInfo": {
              backgroundColor: "#F4F4F4",
              color: "#000000",
              borderColor: "#C2C2C2",
            },
            "&.MuiButton-colorInherit": {
              borderColor: "#C2C2C2",
            },
          },
          sizeSmall: {
            fontSize: "10px",
          },
          sizeMedium: {
            fontSize: "13px",
            padding: "3px 8px",
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          sizeSmall: {
            fontSize: "12px",
            padding: "3px",
          },
          sizeMedium: {
            fontSize: "15px",
            padding: "3px 10px",
          },
        },
      },
      MuiSvgIcon: {
        styleOverrides: {
          root: {
            fontSize: "18px",
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            paddingLeft: "3px",
            paddingRight: "3px",
            minWidth: "60px",
            fontSize: "0.75rem",
          },
        },
      },
      MuiAutocomplete: {
        styleOverrides: {
          listbox: {
            "& > MuiAutocomplete-option": {
              minHeight: "20px",
            },
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          inputSizeSmall: {
            fontSize: "10px",
          },
        },
      },
    },
  });

  return <MUIThemeProvider theme={theme}>{children}</MUIThemeProvider>;
};

export default ThemeProvider;
