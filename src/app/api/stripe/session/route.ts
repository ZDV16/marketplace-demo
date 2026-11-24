import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");
  if (!sessionId) return NextResponse.json({ error: "Session is required." }, { status: 400 });
  if (!process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: "Stripe is not configured." }, { status: 500 });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.status !== "complete" || session.payment_status !== "paid") {
    return NextResponse.json({ status: "pending" });
  }

  const supabase = createSupabaseServerClient();
  const { data: order } = await supabase
    .from("orders")
    .select("listing_id,amount_cents,application_fee_cents,seller_email,status")
    .eq("checkout_session_id", sessionId)
    .maybeSingle();

  return NextResponse.json({ status: "paid", order });
}
