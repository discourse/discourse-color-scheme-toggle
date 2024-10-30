export default function (value) {
  switch (value) {
    case "dark":
      return "all";
    case "light":
      return "none";
    default:
      return "(prefers-color-scheme: dark)";
  }
}
