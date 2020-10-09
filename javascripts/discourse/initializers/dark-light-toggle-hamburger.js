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
      if (lightTheme.media === "all") {
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

        click() {
          toggleDarkLight();
        },

        html(attrs, state) {
          let style = lightTheme.media === "all" ? "light" : "dark";

          let lightClass = style === "light" ? "scheme-toggle.hidden" : "scheme-toggle";
          let darkClass = style === "dark" ? "scheme-toggle.hidden" : "scheme-toggle";

          return h("a.widget-link.dark-light-toggle",[
            h(`div.${lightClass}`, [
              iconNode("sun", {
                class: "scheme-icon",
              }),
              h("p", {
                title: I18n.t(themePrefix("toggle_description")) 
              }, I18n.t(themePrefix("toggle_light_mode")))
            ]),
            h(`div.${darkClass}`,[
              iconNode("far-moon", {
                class: "scheme-icon",
              }),
              h("p", {
                title: I18n.t(themePrefix("toggle_description")) 
              }, I18n.t(themePrefix("toggle_dark_mode")))
            ])
          ]);
        }
      });

      api.createWidget("auto-selector", {
        buildKey: attrs => "auto-selector",

        defaultState() {
          // checks to see what the autoScheme should be
          // I do this by checking if the users sytem setting is in dark mode
          // if the system setting is in dark mode, then the 'auto' scheme should be dark
          // and light if it is not
          if (window.matchMedia &&
              // this line checks if the user's system is currently in dark mode
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
          }
        },

        html() {
          let icon = cookie("userSelectedScheme") === "auto" ?
          "check-square" :
          "far-square";

          return h("a.widget-link.auto-toggle",[
            iconNode(icon, {
              class: "scheme-icon"
            }),
            h("p", {title: I18n.t(themePrefix("auto_mode_description"))}, I18n.t(themePrefix("toggle_auto_mode")))
            ]
          );
        }
      });

      api.decorateWidget("menu-links:before", helper => {
        if (helper.attrs.name === "footer-links") {
          return [
            h("ul.color-scheme-toggle",[
              h("li", helper.widget.attach("dark-light-selector")),
              h("li", helper.widget.attach("auto-selector"))
            ]),
            h(".clearfix"),
            h("hr")
          ];
        }
      });
    });
  }
};
