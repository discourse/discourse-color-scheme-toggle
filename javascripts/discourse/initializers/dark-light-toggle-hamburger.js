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
      localStorage.setItem("userToggledScheme", "dark");
    };

    let switchToLight = function () {
      darkTheme.media = "none";
      darkTheme.classList.remove("user-selected-theme");
      lightTheme.media = "all";
      lightTheme.classList.add("user-selected-theme");
      localStorage.setItem("userToggledScheme", "light");
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

    // loads user setting from local storage if there is one upon init
    let loadDarkOrLight = function () {
      let savedSchemeChoice = localStorage.getItem("userToggledScheme");

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
      } else {
        return;
      }
    };

    loadDarkOrLight();

    withPluginApi("0.8", api => {
      api.createWidget("scheme-selector", {
        buildKey: attrs => "scheme-selector",

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

        schemeSelectorHtml(currentScheme) {
          let schemeName =
            currentScheme === "light" ? "Dark Mode" : "Light Mode";
          return h(
            "li",
            h("a.widget-link.dark-light-toggle",[
              iconNode("far-sun", {
                class: currentScheme === "dark" ? "scheme-icon show-scheme-icon" : "scheme-icon"
              }),
              iconNode("far-moon", {
                class: currentScheme === "light" ? "scheme-icon show-scheme-icon" : "scheme-icon"
              }),
              h("p",`Toggle ${schemeName}`)
              ]
            )
          );
        },

        html(attrs, state) {
          let schemeSelectorHtml = this.schemeSelectorHtml(state.currentScheme);
          return [
            h("ul.menu-links.columned", schemeSelectorHtml),
            h(".clearfix"),
            h("hr")
          ];
        }
      });

      api.decorateWidget("menu-links:before", helper => {
        if (helper.attrs.name === "footer-links") {
          return [helper.widget.attach("scheme-selector")];
        }
      });
    });
  }
};
