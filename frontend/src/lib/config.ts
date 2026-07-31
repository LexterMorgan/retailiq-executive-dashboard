/** True when the dashboard loads pre-exported JSON instead of the Express API. */
export const USE_STATIC_DATA =
  import.meta.env.VITE_USE_STATIC === "true";

/** Base URL for static assets (supports GitHub Pages subpaths). */
export const ASSET_BASE = import.meta.env.BASE_URL;
