export const COLOR_SCHEME_OVERRIDE_KEY = "color_scheme_override";

export function colorSchemeOverride(type) {
  const lightScheme = document.querySelector("link.light-scheme");
  const darkScheme = document.querySelector("link.dark-scheme");

  if (!lightScheme && !darkScheme) {
    return;
  }

  const logoDarkSrc = document.querySelector(".title picture source");

  switch (type) {
    case "dark":
      lightScheme.origMedia = lightScheme.media;
      lightScheme.media = "none";
      darkScheme.origMedia = darkScheme.media;
      darkScheme.media = "all";
      if (logoDarkSrc) {
        logoDarkSrc.origMedia = logoDarkSrc.media;
        logoDarkSrc.media = "all";
      }
      break;
    case "light":
      lightScheme.origMedia = lightScheme.media;
      lightScheme.media = "all";
      darkScheme.origMedia = darkScheme.media;
      darkScheme.media = "none";
      if (logoDarkSrc) {
        logoDarkSrc.origMedia = logoDarkSrc.media;
        logoDarkSrc.media = "none";
      }
      break;
    default:
      if (lightScheme.origMedia) {
        lightScheme.media = lightScheme.origMedia;
        lightScheme.removeAttribute("origMedia");
      }
      if (darkScheme.origMedia) {
        darkScheme.media = darkScheme.origMedia;
        darkScheme.removeAttribute("origMedia");
      }
      if (logoDarkSrc?.origMedia) {
        logoDarkSrc.media = logoDarkSrc.origMedia;
      }
      break;
  }
}
