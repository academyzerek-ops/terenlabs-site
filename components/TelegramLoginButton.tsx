import Link from "next/link";

/**
 * Кнопка входа через Telegram — фирменный самолётик вместо надписи
 * (Адиль 17.07: «значок поставить — и сразу понятно, через что вход»).
 * Официальный градиент Telegram #2AABEE→#229ED9; только transform/opacity
 * на ховере (WebKit-канон сайта).
 */
export function TelegramLoginButton({ label = "Войти через Telegram" }: { label?: string }) {
  return (
    <Link
      href="/auth/sign-in"
      className="group inline-flex h-10 items-center gap-2.5 rounded-[8px] bg-accent-600 pl-3 pr-4 text-[15px] font-medium text-[#fff] transition-colors hover:bg-[#1b6fc2]"
    >
      <span className="flex items-center justify-center">
        <svg viewBox="0 0 240 240" className="h-5 w-5" aria-hidden="true">
          <path
            fill="currentColor"
            d="M44.7 121.5 194.9 63.6c7-2.6 13.1 1.6 10.8 12.2l-25.6 120.6c-1.9 8.5-7 10.6-14.1 6.6l-39-28.8-18.8 18.2c-2.1 2.1-3.8 3.8-7.8 3.8l2.8-39.8 72.3-65.3c3.1-2.8-.7-4.3-4.9-1.7l-89.4 56.3-38.5-12c-8.4-2.7-8.6-8.4 2-12.2Z"
          />
        </svg>
      </span>
      {label}
    </Link>
  );
}
