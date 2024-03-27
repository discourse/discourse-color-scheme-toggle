import { later, schedule } from "@ember/runloop";
import { loadColorSchemeStylesheet } from "discourse/lib/color-scheme-picker";
import { withPluginApi } from "discourse/lib/plugin-api";
import { currentThemeId } from "discourse/lib/theme-selector";
import Session from "discourse/models/session";
import {
  COLOR_SCHEME_OVERRIDE_KEY,
  colorSchemeOverride,
} from "../lib/color-scheme-override";

export default {
  name: "color-scheme-toggler",

  initialize(container) {
    const keyValueStore = container.lookup("service:key-value-store");
    const storedOverride = keyValueStore.getItem(COLOR_SCHEME_OVERRIDE_KEY);

    if (!Session.currentProp("darkModeAvailable")) {
      const siteSettings = container.lookup("service:site-settings");

      if (siteSettings.default_dark_mode_color_scheme_id > 0) {
        loadColorSchemeStylesheet(
          siteSettings.default_dark_mode_color_scheme_id,
          currentThemeId(),
          true
        ).then(() => {
          if (storedOverride) {
            colorSchemeOverride(storedOverride);
          } else {
            // ensures that this extra stylesheet isn't auto-used when OS is in dark mode
            document.querySelector("link#cs-preview-dark").media =
              "(prefers-color-scheme: none)";
          }
        });
      } else {
        // eslint-disable-next-line no-console
        console.warn(
          "No dark color scheme available, the discourse-color-scheme-toggle component has no effect."
        );
        return;
      }
    }

    if (storedOverride) {
      Session.currentProp("colorSchemeOverride", storedOverride);
    }

    if (Session.currentProp("darkModeAvailable") && storedOverride) {
      schedule("afterRender", () => {
        const logoDarkSrc = document.querySelector(".title picture source");
        // in some cases the logo widget is not yet rendered
        // so we schedule the calculation after a short delay
        if (!logoDarkSrc) {
          later(() => colorSchemeOverride(storedOverride), 500);
        } else {
          colorSchemeOverride(storedOverride);
        }
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
