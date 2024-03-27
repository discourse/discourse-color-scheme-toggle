import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { action, computed } from "@ember/object";
import { service } from "@ember/service";
import Session from "discourse/models/session";
import {
  COLOR_SCHEME_OVERRIDE_KEY,
  colorSchemeOverride,
} from "../lib/color-scheme-override";

export default class ColorSchemeToggler extends Component {
  @service keyValueStore;
  @tracked storedOverride;

  constructor() {
    super(...arguments);
    this.storedOverride = this.keyValueStore.getItem(COLOR_SCHEME_OVERRIDE_KEY);
  }

  @computed("storedOverride")
  get toggleButtonIcon() {
    switch (this.OSMode) {
      case "dark":
        return this.storedOverride === "light" ? "moon" : "sun";
      case "light":
        return this.storedOverride === "dark" ? "sun" : "moon";
    }
  }

  get OSMode() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  @action
  toggleScheme() {
    switch (this.OSMode) {
      case "light":
        if (this.keyValueStore.getItem(COLOR_SCHEME_OVERRIDE_KEY) === "dark") {
          this.keyValueStore.removeItem(COLOR_SCHEME_OVERRIDE_KEY);
        } else {
          this.keyValueStore.setItem(COLOR_SCHEME_OVERRIDE_KEY, "dark");
        }
        break;
      case "dark":
        if (this.keyValueStore.getItem(COLOR_SCHEME_OVERRIDE_KEY) !== "light") {
          this.keyValueStore.setItem(COLOR_SCHEME_OVERRIDE_KEY, "light");
        } else {
          this.keyValueStore.removeItem(COLOR_SCHEME_OVERRIDE_KEY);
        }
        break;
    }

    this.storedOverride =
      this.keyValueStore.getItem(COLOR_SCHEME_OVERRIDE_KEY) || null;

    // currently only used to flip category logos back/forth
    Session.currentProp("colorSchemeOverride", this.storedOverride);

    colorSchemeOverride(this.storedOverride);
  }
}
