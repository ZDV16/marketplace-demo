import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook is not configured." }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature." }, { status: 400 });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      await request.text(),
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const listingId = session.metadata?.listing_id;
    const sellerEmail = session.metadata?.seller_email;
    const stripeAccountId = session.metadata?.stripe_account_id;
    if (!listingId || !sellerEmail || !stripeAccountId) {
      return NextResponse.json({ received: true });
    }

    const { data: listing } = await supabase
      .from("listings")
      .select("id,status")
      .eq("id", listingId)
      .maybeSingle();
    if (!listing) return NextResponse.json({ received: true });

    const amount = session.amount_total || 0;
    const applicationFee = Math.round(amount * 0.1);
    await supabase.from("orders").upsert({
      listing_id: listingId,
      checkout_session_id: session.id,
      payment_intent_id: typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id || null,
      stripe_account_id: stripeAccountId,
      seller_email: sellerEmail,
      buyer_email: session.customer_details?.email || null,
      amount_cents: amount,
      application_fee_cents: applicationFee,
      currency: session.currency || "usd",
      status: "paid",
    }, { onConflict: "checkout_session_id" });

    await supabase.from("listings").update({ status: "sold" }).eq("id", listingId);
  }

  if (event.type === "account.updated") {
    const account = event.data.object as Stripe.Account;
    await supabase
      .from("seller_accounts")
      .update({
        charges_enabled: Boolean(account.charges_enabled),
        details_submitted: Boolean(account.details_submitted),
      })
      .eq("stripe_account_id", account.id);
  }

  return NextResponse.json({ received: true });
}
