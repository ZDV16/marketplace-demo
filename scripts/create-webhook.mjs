import Stripe from "stripe";

const appUrl = process.argv[2];
if (!appUrl) {
  throw new Error("Usage: node --env-file=.env.local scripts/create-webhook.mjs https://your-app.vercel.app");
}
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is required.");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpoint = await stripe.webhookEndpoints.create({
  url: `${appUrl.replace(/\/$/, "")}/api/stripe/webhook`,
  connect: true,
  enabled_events: ["checkout.session.completed", "account.updated"],
});

console.log("Signing secret:", endpoint.secret);
