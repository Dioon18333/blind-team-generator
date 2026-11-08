import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Blind Team Generator",
  description: "Register privately. Get grouped randomly. Discover your team together."
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
