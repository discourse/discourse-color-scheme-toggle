import { withPluginApi } from "discourse/lib/plugin-api";
import I18n from "I18n";
import { h } from "virtual-dom";
import { iconNode } from "discourse-common/lib/icon-library";
import cookie from "discourse/lib/cookie";

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
      cookie("userSelectedScheme","dark");
      lightTheme.media = "none";
      lightTheme.classList.remove("user-selected-theme");
      darkTheme.media = "all";
      darkTheme.classList.add("user-selected-theme");
    };

    let switchToLight = function () {
      cookie("userSelectedScheme","light");
      darkTheme.media = "none";
      darkTheme.classList.remove("user-selected-theme");
      lightTheme.media = "all";
      lightTheme.classList.add("user-selected-theme");
    };

    let switchToAuto = function () {
      cookie("userSelectedScheme","auto");
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

        click() {
          switchToAuto();

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
