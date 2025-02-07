import { setOwner } from "@ember/owner";
import { later, schedule } from "@ember/runloop";
import { service } from "@ember/service";
import { loadColorSchemeStylesheet } from "discourse/lib/color-scheme-picker";
import { bind } from "discourse/lib/decorators";
import getURL from "discourse/lib/get-url";
import { withPluginApi } from "discourse/lib/plugin-api";
import { currentThemeId } from "discourse/lib/theme-selector";
import ColorSchemeToggler from "../components/color-scheme-toggler";
import {
  COLOR_SCHEME_OVERRIDE_KEY,
  colorSchemeOverride,
} from "../lib/color-scheme-override";

class TogglerInit {
  @service keyValueStore;
  @service session;
  @service siteSettings;

  constructor(owner) {
    setOwner(this, owner);

    const coreSelector = this.siteSettings.interface_color_selector;
    if (coreSelector !== undefined) {
      const becomeNoOp = coreSelector !== "disabled";

      withPluginApi("1.28.0", (api) => {
        const currentUser = api.getCurrentUser();
        if (currentUser?.admin) {
          const themeId = themePrefix("foo").match(
            /theme_translations\.(\d+)\.foo/
          )[1];
          const themeURL = getURL(`/admin/customize/themes/${themeId}`);
          const message = becomeNoOp
            ? `
            <b>Admin notice:</b> the "Dark-Light Toggle" theme component is still enabled on your site, but it has been superseded by the new core version and doesn't do anything now. Please <a href="${themeURL}">delete</a> it to prevent potential breakages in the future.`
            : `
            <b>Admin notice:</b> you're using the "Dark-Light Toggle" theme component which is now available as a core feature. Please enable the core version via the <a href="${getURL(
              "/admin/site_settings/category/all_results?filter=interface_color_selector"
            )}">interface color selector</a> site setting and <a href="${themeURL}">delete</a> the theme component.`;

          api.addGlobalNotice(
            message,
            "color-scheme-toggle-component-deprecated",
            {
              dismissable: true,
              level: "warn",
              dismissDuration: moment.duration("1", "day"),
            }
          );
        }
      });

      if (becomeNoOp) {
        return;
      }
    }

    const storedOverride = this.keyValueStore.getItem(
      COLOR_SCHEME_OVERRIDE_KEY
    );

    if (!this.session.darkModeAvailable) {
      if (this.siteSettings.default_dark_mode_color_scheme_id <= 0) {
        // eslint-disable-next-line no-console
        console.warn(
          "No dark color scheme available, the discourse-color-scheme-toggle component has no effect."
        );
        return;
      }

      loadColorSchemeStylesheet(
        this.siteSettings.default_dark_mode_color_scheme_id,
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
