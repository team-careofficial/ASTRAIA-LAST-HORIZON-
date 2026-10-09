import type { Metadata } from "next";
import { Michroma, Barlow_Semi_Condensed, JetBrains_Mono } from "next/font/google";
import "./globals.css";
// Three fonts only: display (titles), UI (menus and reading), mono (telemetry numbers).
const display = Michroma({ weight: "400", subsets: ["latin"], variable: "--font-display" });
const ui = Barlow_Semi_Condensed({ weight: ["400", "500", "600", "700"], subsets: ["latin"], variable: "--font-ui" });
const mono = JetBrains_Mono({ weight: ["400", "500", "700"], subsets: ["latin"], variable: "--font-mono" });
export const metadata: Metadata = { title: "ASTRAIA: LAST HORIZON", description: "A Moon and Mars mission design and exploration game." };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className={`${display.variable} ${ui.variable} ${mono.variable}`}><body>{children}</body></html>;
}
