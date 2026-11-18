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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function codesMatch(provided: string, expected: string): boolean {
  if (provided.length !== expected.length) return false;
  let difference = 0;
  for (let index = 0; index < expected.length; index++) {
    difference |= provided.charCodeAt(index) ^ expected.charCodeAt(index);
  }
  return difference === 0;
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
    const email = typeof body?.email === "string" ? body.email.trim().slice(0, 254) : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const inviteCode = typeof body?.inviteCode === "string" ? body.inviteCode.trim() : "";

    if (!EMAIL_PATTERN.test(email) || password.length < 8 || password.length > 72 || !inviteCode) {
      return json({ error: "Please enter a valid email, a password of at least 8 characters, and your invite code." }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: invite, error: inviteError } = await supabase
      .from("owner_invite_codes")
      .select("code")
      .eq("id", 1)
      .maybeSingle();
    if (inviteError || !invite) {
      console.error("join-owner: invite code lookup failed", inviteError);
      return json({ error: "Owner sign up is not available right now." }, 500);
    }

    if (!codesMatch(inviteCode, invite.code)) {
      return json({ error: "That invite code is not right." }, 403);
    }

    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createError || !created.user) {
      console.error("join-owner: createUser failed", createError);
      return json({ error: "We could not create that account. Try another email, or sign in if you already joined." }, 400);
    }

    const { error: adminError } = await supabase
      .from("admins")
      .insert({ user_id: created.user.id });
    if (adminError) {
      console.error("join-owner: admin insert failed", adminError);
      await supabase.auth.admin.deleteUser(created.user.id);
      return json({ error: "Owner sign up is not available right now." }, 500);
    }

    return json({ ok: true }, 201);
  } catch (err) {
    console.error("join-owner failed", err);
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
});
