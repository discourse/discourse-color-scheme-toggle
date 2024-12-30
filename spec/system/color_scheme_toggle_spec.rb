# frozen_string_literal: true

RSpec.describe "", system: true do
  fab!(:topic) { Fabricate(:post).topic }
  fab!(:user)
  fab!(:post) { Fabricate(:post, topic:, raw: <<~POST * 20) }
    Very lengthy post with lots of height for testing logo change when scrolling

    Here's another paragraph to make the post take very large vertical space\n
  POST

  fab!(:dark_mode_image) { Fabricate(:image_upload, color: "white", width: 400, height: 120) }
  fab!(:light_mode_image) { Fabricate(:image_upload, color: "black", width: 400, height: 120) }

  fab!(:small_dark_mode_image) { Fabricate(:image_upload, color: "white", width: 120, height: 120) }
  fab!(:small_light_mode_image) do
    Fabricate(:image_upload, color: "black", width: 120, height: 120)
  end

  let!(:theme_component) { upload_theme_component }

  let(:topic_page) { PageObjects::Pages::Topic.new }

  before do
    SiteSetting.logo = light_mode_image
    SiteSetting.logo_small = small_light_mode_image
    SiteSetting.logo_dark = dark_mode_image
    SiteSetting.logo_small_dark = small_dark_mode_image
    sign_in(user)
  end

  it "applies the correct `media` attribute on the source element when the logo is minimized upon scrolling" do
    topic_page.visit_topic(topic)

    dark_logo_source =
      find(
        ".title picture source[media=\"(prefers-color-scheme: dark)\"][srcset*=\"#{dark_mode_image.url}\"]",
        visible: false,
      )
    expect(dark_logo_source).to be_present

    find(".color-scheme-toggler").click

    dark_logo_source =
      find(
        ".title picture source[media=\"all\"][srcset*=\"#{dark_mode_image.url}\"]",
        visible: false,
      )
    expect(dark_logo_source).to be_present

    page.scroll_to(find(".topic-footer-main-buttons .create"))

    dark_logo_source =
      find(
        ".title picture source[media=\"all\"][srcset*=\"#{small_dark_mode_image.url}\"]",
        visible: false,
      )
    expect(dark_logo_source).to be_present
  end
end
