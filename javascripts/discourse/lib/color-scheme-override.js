export const COLOR_SCHEME_OVERRIDE_KEY = "color_scheme_override";

export function colorSchemeOverride(type) {
  const lightScheme = document.querySelector("link.light-scheme");
  const darkScheme =
    document.querySelector("link.dark-scheme") ||
    document.querySelector("link#cs-preview-dark");

  if (!lightScheme && !darkScheme) {
    return;
  }

  switch (type) {
    case "dark":
      lightScheme.origMedia = lightScheme.media;
      lightScheme.media = "none";
      darkScheme.origMedia = darkScheme.media;
      darkScheme.media = "all";
      break;
    case "light":
      lightScheme.origMedia = lightScheme.media;
      lightScheme.media = "all";
      darkScheme.origMedia = darkScheme.media;
      darkScheme.media = "none";
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
      break;
  }
  changeHomeLogo(type);
}

export function changeHomeLogo(type) {
  const logoDarkSrc = document.querySelector(".title picture source");

  if (!logoDarkSrc) {
    return;
  }

  switch (type) {
    case "dark":
      logoDarkSrc.origMedia = logoDarkSrc.media;
      logoDarkSrc.media = "all";
      break;
    case "light":
      logoDarkSrc.origMedia = logoDarkSrc.media;
      logoDarkSrc.media = "none";
      break;
    default:
      if (logoDarkSrc.origMedia) {
        logoDarkSrc.media = logoDarkSrc.origMedia;
      }
      break;
  }
}
