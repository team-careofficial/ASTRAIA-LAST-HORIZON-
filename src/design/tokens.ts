/** Design tokens taken from approved concept art (design/reference). */
export const COLOR = {
  shadow0: "#25130B", shadow1: "#4B2515",
  rust: "#944921", rustDeep: "#652E15", dust: "#9A755E", light: "#DBA671",
  hairline: "#243A4C", panel: "#38404B",
  warn: "#FD4E54", ok: "#53CBB8", cyan: "#7FD6E8", /* cyan hologram: sampled by eye, refine when built */
} as const;
export const FONT = {
  heading: "'Barlow Condensed', sans-serif",
  mono: "'IBM Plex Mono', monospace",
} as const;
/** Rules that stop the UI drifting back to a generic look. */
export const RULES = [
  "No rounded cards, no glass blur, no neon, no purple gradients.",
  "Numbers live ON the object (pencil leader lines), gauges are analog dials.",
  "Warm tungsten vs cool LED light; teal-and-amber grade; film grain.",
] as const;
