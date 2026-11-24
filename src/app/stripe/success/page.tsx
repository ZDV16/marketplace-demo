"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type OrderStatus = "loading" | "paid" | "pending";

export default function StripeSuccessPage() {
  const [status, setStatus] = useState<OrderStatus>("loading");
  const [listingId, setListingId] = useState("");

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get("session_id");
    if (!sessionId) {
      setStatus("pending");
      return;
    }

    let attempts = 0;
    async function poll() {
      try {
        const response = await fetch(`/api/stripe/session?session_id=${encodeURIComponent(sessionId || "")}`);
        const data = await response.json();
        if (data.status === "paid") {
          setStatus("paid");
          setListingId(data.order?.listing_id || "");
          return;
        }
      } catch {
        // Keep polling briefly if the confirmation request is unavailable.
      }
      attempts += 1;
      if (attempts < 12) window.setTimeout(poll, 1000);
      else setStatus("pending");
    }
    poll();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] px-5">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-sm">
        <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full text-2xl ${status === "paid" ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-[#1d72f2]"}`}>
          {status === "paid" ? "✓" : "…"}
        </div>
        <h1 className="mt-5 text-2xl font-bold">{status === "paid" ? "Payment confirmed" : status === "pending" ? "Payment processing" : "Confirming payment..."}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {status === "paid"
            ? "Your order was recorded and the listing is now marked Sold."
            : "Please wait a moment while Stripe and Supabase confirm the order."}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          {listingId && <Link href={`/item/${listingId}`} className="h-11 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700">View item</Link>}
          <Link href="/" className="h-11 rounded-xl bg-[#1d72f2] px-5 py-3 text-sm font-bold text-white">Continue shopping</Link>
        </div>
      </div>
    </main>
  );
}
