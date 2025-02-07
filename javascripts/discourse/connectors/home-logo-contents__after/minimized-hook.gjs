import Component from "@glimmer/component";
import { action } from "@ember/object";
import didUpdate from "@ember/render-modifiers/modifiers/did-update";
import { service } from "@ember/service";
import {
  changeHomeLogo,
  COLOR_SCHEME_OVERRIDE_KEY,
} from "../../lib/color-scheme-override";

export default class MinimizedHook extends Component {
  static shouldRender(args, helper) {
    const coreSelector = helper.siteSettings.interface_color_selector;
    return coreSelector === undefined || coreSelector === "disabled";
  }

  @service keyValueStore;

  @action
  onMinimizedChange() {
    const storedOverride = this.keyValueStore.getItem(
      COLOR_SCHEME_OVERRIDE_KEY
    );
    if (storedOverride) {
      changeHomeLogo(storedOverride);
    }
  }

  <template>
    <span
      class="hidden color-toggler-minimized-hook"
      {{didUpdate this.onMinimizedChange @outletArgs.minimized}}
    />
  </template>
}
