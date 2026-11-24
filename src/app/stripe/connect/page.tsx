"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function ConnectStripePage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/stripe/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not start onboarding.");
      window.location.assign(data.url);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not start onboarding.");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] px-5">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <Link href="/" className="text-sm font-bold text-[#1d72f2]">← Back to marketplace</Link>
        <h1 className="mt-6 text-3xl font-bold tracking-[-.04em]">Connect with Stripe</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Enter the same email used on your listings. Stripe will open in sandbox mode so you can complete seller onboarding with test details.
        </p>
        <form onSubmit={submit} className="mt-7 space-y-4">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-bold">Seller email</label>
            <input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="seller@example.com" className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#1d72f2] focus:ring-4 focus:ring-blue-100" />
          </div>
          {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{error}</p>}
          <button type="submit" disabled={loading} className="h-12 w-full rounded-xl bg-[#635bff] text-sm font-bold text-white shadow-sm hover:bg-[#554dcf] disabled:opacity-60">
            {loading ? "Opening Stripe..." : "Connect with Stripe"}
          </button>
        </form>
      </div>
    </main>
  );
}
