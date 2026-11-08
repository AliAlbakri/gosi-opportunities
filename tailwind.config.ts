import type { Config } from "tailwindcss";

/**
 * GOSI color map. Tailwind v4 reads the live tokens from app/globals.css (@theme).
 * This file mirrors them so the brand names stay in one place for the rest of the app.
 */
const config: Config = {
  theme: {
    extend: {
      colors: {
        gosi: {
          "rich-blue": "#00004E",
          "rich-blue-80": "#333371",
          "rich-blue-50": "#8080A7",
          "rich-blue-25": "#BFBFD3",
          "rich-blue-10": "#E6E6ED",
          "vivid-green": "#00BF00",
          "green-80": "#33CC33",
          "green-50": "#80DF80",
          "green-25": "#BFEFBF",
          "green-10": "#E6F9E6",
          white: "#FFFFFF",
          midnight: "#00122D",
          "midnight-80": "#334157",
          "midnight-50": "#808996",
          "midnight-25": "#BFC4CB",
          "midnight-10": "#E6E7EA",
          blue: "#0064FF",
          purple: "#A37DFC",
        },
      },
    },
  },
};

export default config;
