import { registerHelper } from "discourse-common/lib/helpers";

registerHelper("media-helper", function ([value]) {
  switch (value) {
    case "dark":
      return "all";
    case "light":
      return "none";
    default:
      return "(prefers-color-scheme: dark)";
  }
});
