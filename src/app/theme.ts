import { createSystem, defaultConfig } from "@chakra-ui/react";

export const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      colors: {
        turquoise: {
          50: { value: "#e0f7fa" },
          100: { value: "#b2ebf2" },
          200: { value: "#80deea" },
          300: { value: "#4dd0e1" },
          400: { value: "#26c6da" },
          500: { value: "#40E0D0" },
          600: { value: "#30c9c9" },
          700: { value: "#1fb8b8" },
          800: { value: "#00838f" },
          900: { value: "#006064" },
        },
      },
      zIndex: {
        tooltip: { value: 10001 },
      },
    },
  },
  globalCss: {
    body: {
      bg: { base: "#ffffff", _dark: "#000000" },
      color: { base: "gray.800", _dark: "whiteAlpha.900" },
    },
  },
});