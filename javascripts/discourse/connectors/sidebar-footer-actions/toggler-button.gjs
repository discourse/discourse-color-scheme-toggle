import Component from "@glimmer/component";
import { service } from "@ember/service";
import ColorSchemeToggler from "../../components/color-scheme-toggler";

export default class TogglerButton extends Component {
  static shouldRender(args, helper) {
    const coreSelector = helper.siteSettings.interface_color_selector;
    return coreSelector === undefined || coreSelector === "disabled";
  }

  @service session;
  @service siteSettings;

  get showInSidebar() {
    return (
      (this.session.darkModeAvailable ||
        this.siteSettings.default_dark_mode_color_scheme_id >= 0) &&
      !settings.add_color_scheme_toggle_to_header
    );
  }

  <template>
    {{#if this.showInSidebar}}
      <ColorSchemeToggler />
    {{/if}}
  </template>
}
