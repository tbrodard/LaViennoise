import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { inscription_id, evenement_id, session_id } = await req.json();

  // Vérifier si déjà voté
  const { data: existing } = await supabaseAdmin
    .from("votes")
    .select("id")
    .eq("inscription_id", inscription_id)
    .eq("session_id", session_id)
    .single();

  if (existing) {
    // Retirer le vote
    await supabaseAdmin.from("votes").delete().eq("id", existing.id);
    return NextResponse.json({ action: "removed" });
  }

  const { error } = await supabaseAdmin
    .from("votes")
    .insert({ inscription_id, evenement_id, session_id });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ action: "added" });
}
