import type { Metadata } from "next";

// Страницы входа/онбординга/коллбэка — служебные, поисковикам не нужны.
// onboarding и bridge-finish — клиентские компоненты и сами metadata экспортировать
// не могут, поэтому noindex ставим на уровне сегмента.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
