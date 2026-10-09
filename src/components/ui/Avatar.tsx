import type { CrewId } from "@/types";
const TONE: Record<CrewId, string> = { sarah: "#9bb8d4", ben: "#c9b79c", eva: "#f4a640", liam: "#d98a6a" };
export default function Avatar({ id, size = 44 }: { id: CrewId; size?: number }) {
  const c = TONE[id];
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" className="shrink-0">
      <defs><radialGradient id={`av-${id}`} cx=".5" cy=".3" r=".8"><stop offset="0" stopColor="#24406e" /><stop offset="1" stopColor="#0a1426" /></radialGradient></defs>
      <circle cx="24" cy="24" r="22.5" fill={`url(#av-${id})`} stroke={c} strokeWidth="1.5" />
      <path d="M7 42c2-9 9-12 17-12s15 3 17 12a22 22 0 0 1-34 0Z" fill="#cfd8e6" />
      <circle cx="24" cy="21" r="9" fill="none" stroke={c} strokeWidth="1.5" opacity=".9" />
      <circle cx="24" cy="21" r="7" fill="#d9a77d" opacity=".95" />
      {id === "ben" && <path d="M18 21h12M18 20h5v3h-5zM25 20h5v3h-5z" stroke="#0a1426" strokeWidth="1" fill="none" />}
      {id === "sarah" && <path d="M17 19c1-6 13-6 14 0-3-3-11-3-14 0Z" fill="#1a1020" />}
      <path d="M20 41h8" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
