"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ConnectCompletePage() {
  const [email, setEmail] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sellerEmail = params.get("email") || "";
    setEmail(sellerEmail);

    if (!supabase || !sellerEmail) return;
    supabase
      .from("seller_accounts")
      .select("charges_enabled,details_submitted")
      .eq("email", sellerEmail)
      .maybeSingle()
      .then(({ data }) => setReady(Boolean(data?.charges_enabled)));
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] px-5">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-600">✓</div>
        <h1 className="mt-5 text-2xl font-bold">Onboarding complete</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {ready
            ? "Stripe has enabled payments for this seller."
            : "Stripe is verifying the account. Your listings can take payment once Stripe enables payouts."}
        </p>
        {email && <p className="mt-2 text-xs font-semibold text-slate-400">{email}</p>}
        <Link href="/" className="mt-6 inline-flex h-11 items-center rounded-xl bg-[#1d72f2] px-5 text-sm font-bold text-white">Return to marketplace</Link>
      </div>
    </main>
  );
}
