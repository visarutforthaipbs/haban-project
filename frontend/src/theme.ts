import { extendTheme, ThemeConfig } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";
import type { StyleFunctionProps } from "@chakra-ui/styled-system";

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  colors: {
    brand: {
      50: "#E6F6F4",
      100: "#B3E4E0",
      200: "#80D2CC",
      300: "#4DC0B8",
      400: "#1AAEA4",
      500: "#009688", // Primary Teal
      600: "#007A6E",
      700: "#005D54",
      800: "#00403A",
      900: "#002320",
    },
    orange: {
      50: "#FFF4E6",
      100: "#FFE4BF",
      200: "#FFD399",
      300: "#FFC273",
      400: "#FFB14D",
      500: "#FF8C42", // Primary Orange
      600: "#FF6B1C",
      700: "#F54D00",
      800: "#CC4000",
      900: "#A33300",
    },
    neutral: {
      50: "#FFF4E6", // Soft Cream
      100: "#F9EAD7",
      200: "#F2E0C8",
      300: "#ECD6B9",
      400: "#E8D8C4", // Muted Sand
      500: "#D4C4B0",
      600: "#C0B09C",
      700: "#AC9C88",
      800: "#988874",
      900: "#847460",
    },
    gray: {
      50: "#F7F7F7",
      100: "#E6E6E6",
      200: "#D4D4D4",
      300: "#C1C1C1",
      400: "#AFAFAF",
      500: "#9C9C9C",
      600: "#787878",
      700: "#555555",
      800: "#333333", // Deep Charcoal
      900: "#111111",
    },
  },
  fonts: {
    heading: '"Prompt", sans-serif',
    body: '"Prompt", sans-serif',
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: "500",
        borderRadius: "lg",
      },
      variants: {
        solid: (props: StyleFunctionProps) => ({
          bg:
            props.colorScheme === "orange"
              ? "orange.500"
              : mode("brand.500", "brand.200")(props),
          color: "white",
          _hover: {
            bg:
              props.colorScheme === "orange"
                ? "orange.600"
                : mode("brand.600", "brand.300")(props),
          },
        }),
        outline: (props: StyleFunctionProps) => ({
          borderColor:
            props.colorScheme === "orange"
              ? "orange.500"
              : mode("brand.500", "brand.200")(props),
          color:
            props.colorScheme === "orange"
              ? "orange.500"
              : mode("brand.500", "brand.200")(props),
          _hover: {
            bg:
              props.colorScheme === "orange"
                ? "orange.50"
                : mode("brand.50", "brand.900")(props),
          },
        }),
        ghost: (props: StyleFunctionProps) => ({
          color:
            props.colorScheme === "orange"
              ? "orange.500"
              : mode("brand.500", "brand.200")(props),
          _hover: {
            bg:
              props.colorScheme === "orange"
                ? "orange.50"
                : mode("brand.50", "brand.900")(props),
          },
        }),
      },
      defaultProps: {
        colorScheme: "brand",
      },
    },
    Text: {
      baseStyle: {
        color: "gray.800",
        lineHeight: "tall",
      },
    },
    Heading: {
      baseStyle: {
        color: "gray.800",
        fontWeight: "500",
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: "lg",
          overflow: "hidden",
          bg: "white",
          borderColor: "neutral.200",
          boxShadow: "sm",
          transition: "all 0.2s",
          _hover: {
            boxShadow: "md",
            transform: "translateY(-2px)",
          },
        },
      },
    },
    Badge: {
      baseStyle: {
        borderRadius: "md",
      },
      variants: {
        solid: (props: StyleFunctionProps) => ({
          bg:
            props.colorScheme === "orange"
              ? "orange.500"
              : mode("brand.500", "brand.200")(props),
          color: "white",
        }),
        outline: (props: StyleFunctionProps) => ({
          borderColor:
            props.colorScheme === "orange"
              ? "orange.500"
              : mode("brand.500", "brand.200")(props),
          color:
            props.colorScheme === "orange"
              ? "orange.500"
              : mode("brand.500", "brand.200")(props),
        }),
      },
    },
  },
  styles: {
    global: (props: StyleFunctionProps) => ({
      body: {
        bg: mode("neutral.50", "gray.900")(props),
        color: "gray.800",
      },
    }),
  },
});

export default theme;
