import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { listingId } = (await request.json()) as { listingId?: string };
    if (!listingId) {
      return NextResponse.json({ error: "Listing is required." }, { status: 400 });
    }
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe is not configured." }, { status: 500 });
    }

    const supabase = createSupabaseServerClient();
    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("id,title,price,seller_email,status")
      .eq("id", listingId)
      .maybeSingle();
    if (listingError || !listing) {
      return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    }
    if (listing.status === "sold") {
      return NextResponse.json({ error: "This item has already been sold." }, { status: 409 });
    }

    const { data: seller, error: sellerError } = await supabase
      .from("seller_accounts")
      .select("stripe_account_id,charges_enabled")
      .eq("email", listing.seller_email)
      .maybeSingle();
    if (sellerError || !seller?.stripe_account_id) {
      return NextResponse.json({ error: "This seller has not connected Stripe." }, { status: 409 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    if (!seller.charges_enabled) {
      const account = await stripe.accounts.retrieve(seller.stripe_account_id);
      if (!account.charges_enabled) {
        return NextResponse.json({ error: "The seller has not finished Stripe onboarding." }, { status: 409 });
      }
    }

    const amount = Math.round(Number(listing.price) * 100);
    if (!Number.isFinite(amount) || amount < 50) {
      return NextResponse.json({ error: "The listing price must be at least $0.50." }, { status: 400 });
    }
    const applicationFee = Math.round(amount * 0.1);
    const origin = request.headers.get("origin") || new URL(request.url).origin;

    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        line_items: [{
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: amount,
            product_data: { name: listing.title },
          },
        }],
        payment_intent_data: { application_fee_amount: applicationFee },
        metadata: {
          listing_id: listing.id,
          seller_email: listing.seller_email,
          stripe_account_id: seller.stripe_account_id,
        },
        success_url: `${origin}/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/item/${listing.id}`,
      },
      { stripeAccount: seller.stripe_account_id },
    );

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create checkout.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
