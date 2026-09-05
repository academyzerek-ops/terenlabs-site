"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/Container";
import { loginBridge } from "@/lib/ocean";

// После возврата из Google: обменять сессию next-auth на веб-токен Океана.
export default function BridgeFinish() {
  const router = useRouter();
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    loginBridge().then((auth) => {
      if (!auth) { setFailed(true); return; }
      router.replace(auth.needs_onboarding ? "/auth/onboarding" : "/dashboard");
    });
  }, [router]);
  return (
    <Container className="flex min-h-[60vh] items-center justify-center py-16">
      <div className="text-center text-[15px] text-text-2">
        {failed ? (
          <>
            Не удалось завершить вход.{" "}
            <Link href="/auth/sign-in" className="link">Попробовать снова</Link>
          </>
        ) : (
          "Завершаем вход…"
        )}
      </div>
    </Container>
  );
}
