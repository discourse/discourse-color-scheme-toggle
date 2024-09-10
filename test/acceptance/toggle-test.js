import { visit } from "@ember/test-helpers";
import { test } from "qunit";
import Session from "discourse/models/session";
import { acceptance } from "discourse/tests/helpers/qunit-helpers";

acceptance("Color Scheme Toggle - header icon", function (needs) {
  needs.hooks.beforeEach(function () {
    settings.add_color_scheme_toggle_to_header = true;
    Session.current().set("darkModeAvailable", true);
  });

  needs.hooks.afterEach(function () {
    Session.current().set("darkModeAvailable", null);
  });

  test("shows in header", async function (assert) {
    await visit("/");

    assert
      .dom(".header-color-scheme-toggle")
      .exists("button present in header");
  });
});

acceptance("Color Scheme Toggle - no op", function (needs) {
  needs.hooks.beforeEach(function () {
    settings.add_color_scheme_toggle_to_header = true;
  });

  test("does not show when no dark color scheme available", async function (assert) {
    await visit("/");

    assert
      .dom(".header-color-scheme-toggle")
      .doesNotExist("button is not present in header");
  });
});

acceptance("Color Scheme Toggle - sidebar icon", function (needs) {
  needs.settings({
    enable_sidebar: true,
    enable_experimental_sidebar_hamburger: true,
  });

  needs.hooks.beforeEach(function () {
    settings.add_color_scheme_toggle_to_header = false;
    Session.current().set("darkModeAvailable", true);
  });

  needs.hooks.afterEach(function () {
    Session.current().set("darkModeAvailable", null);
  });

  test("shows in sidebar", async function (assert) {
    await visit("/");

    assert
      .dom(".header-color-scheme-toggle")
      .doesNotExist("button not present in header");

    assert
      .dom(".sidebar-footer-wrapper .color-scheme-toggler")
      .exists("button in footer");
  });
});

acceptance("Color Scheme Toggle - sidebar icon", function (needs) {
  needs.pretender((server, helper) => {
    server.get("/color-scheme-stylesheet/2.json", () => {
      return helper.response({
        color_scheme_id: 2,
        new_href:
          "/stylesheets/color_definitions_wcag-dark_2_52_a09af66a69bc639c6d63acd81d4c3cea2985282e.css",
      });
    });
  });

  needs.settings({
    enable_sidebar: true,
    enable_experimental_sidebar_hamburger: true,
    default_dark_mode_color_scheme_id: 2,
  });

  needs.hooks.beforeEach(function () {
    settings.add_color_scheme_toggle_to_header = false;
  });

  test("shows in sidebar if site has auto dark mode", async function (assert) {
    await visit("/");

    assert
      .dom(".header-color-scheme-toggle")
      .doesNotExist("button not present in header");

    assert
      .dom(".sidebar-footer-wrapper .color-scheme-toggler")
      .exists("button in footer");
  });
});
