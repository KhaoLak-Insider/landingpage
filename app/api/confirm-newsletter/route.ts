import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import fs from "fs";
import path from "path";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "NO TOKEN" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const resend = new Resend(process.env.RESEND_API_KEY!);

  const { data } = await supabase
    .from("waitlist")
    .select("id, email")
    .eq("newsletter_token", token)
    .single();

  if (!data) {
    return NextResponse.json({ error: "INVALID" }, { status: 404 });
  }

  await supabase
    .from("waitlist")
    .update({ newsletter_confirmed: true })
    .eq("id", data.id);

  const html = fs.readFileSync(
    path.join(process.cwd(), "emails/WelcomeEmail.html"),
    "utf8"
  );

  await resend.emails.send({
    from: "Khao Lak Insider <onboarding@khaolak.app>",
    to: data.email,
    subject: "🌴 Willkommen im Khao Lak Insider",
    html,
  });

  return NextResponse.redirect(
    "https://khaolak.app/confirm-newsletter?status=success"
  );
}