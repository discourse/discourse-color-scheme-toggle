import { setOwner } from "@ember/owner";
import { later, schedule } from "@ember/runloop";
import { service } from "@ember/service";
import { loadColorSchemeStylesheet } from "discourse/lib/color-scheme-picker";
import { withPluginApi } from "discourse/lib/plugin-api";
import { currentThemeId } from "discourse/lib/theme-selector";
import { bind } from "discourse-common/utils/decorators";
import ColorSchemeToggler from "../components/color-scheme-toggler";
import {
  COLOR_SCHEME_OVERRIDE_KEY,
  colorSchemeOverride,
} from "../lib/color-scheme-override";

class TogglerInit {
  @service keyValueStore;
  @service session;

  constructor(owner) {
    setOwner(this, owner);

    const storedOverride = this.keyValueStore.getItem(
      COLOR_SCHEME_OVERRIDE_KEY
    );

    if (!this.session.darkModeAvailable) {
      const siteSettings = owner.lookup("service:site-settings");

      if (siteSettings.default_dark_mode_color_scheme_id <= 0) {
        // eslint-disable-next-line no-console
        console.warn(
          "No dark color scheme available, the discourse-color-scheme-toggle component has no effect."
        );
        return;
      }

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
    }

    if (storedOverride) {
      this.session.set("colorSchemeOverride", storedOverride);
    }

    if (this.session.darkModeAvailable && storedOverride) {
      schedule("afterRender", () => {
        const logoDarkSrc = document.querySelector(".title picture source");
        // in some cases the logo widget is not yet rendered
        // so we schedule the calculation after a short delay
        if (!logoDarkSrc) {
          later(() => {
            if (owner.isDestroying || owner.isDestroyed) {
              return;
            }

            colorSchemeOverride(storedOverride);
          }, 500);
        } else {
          colorSchemeOverride(storedOverride);
        }
      });
    }

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", this.onColorChange);

    if (settings.add_color_scheme_toggle_to_header) {
      withPluginApi("1.28.0", (api) => {
        api.headerIcons.add(
          "header-toggle-button",
          <template>
            <li class="header-toggle-button header-dropdown-toggle">
              <span class="header-color-scheme-toggle icon">
                <ColorSchemeToggler />
              </span>
            </li>
          </template>,
          { before: "search" }
        );
      });
    }
  }

  @bind
  onColorChange() {
    // reset when switching OS dark mode
    this.keyValueStore.removeItem(COLOR_SCHEME_OVERRIDE_KEY);
    this.session.set("colorSchemeOverride", null);
    colorSchemeOverride();
  }

  teardown() {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .removeEventListener("change", this.onColorChange);
  }
}

export default {
  name: "color-scheme-toggler",

  initialize(owner) {
    this.instance = new TogglerInit(owner);
  },

  teardown() {
    this.instance.teardown();
    this.instance = null;
  },
};
