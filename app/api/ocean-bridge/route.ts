import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Мост Океана: меняет next-auth сессию (Google/Apple) на веб-токен бэкенда.
// Подпись HMAC'ом с AUTH_BRIDGE_SECRET — секрет живёт только на серверах,
// браузер получает уже готовый токен (12_OCEAN.md).
const OCEAN_API =
  (process.env.NEXT_PUBLIC_AI_API ?? "https://terenlabs-production.up.railway.app/chat").replace(
    /\/chat$/,
    ""
  ) + "/api/ocean";

export async function POST() {
  const session = await auth();
  // поля моста кладутся в сессию в auth.ts → callbacks
  const provider = (session as { oceanProvider?: string } | null)?.oceanProvider;
  const providerUid = (session as { oceanProviderUid?: string } | null)?.oceanProviderUid;
  if (!session || !provider || !providerUid) {
    return NextResponse.json({ error: "нет сессии" }, { status: 401 });
  }
  const secret = process.env.AUTH_BRIDGE_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "мост не сконфигурирован" }, { status: 503 });
  }

  const payload = {
    provider,
    provider_uid: providerUid,
    name: session.user?.name ?? null,
    email: session.user?.email ?? null,
  };
  // canonical-json: sorted keys, без пробелов — зеркало verify_bridge_signature
  const canonical = JSON.stringify(
    Object.fromEntries(Object.entries(payload).sort(([a], [b]) => (a < b ? -1 : 1)))
  );
  const signature = crypto.createHmac("sha256", secret).update(canonical).digest("hex");

  const res = await fetch(OCEAN_API + "/auth/bridge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ payload, signature }),
    cache: "no-store",
  });
  if (!res.ok) {
    return NextResponse.json({ error: "bridge failed" }, { status: res.status });
  }
  return NextResponse.json(await res.json());
}
