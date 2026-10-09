import type { ReactNode } from "react";
import { sfx } from "@/lib/utils/audio";
export default function Btn({ icon, children, onClick, main, disabled, className = "" }: { icon?: ReactNode; children: ReactNode; onClick?: () => void; main?: boolean; disabled?: boolean; className?: string }) {
  return <button disabled={disabled} onMouseEnter={() => !disabled && sfx("hover")} onClick={() => { sfx("click"); onClick?.(); }} className={`gbtn flex items-center gap-3 ${main ? "gbtn-main" : ""} ${className}`}>{icon}{children}</button>;
}
