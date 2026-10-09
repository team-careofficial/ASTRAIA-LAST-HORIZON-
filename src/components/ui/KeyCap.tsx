export const Key = ({ k }: { k: string }) => <kbd className="keycap">{k}</kbd>;
export const Hint = ({ keys, label }: { keys: string[]; label: string }) => <span className="inline-flex items-center gap-1 font-data text-[11px] tracking-widest text-white/70">{keys.map(k => <Key key={k} k={k} />)}<span className="ml-1">{label}</span></span>;
