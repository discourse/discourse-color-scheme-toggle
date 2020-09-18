import { withPluginApi } from "discourse/lib/plugin-api";
import I18n from "I18n";
import { h } from "virtual-dom";
import { iconNode } from "discourse-common/lib/icon-library";

export default {
  name: "dark-light-toggle-hamburger-initializer",

  initialize() {
    // get the two <link> elements that hold the dark/light variables
    let lightTheme = document.querySelector(".light-scheme");
    let darkTheme = document.querySelector(".dark-scheme");

    if (!lightTheme || !darkTheme) {
      return false;
    }

    let switchToDark = function () {
      lightTheme.media = "none";
      lightTheme.classList.remove("user-selected-theme");
      darkTheme.media = "all";
      darkTheme.classList.add("user-selected-theme");
    };

    let switchToLight = function () {
      darkTheme.media = "none";
      darkTheme.classList.remove("user-selected-theme");
      lightTheme.media = "all";
      lightTheme.classList.add("user-selected-theme");
    };

    let switchToAuto = function () {
      darkTheme.media = "(prefers-color-scheme: dark)";
      darkTheme.classList.remove("user-selected-theme");
      lightTheme.media = "all";
      lightTheme.classList.remove("user-selected-theme");
    };


    withPluginApi("0.8", api => {
      api.createWidget("dark-selector", {
        buildKey: attrs => "dark-selector",

        click() {
          switchToDark();
        },

        html() {
          return h("a.widget-link.dark-light-toggle",[
            iconNode("far-moon", {
              class: "show-scheme-icon"
            }),
            h("p", I18n.t(themePrefix("toggle_dark_mode")))
            ]
          );
        }
      });

      api.createWidget("light-selector", {
        buildKey: attrs => "light-selector",

        click() {
          switchToLight();
        },

        html() {
          return h("a.widget-link.dark-light-toggle",[
            iconNode("far-sun", {
              class: "show-scheme-icon"
            }),
            h("p", I18n.t(themePrefix("toggle_light_mode")))
            ]
          );
        }
      });

      api.createWidget("auto-selector", {
        buildKey: attrs => "auto-selector",

        click() {
          switchToAuto();
        },

        html() {
          return h("a.widget-link.dark-light-toggle",[
            iconNode("tv", {
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
              h("li",helper.widget.attach("dark-selector")),
              h("li",helper.widget.attach("light-selector")),
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
