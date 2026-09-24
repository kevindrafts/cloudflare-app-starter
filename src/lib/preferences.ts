export type Preferences = {
  theme: "light" | "dark";
  density: "comfortable" | "compact";
};
export function readPreferences(): Preferences {
  try {
    const value = JSON.parse(localStorage.getItem("forma-preferences") || "{}");
    return {
      theme: value?.theme === "dark" ? "dark" : "light",
      density: value?.density === "compact" ? "compact" : "comfortable",
    };
  } catch {
    return { theme: "light", density: "comfortable" };
  }
}
export function applyPreferences(value: Preferences) {
  document.documentElement.classList.toggle("dark", value.theme === "dark");
  document.documentElement.dataset.density = value.density;
  const color = getComputedStyle(document.documentElement)
    .getPropertyValue("--primary")
    .trim();
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", color);
}
export function savePreferences(value: Preferences) {
  localStorage.setItem("forma-preferences", JSON.stringify(value));
  applyPreferences(value);
}
