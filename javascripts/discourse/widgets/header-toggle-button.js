import { hbs } from "ember-cli-htmlbars";
import RenderGlimmer from "discourse/widgets/render-glimmer";
import { createWidget } from "discourse/widgets/widget";

createWidget("header-toggle-button", {
  tagName: "li.header-toggle-button.header-dropdown-toggle",

  html() {
    return [
      new RenderGlimmer(
        this,
        "span.header-color-scheme-toggle.icon",
        hbs`<ColorSchemeToggler />`
      ),
    ];
  },
});
