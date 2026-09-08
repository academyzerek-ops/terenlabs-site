"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Arrow } from "@/components/Button";
import { OCEAN_API, getOceanToken } from "@/lib/ocean";

// Ссылка на админку показывается только админу: бэкенд отдаёт is_admin в /me/rank
// (почта входа в ADMIN_EMAILS или id в ADMIN_USER_IDS). Остальным блока нет вовсе.
export function AdminLink() {
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    const token = getOceanToken();
    if (!token) return;
    fetch(OCEAN_API + "/me/rank", { headers: { Authorization: `web ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setIsAdmin(Boolean(d?.is_admin)))
      .catch(() => setIsAdmin(false));
  }, []);
  if (!isAdmin) return null;
  return (
    <div className="panel mt-6 flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
      <div>
        <p className="eyebrow">Администратор</p>
        <p className="mt-1 text-[14px] text-text-2">Ученики: уровни, попытки, путь каждого человека.</p>
      </div>
      <Link href="/admin" className="link text-[14px] font-medium">
        Открыть админку <Arrow />
      </Link>
    </div>
  );
}
