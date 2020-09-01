import { withPluginApi } from "discourse/lib/plugin-api";
import I18n from "I18n";

export default {
  name: "dark-light-toggle-initializer",

  initialize() {

    // get the two <link> elements that hold the dark/light variables
    let lightTheme = document.getElementsByClassName("light-scheme")[0];
    let darkTheme = document.getElementsByClassName("dark-scheme")[0];

    let switchToDark = function() {
      lightTheme.media = "none";
      lightTheme.classList.remove("user-selected-theme");
      darkTheme.media = "all";
      darkTheme.classList.add("user-selected-theme");
      localStorage.setItem('userToggledScheme', 'dark')
    };

    let switchToLight = function() {
      darkTheme.media = "none";
      darkTheme.classList.remove("user-selected-theme");
      lightTheme.media = "all";
      lightTheme.classList.add("user-selected-theme");
      localStorage.setItem('userToggledScheme', 'light')
    };

    // loads user setting from local storage if there is one upon init
    let loadDarkOrLight = function() {
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
    }

    loadDarkOrLight();

    // handles the toggle function
    let toggleDL = function() { 
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
  
      // gets the icon inside of the dar-light-toggle li element
      let darkLightToggle = document.getElementsByClassName(
        "dark-light-toggle"
      )[0].children[0].children[0];

      // flip 'adjust' icon
      if (
        darkLightToggle.style.transform === "scale(1)" ||
        darkLightToggle.style.transform === ""
      ) {
        darkLightToggle.style.transform = "scale(-1,1)";
      } else {
        darkLightToggle.style.transform = "scale(1)";
      }
    };

    withPluginApi("0.8", api => {
      api.addQuickAccessProfileItem({
        icon: "adjust",
        // this action needs to exist in the user-menu widget to work
        action: "toggleDarkLight",
        // ideally this title would be dynamic but I dont
        // think this is currently possible
        content: I18n.t(themePrefix("toggle_scheme")),
        className: 'dark-light-toggle'
      })

      api.reopenWidget("user-menu", {
        // adds toggleDarkLight function as an action to the user menu
        // this calls toggleDL from above
        toggleDarkLight() {
          toggleDL();
        }
      })
    });
  }
}