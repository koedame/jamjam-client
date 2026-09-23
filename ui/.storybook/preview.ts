import type { Preview } from "@storybook/react-vite";
import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/roboto-mono/400.css";
import "@fontsource/roboto-mono/700.css";
import "../src/styles/tokens.css";
import i18n from "../src/i18n";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      options: {
        light: {
          name: "light",
          value: "#FAFAFA",
        },

        dark: {
          name: "dark",
          value: "#1C1C1E",
        }
      }
    },
  },

  globalTypes: {
    theme: {
      name: "Theme",
      description: "Global theme for components",
      defaultValue: "light",
      toolbar: {
        icon: "paintbrush",
        items: [
          { value: "dark", title: "Dark" },
          { value: "light", title: "Light" },
        ],
        dynamicTitle: true,
      },
    },
    locale: {
      name: "Language",
      description: "UI language of the components",
      defaultValue: "en",
      toolbar: {
        icon: "globe",
        items: [
          { value: "en", title: "English" },
          { value: "ja", title: "日本語" },
        ],
        dynamicTitle: true,
      },
    },
  },

  decorators: [
    (Story, context) => {
      const theme = context.globals.theme || "light";
      document.documentElement.setAttribute("data-theme", theme);
      const locale = context.globals.locale || "en";
      if (i18n.language !== locale) {
        i18n.changeLanguage(locale);
      }
      return Story();
    },
  ],

  initialGlobals: {
    backgrounds: {
      value: "light"
    }
  }
};

export default preview;
