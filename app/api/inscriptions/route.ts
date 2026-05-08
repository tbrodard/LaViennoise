import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const evenement_id = req.nextUrl.searchParams.get("evenement_id");
  if (!evenement_id) return NextResponse.json({ error: "evenement_id requis" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("inscriptions")
    .select("*, votes(count)")
    .eq("evenement_id", evenement_id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { data, error } = await supabaseAdmin
    .from("inscriptions")
    .insert(body)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
