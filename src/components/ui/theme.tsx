import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    custom: {
      lighter: string;
    };
  }
  interface PaletteOptions {
    custom?: {
      lighter: string;
    };
  }
}

const orangeColors = {
  main: "#FF8019",
  light: "#FF8F29",
  lighter: "#FFF0E6",
  hover: "rgba(255, 179, 102, 0.2)",
  active: "#ff9933",
  dark: "#ff8000",
  contrastText: "#000000"
};

const theme = createTheme({
  palette: {
    primary: {
      main: orangeColors.main,
      light: orangeColors.light,
      dark: orangeColors.dark,
      contrastText: orangeColors.contrastText
    },
    action: {
      hover: orangeColors.hover,
      selected: orangeColors.light
    },
    custom: {
      lighter: orangeColors.lighter
    }
  },
  components: {
    MuiTabs: {
      styleOverrides: {
        root: {
          "& .MuiTabs-indicator": {
            backgroundColor: `${orangeColors.main} !important`
          },
          "& .MuiTab-root": {
            textTransform: "none",
            minHeight: "48px",
            padding: "12px 24px",
            color: "#6B7280",
            opacity: 1,
            "&.Mui-selected": {
              color: "#000000"
            },
            "&:hover": {
              color: `${orangeColors.main} !important`,
              backgroundColor: `${orangeColors.lighter} !important`, // Changed from light to lighter
              ".lucide": {
                color: `${orangeColors.main} !important`
              }
            },
            "&:active": {
              backgroundColor: orangeColors.hover
            },
            "& .MuiTouchRipple-root": {
              color: `${orangeColors.main} !important`
            }
          }
        },
        indicator: {
          backgroundColor: `${orangeColors.main} !important`
        },
        flexContainer: {
          "& .MuiButtonBase-root": {
            "&:hover .lucide": {
              color: `${orangeColors.main} !important`
            }
          }
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          "&.MuiButtonBase-root": {
            opacity: 1,
            minHeight: "56px",
            "&.Mui-selected": {
              color: "#000000"
            },
            "&:hover": {
              color: `${orangeColors.main} !important`,
              backgroundColor: `${orangeColors.lighter} !important` // Changed from light to lighter
            }
          }
        }
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          padding: "4px",
          color: "#6B7280",
          "&:hover": {
            backgroundColor: `${orangeColors.light} !important`,
            color: `${orangeColors.main} !important`,
            "& .MuiSvgIcon-root": {
              color: `${orangeColors.main} !important`
            }
          },
          "&:active": {
            backgroundColor: orangeColors.hover
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: "Manrope",
          "&:hover": {
            backgroundColor: orangeColors.light
          },
          "&.Mui-selected": {
            backgroundColor: orangeColors.light
          }
        },
        contained: {
          backgroundColor: orangeColors.main,
          "&:hover": {
            backgroundColor: orangeColors.dark
          }
        },
        outlined: {
          borderColor: orangeColors.main,
          color: orangeColors.main,
          "&:hover": {
            borderColor: orangeColors.dark,
            backgroundColor: orangeColors.lighter
          }
        },
        text: {
          color: orangeColors.main,
          "&:hover": {
            backgroundColor: orangeColors.lighter
          }
        }
      }
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: orangeColors.main,
          "&.Mui-checked": {
            color: orangeColors.main
          }
        }
      }
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: orangeColors.main,
          "&.Mui-checked": {
            color: orangeColors.main
          }
        }
      }
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          "&.Mui-checked": {
            color: orangeColors.main,
            "& + .MuiSwitch-track": {
              backgroundColor: orangeColors.main
            }
          }
        }
      }
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: orangeColors.main
        }
      }
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: orangeColors.light
        },
        bar: {
          backgroundColor: orangeColors.main
        }
      }
    }
  }
});

export default theme;
