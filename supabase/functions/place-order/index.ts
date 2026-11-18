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

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_ITEMS = 20;
const MAX_QUANTITY = 10;

type OrderItemInput = { productId: string; quantity: number };
type CustomerInput = { name: string; email: string; phone: string; address: string };

const readText = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

function parseCustomer(raw: unknown): CustomerInput | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;
  const customer = {
    name: readText(data.name, 100),
    email: readText(data.email, 254),
    phone: readText(data.phone, 30),
    address: readText(data.address, 500),
  };
  if (!customer.name || !customer.address || !EMAIL_PATTERN.test(customer.email)) return null;
  return customer;
}

function parseItems(raw: unknown): OrderItemInput[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_ITEMS) return null;
  const items: OrderItemInput[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") return null;
    const { productId, quantity } = entry as Record<string, unknown>;
    if (typeof productId !== "string" || !UUID_PATTERN.test(productId)) return null;
    if (!Number.isInteger(quantity) || (quantity as number) < 1 || (quantity as number) > MAX_QUANTITY) return null;
    items.push({ productId, quantity: quantity as number });
  }
  return items;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const body = await req.json().catch(() => null);
    const customer = parseCustomer(body?.customer);
    const items = parseItems(body?.items);
    if (!customer || !items) {
      return json({ error: "Please fill in your name, a valid email, and your address." }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const productIds = [...new Set(items.map((item) => item.productId))];
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, price_cents")
      .eq("active", true)
      .in("id", productIds);
    if (productsError) throw productsError;

    const productsById = new Map(products.map((product) => [product.id, product]));
    const lines = items.map((item) => {
      const product = productsById.get(item.productId);
      if (!product) return null;
      return {
        product_id: product.id,
        product_name: product.name,
        unit_price_cents: product.price_cents,
        quantity: item.quantity,
      };
    });
    if (lines.some((line) => line === null)) {
      return json({ error: "One of the products in your cart is no longer available." }, 400);
    }

    const validLines = lines as NonNullable<(typeof lines)[number]>[];
    const totalCents = validLines.reduce((sum, line) => sum + line.unit_price_cents * line.quantity, 0);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        shipping_address: customer.address,
        total_cents: totalCents,
      })
      .select("id")
      .single();
    if (orderError) throw orderError;

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(validLines.map((line) => ({ ...line, order_id: order.id })));
    if (itemsError) {
      await supabase.from("orders").delete().eq("id", order.id);
      throw itemsError;
    }

    return json({ orderId: order.id, totalCents }, 201);
  } catch (err) {
    console.error("place-order failed", err);
    return json({ error: "We could not place your order. Please try again." }, 500);
  }
});
