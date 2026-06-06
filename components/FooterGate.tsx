"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./Footer";

// В плеере курса футер не показываем — читалка занимает весь экран,
// хвост сайта под ней только отвлекает.
export function FooterGate() {
  const pathname = usePathname();
  if (pathname.startsWith("/learn/")) return null;
  return <Footer />;
}
