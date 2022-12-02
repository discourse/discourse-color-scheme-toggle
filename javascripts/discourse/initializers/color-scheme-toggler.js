import Session from "discourse/models/session";
import {
  COLOR_SCHEME_OVERRIDE_KEY,
  colorSchemeOverride,
} from "../lib/color-scheme-override";
import { schedule } from "@ember/runloop";
import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "color-scheme-toggler",

  initialize(container) {
    const keyValueStore = container.lookup("service:key-value-store");
    const storedOverride = keyValueStore.getItem(COLOR_SCHEME_OVERRIDE_KEY);

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
        colorSchemeOverride();
      });

    if (settings.add_color_scheme_toggle_to_header) {
      withPluginApi("0.8", (api) => {
        api.addToHeaderIcons("header-toggle-button");
      });
    }
  },
};
