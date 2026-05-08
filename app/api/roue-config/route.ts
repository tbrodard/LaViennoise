import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("roue_config")
    .select("*")
    .eq("id", "default")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { seuil_boissons, lots } = body;

  const { data, error } = await supabaseAdmin
    .from("roue_config")
    .update({ seuil_boissons, lots, updated_at: new Date().toISOString() })
    .eq("id", "default")
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
