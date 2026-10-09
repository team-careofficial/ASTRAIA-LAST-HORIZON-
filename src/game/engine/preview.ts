import { useSyncExternalStore } from "react";
import type { Dest } from "@/data/design/options";
/** Which world the backdrop shows while the player hovers a destination card. */
let v: Dest | null = null; const ls = new Set<() => void>();
export const preview = { get: () => v, set: (d: Dest | null) => { if (d === v) return; v = d; ls.forEach(l => l()); } };
export const usePreview = () => useSyncExternalStore(cb => { ls.add(cb); return () => { ls.delete(cb); }; }, () => v, () => v);
