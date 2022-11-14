/* global themePrefix */

import { withPluginApi } from "discourse/lib/plugin-api";
import I18n from "I18n";
import { h } from "virtual-dom";
import { iconNode } from "discourse-common/lib/icon-library";
import cookie from "discourse/lib/cookie";
import { observes } from "discourse-common/utils/decorators";
import Session from "discourse/models/session";

function activeScheme() {
  let savedSchemeChoice = cookie("userSelectedScheme");

  if (savedSchemeChoice === "dark") {
    return "dark";
  } else if (savedSchemeChoice === "light") {
    return "light";
  } else if (window?.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  } else {
    return "light";
  }
}

function updateThemeColor(frames = 0) {
  // The number is arbitrary (~1s) and in most cases the actual count ends up
  // being either 0 or 3 (Safari)
  if (frames >= 60) {
    // The style is unlikely to load at this point so bail
    return;
  }

  let color = getComputedStyle(document.documentElement).getPropertyValue(
    "--header_background"
  );

  if (color) {
    document
      .querySelector("meta[name=theme-color]")
      .setAttribute("content", color);
  } else {
    requestAnimationFrame(() => updateThemeColor(frames + 1));
  }
}

export default {
  name: "dark-light-toggle-hamburger-initializer",

  initialize() {
    // get the two <link> elements that hold the dark/light variables
    let lightTheme = document.querySelector(".light-scheme");
    let darkTheme = document.querySelector(".dark-scheme");

    if (!lightTheme || !darkTheme) {
      // eslint-disable-next-line no-console
      console.warn(
        `Toggle Dark/Light mode hamburger widget not loaded:
Have you selected two different themes for your dark/light schemes in user preferences? "u/preferences/interface"
        `
      );
      return false;
    }

    let switchToDark = function () {
      cookie("userSelectedScheme", "dark", {
        path: "/",
        expires: 9999,
      });
      darkTheme.media = "all";
      lightTheme.media = "none";

      Session.currentProp("defaultColorSchemeIsDark", true);
      Session.currentProp("darkModeAvailable", true);
    };

    let switchToLight = function () {
      cookie("userSelectedScheme", "light", {
        path: "/",
        expires: 9999,
      });
      lightTheme.media = "all";
      darkTheme.media = "none";

      Session.currentProp("defaultColorSchemeIsDark", false);
      Session.currentProp("darkModeAvailable", false);
    };

    let switchToAuto = function () {
      cookie("userSelectedScheme", "auto", {
        path: "/",
        expires: 9999,
      });
      lightTheme.media = "all";
      darkTheme.media = "(prefers-color-scheme: dark)";

      if (window?.matchMedia("(prefers-color-scheme: dark)").matches) {
        Session.currentProp("defaultColorSchemeIsDark", true);
        Session.currentProp("darkModeAvailable", true);
      } else {
        Session.currentProp("defaultColorSchemeIsDark", false);
        Session.currentProp("darkModeAvailable", false);
      }
    };

    let toggleDarkLight = function () {
      if (activeScheme() === "light") {
        switchToDark();
      } else {
        switchToLight();
      }

      updateThemeColor();
    };

    let loadDarkOrLight = function () {
      updateThemeColor();
      let savedSchemeChoice = cookie("userSelectedScheme");

      if (!savedSchemeChoice) {
        return false;
      }

      if (savedSchemeChoice === "light") {
        switchToLight();
      } else if (savedSchemeChoice === "dark") {
        switchToDark();
      } else if (savedSchemeChoice === "auto") {
        switchToAuto();
      }
    };

    function createToggle(iconName, labelName) {
      let title = I18n.t(themePrefix("toggle_description"));

      let toggle = h("div.scheme-toggle", { title }, [
        iconNode(iconName, { class: "scheme-icon" }),
        h("span", I18n.t(themePrefix(labelName))),
      ]);

      return h("a.widget-link.dark-light-toggle", [toggle]);
    }

    loadDarkOrLight();

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", updateThemeColor);

    withPluginApi("0.8", (api) => {
      // this will reset the scheme choice to 'auto' whenever a user
      // changes their color scheme preferences in the user interface
      api.modifyClass("controller:preferences/interface", {
        pluginId: "discourse-color-scheme-toggle",

        @observes("selectedColorSchemeId")
        onChangeColorScheme() {
          switchToAuto();
        },

        @observes("selectedDarkColorSchemeId")
        onChangeDarkColorScheme() {
          switchToAuto();
        },
      });

      api.createWidget("dark-light-toggle", {
        tagName: "li.dark-light-toggle.icon",

        buildKey: () => "dark-light-toggle",

        buildId: () => "dark-light-toggle",

        click() {
          toggleDarkLight();
          this.scheduleRerender();
        },

        selectedScheme(scheme) {
          if (activeScheme() === scheme) {
            return ".selected";
          }

          return "";
        },

        html() {
          return h(`label.switch.${activeScheme()}`, [
            h(`span.slider.round`, ""),
            h(
              `span.toggle-icon.round.dark${this.selectedScheme("light")}`,
              iconNode("sun", {
                class: "scheme-icon",
              })
            ),
            h(
              `span.toggle-icon.round.light${this.selectedScheme("dark")}`,
              iconNode("far-moon", {
                class: "scheme-icon",
              })
            ),
          ]);
        },
      });

      // with new sidebar rolling out, this will be the main option of showing
      // allow those who dont use sidebar to remove from header
      if (!settings.remove_color_scheme_toggle_from_header) {
        api.addToHeaderIcons("dark-light-toggle");
      }

      api.createWidget("dark-light-selector", {
        buildKey: () => "dark-light-selector",

        click() {
          toggleDarkLight();
        },

        html() {
          if (activeScheme() === "light") {
            return createToggle("far-moon", "toggle_dark_mode");
          } else {
            return createToggle("sun", "toggle_light_mode");
          }
        },
      });

      api.createWidget("auto-selector", {
        buildKey: () => "auto-selector",

        defaultState() {
          // checks to see what the autoScheme should be
          // I do this by checking if the users sytem setting is in dark mode
          // if the system setting is in dark mode, then the 'auto' scheme should be dark
          // and light if it is not
          if (window?.matchMedia("(prefers-color-scheme: dark)").matches) {
            return { autoScheme: "dark" };
          } else {
            return { autoScheme: "light" };
          }
        },

        click() {
          // if auto is currently selected, turn auto off
          // and set userSelectedScheme to the original color scheme
          if (cookie("userSelectedScheme") === "auto") {
            if (this.state.autoScheme === "light") {
              switchToLight();
            } else {
              switchToDark();
            }
          } else {
            switchToAuto();
          }
        },

        html() {
          let icon =
            cookie("userSelectedScheme") === "auto"
              ? "check-square"
              : "far-square";

          return h("a.widget-link.auto-toggle", [
            iconNode(icon, {
              class: "scheme-icon",
            }),
            h(
              "p",
              { title: I18n.t(themePrefix("auto_mode_description")) },
              I18n.t(themePrefix("toggle_auto_mode"))
            ),
          ]);
        },
      });

      api.decorateWidget("menu-links:before", (helper) => {
        if (helper.attrs.name === "footer-links") {
          if (!settings.add_color_scheme_toggle_to_header) {
            return [
              h("ul.color-scheme-toggle", [
                h("li", helper.widget.attach("dark-light-selector")),
                h("li", helper.widget.attach("auto-selector")),
              ]),
              h("hr"),
            ];
          }
          return "";
        }
      });
    });
  },
};
