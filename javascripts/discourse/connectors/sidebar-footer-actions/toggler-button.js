import Session from "discourse/models/session";

export default {
  setupComponent(_args, component) {
    component.showInSidebar = false;

    if (
      !Session.currentProp("darkModeAvailable") &&
      component.siteSettings.default_dark_mode_color_scheme_id < 0
    ) {
      return;
    }

    if (!settings.add_color_scheme_toggle_to_header) {
      component.showInSidebar = true;
    }
  },
};
