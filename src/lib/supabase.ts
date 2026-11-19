import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers:
            typeof window === "undefined"
              ? {}
              : { "x-visitor-id": getVisitorId() },
        },
      })
    : null;

export function getVisitorId() {
  if (typeof window === "undefined") return "";
  const key = "marketplace-visitor-id";
  let visitorId = window.localStorage.getItem(key);
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    window.localStorage.setItem(key, visitorId);
  }
  return visitorId;
}
