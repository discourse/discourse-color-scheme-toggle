import Session from "discourse/models/session";
import {
  COLOR_SCHEME_OVERRIDE_KEY,
  colorSchemeOverride,
} from "../lib/color-scheme-override";
import { schedule } from "@ember/runloop";
import { withPluginApi } from "discourse/lib/plugin-api";
import { loadColorSchemeStylesheet } from "discourse/lib/color-scheme-picker";
import { currentThemeId } from "discourse/lib/theme-selector";

export default {
  name: "color-scheme-toggler",

  initialize(container) {
    if (!Session.currentProp("darkModeAvailable")) {
      const siteSettings = container.lookup("site-settings:main");
      if (siteSettings.default_dark_mode_color_scheme_id > 0) {
        loadColorSchemeStylesheet(
          siteSettings.default_dark_mode_color_scheme_id,
          currentThemeId(),
          true
        );
      } else {
        // eslint-disable-next-line no-console
        console.warn(
          "No dark color scheme available, the discourse-color-scheme-toggle component has no effect."
        );
        return;
      }
    }

    const keyValueStore = container.lookup("service:key-value-store");
    const storedOverride = keyValueStore.getItem(COLOR_SCHEME_OVERRIDE_KEY);
    if (storedOverride) {
      Session.currentProp("colorSchemeOverride", storedOverride);
    }

    if (Session.currentProp("darkModeAvailable") && storedOverride) {
      schedule("afterRender", () => {
        // delay needed for logo override
        colorSchemeOverride(storedOverride);
      });
    }

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", () => {
        // reset when switching OS dark mode
        keyValueStore.removeItem(COLOR_SCHEME_OVERRIDE_KEY);
        Session.currentProp("colorSchemeOverride", null);
        colorSchemeOverride();
      });

    if (settings.add_color_scheme_toggle_to_header) {
      withPluginApi("0.8", (api) => {
        api.addToHeaderIcons("header-toggle-button");
      });
    }
  },
};
