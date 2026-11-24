import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { email } = (await request.json()) as { email?: string };
    const normalizedEmail = email?.trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe is not configured." }, { status: 500 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const supabase = createSupabaseServerClient();
    const { data: existing } = await supabase
      .from("seller_accounts")
      .select("stripe_account_id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    const account =
      existing?.stripe_account_id
        ? await stripe.accounts.retrieve(existing.stripe_account_id)
        : await stripe.accounts.create({
            type: "express",
            country: "US",
            email: normalizedEmail,
            capabilities: {
              card_payments: { requested: true },
              transfers: { requested: true },
            },
          });

    if (!existing?.stripe_account_id) {
      const { error } = await supabase.from("seller_accounts").upsert({
        email: normalizedEmail,
        stripe_account_id: account.id,
        charges_enabled: Boolean(account.charges_enabled),
        details_submitted: Boolean(account.details_submitted),
      });
      if (error) throw error;
    }

    const origin = request.headers.get("origin") || new URL(request.url).origin;
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      type: "account_onboarding",
      refresh_url: `${origin}/stripe/connect?refresh=true&email=${encodeURIComponent(normalizedEmail)}`,
      return_url: `${origin}/stripe/connect/complete?email=${encodeURIComponent(normalizedEmail)}&account=${encodeURIComponent(account.id)}`,
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not start Stripe onboarding.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
