import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const REFERENCE_PATTERN = /^[0-9a-f]{8}$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NOT_FOUND_MESSAGE = "We could not find an order with that reference and email.";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const body = await req.json().catch(() => null);
    const reference = typeof body?.reference === "string" ? body.reference.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim().slice(0, 254) : "";
    if (!REFERENCE_PATTERN.test(reference) || !EMAIL_PATTERN.test(email)) {
      return json({ error: "Please enter your 8-character order reference and the email you ordered with." }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: orders, error } = await supabase
      .from("orders")
      .select("id, status, total_cents, created_at, order_items(product_name, unit_price_cents, quantity)")
      .ilike("customer_email", email.replace(/[\\%_]/g, (c) => "\\" + c))
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;

    const wanted = reference.toLowerCase();
    const order = (orders ?? []).find((row) => row.id.slice(0, 8).toLowerCase() === wanted);
    if (!order) {
      return json({ error: NOT_FOUND_MESSAGE }, 404);
    }

    return json({
      reference: wanted.toUpperCase(),
      status: order.status,
      totalCents: order.total_cents,
      createdAt: order.created_at,
      items: order.order_items,
    });
  } catch (err) {
    console.error("track-order failed", err);
    return json({ error: "We could not look up your order. Please try again." }, 500);
  }
});
