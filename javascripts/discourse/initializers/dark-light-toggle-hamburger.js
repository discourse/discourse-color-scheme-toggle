import { withPluginApi } from "discourse/lib/plugin-api";
import I18n from "I18n";
import { h } from "virtual-dom";
import { iconNode } from "discourse-common/lib/icon-library";
import cookie from "discourse/lib/cookie";
import { observes } from "discourse-common/utils/decorators";

export default {
  name: "dark-light-toggle-hamburger-initializer",

  initialize() {
    // get the two <link> elements that hold the dark/light variables
    let lightTheme = document.querySelector(".light-scheme");
    let darkTheme = document.querySelector(".dark-scheme");

    if (!lightTheme || !darkTheme) {
      console.warn(
        `Toggle Dark/Light mode hamburger widget not loaded:
Have you selected two different themes for your dark/light schemes in user preferences? "u/preferences/interface"
        `
        )
      return false;
    }

    let switchToDark = function () {
      cookie("userSelectedScheme","dark", {path: "/", expires: 9999, secure: true});
      lightTheme.media = "none";
      lightTheme.classList.remove("user-selected-theme");
      darkTheme.media = "all";
      darkTheme.classList.add("user-selected-theme");
    };

    let switchToLight = function () {
      cookie("userSelectedScheme","light", {path: "/", expires: 9999, secure: true});
      darkTheme.media = "none";
      darkTheme.classList.remove("user-selected-theme");
      lightTheme.media = "all";
      lightTheme.classList.add("user-selected-theme");
    };

    let switchToAuto = function () {
      cookie("userSelectedScheme","auto", {path: "/", expires: 9999, secure: true});
      darkTheme.media = "(prefers-color-scheme: dark)";
      darkTheme.classList.remove("user-selected-theme");
      lightTheme.media = "all";
      lightTheme.classList.remove("user-selected-theme");
    };

    let toggleDarkLight = function () {
      let page = document.getElementsByTagName("html")[0];
      let style = window
        .getComputedStyle(page)
        .getPropertyValue("--scheme-type")
        .trim();
      
      if (style === "light") {
        switchToDark();
      } else {
        switchToLight();
      }
    };

    let loadDarkOrLight = function () {
      
      let savedSchemeChoice = cookie("userSelectedScheme");

      if (!savedSchemeChoice) {
        return false;
      }

      if (savedSchemeChoice === "light") {
        darkTheme.media = "none";
        darkTheme.classList.remove("user-selected-theme");
        lightTheme.media = "all";
        lightTheme.classList.add("user-selected-theme");
      } else if (savedSchemeChoice === "dark") {
        lightTheme.media = "none";
        lightTheme.classList.remove("user-selected-theme");
        darkTheme.media = "all";
        darkTheme.classList.add("user-selected-theme");
      } else if (savedSchemeChoice === "auto") {
        lightTheme.media = "all";
        lightTheme.classList.remove("user-selected-theme");
        darkTheme.media = "(prefers-color-scheme: dark)";
        darkTheme.classList.remove("user-selected-theme");
      }
    };

    loadDarkOrLight();

    withPluginApi("0.8", api => {

      // this will reset the scheme choice to 'auto' whenever a user
      // changes their color scheme preferences in the user interface
      api.modifyClass("controller:preferences/interface", {
        @observes("selectedColorSchemeId")
        onChangeColorScheme() {
          switchToAuto();
        },
        @observes("selectedDarkColorSchemeId")
        onChangeDarkColorScheme() {
          switchToAuto();
        }
      });

      api.createWidget("dark-light-selector", {
        buildKey: attrs => "dark-light-selector",

        defaultState() {
          let page = document.getElementsByTagName("html")[0];
          let style = window
            .getComputedStyle(page)
            .getPropertyValue("--scheme-type")
            .trim();

          return { currentScheme: style };
        },

        click() {
          toggleDarkLight();

          let page = document.getElementsByTagName("html")[0];
          let style = window
            .getComputedStyle(page)
            .getPropertyValue("--scheme-type")
            .trim();

          let toggleText = document.querySelector(".dark-light-toggle").children[2];
          toggleText.textContent =
            style === "light"
              ? I18n.t(themePrefix("toggle_dark_mode"))
              : I18n.t(themePrefix("toggle_light_mode"));
          
          let schemeIcons = Array.prototype.slice.call(document.querySelectorAll('.scheme-icon'));

          schemeIcons.forEach((icon) => {
            icon.classList.toggle('show-scheme-icon')
          })

        },

        html(attrs, state) {
          let schemeName =
            state.currentScheme === "light" ? "toggle_dark_mode" : "toggle_light_mode";

          return h("a.widget-link.dark-light-toggle",[
            iconNode("far-sun", {
              class: state.currentScheme === "dark" ? "scheme-icon show-scheme-icon" : "scheme-icon"
            }),
            iconNode("far-moon", {
              class: state.currentScheme === "light" ? "scheme-icon show-scheme-icon" : "scheme-icon"
            }),
            h("p", I18n.t(themePrefix(schemeName)))
            ]
          );
        }
      });

      api.createWidget("auto-selector", {
        buildKey: attrs => "auto-selector",

        defaultState() {
          if (window.matchMedia &&
              window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return { autoScheme: "dark" };
          } else {
            return { autoScheme: "light" }
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

            let page = document.getElementsByTagName("html")[0];
            let currentScheme = window
              .getComputedStyle(page)
              .getPropertyValue("--scheme-type")
              .trim();

            // only toggle icons + text if auto changes the current scheme
            if (currentScheme !== this.state.autoScheme) {
              let toggleText = document.querySelector(".dark-light-toggle").children[2];

              toggleText.textContent =
              this.state.autoScheme === "light"
                  ? I18n.t(themePrefix("toggle_dark_mode"))
                  : I18n.t(themePrefix("toggle_light_mode"));

              let schemeIcons = Array.prototype.slice.call(document.querySelectorAll('.scheme-icon'));

              schemeIcons.forEach((icon) => {
                icon.classList.toggle('show-scheme-icon')
              });
            }
          }
        },

        html() {
          let icon = cookie("userSelectedScheme") === "auto" ?
          "check-square" :
          "far-square";

          return h("a.widget-link.dark-light-toggle",[
            iconNode(icon, {
              class: "show-scheme-icon"
            }),
            h("p", I18n.t(themePrefix("toggle_auto_mode")))
            ]
          );
        }
      });

      api.decorateWidget("menu-links:before", helper => {
        if (helper.attrs.name === "footer-links") {
          return [
            h("ul.color-scheme-toggle", [
              h("li",helper.widget.attach("dark-light-selector")),
              h("li",helper.widget.attach("auto-selector"))
            ]),
            h(".clearfix"),
            h("hr")
          ];
        }
      });
    });
  }
};
