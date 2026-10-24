export const THEME_STORAGE_KEY = "orbit-theme";
export const THEME_CHANGE_EVENT = "orbit-theme-change";

// Run before paint so saved and system preferences do not flash the light theme.
export const themeInitializationScript = `(function(){var theme;try{theme=localStorage.getItem("orbit-theme")}catch(e){}document.documentElement.classList.toggle("dark",theme==="dark"||(theme!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches))})();`;
