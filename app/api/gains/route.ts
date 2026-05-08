import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// Jouer la roue
export async function POST(req: NextRequest) {
  const { client_id } = await req.json();
  if (!client_id) return NextResponse.json({ error: "client_id requis" }, { status: 400 });

  const [{ data: client }, { data: config }] = await Promise.all([
    supabaseAdmin.from("clients").select("*").eq("id", client_id).single(),
    supabaseAdmin.from("roue_config").select("*").eq("id", "default").single(),
  ]);

  if (!client) return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
  if (!client.tours_disponibles || client.tours_disponibles <= 0) {
    return NextResponse.json({ error: "Aucun tour disponible" }, { status: 400 });
  }

  // Tirage selon probabilités
  const lots = config?.lots ?? [];
  const total = lots.reduce((s: number, l: { probabilite: number }) => s + l.probabilite, 0);
  let rand = Math.random() * total;
  let lot = lots[0];
  for (const l of lots) {
    rand -= l.probabilite;
    if (rand <= 0) { lot = l; break; }
  }

  // Décrémenter le tour
  await supabaseAdmin
    .from("clients")
    .update({ tours_disponibles: client.tours_disponibles - 1, updated_at: new Date().toISOString() })
    .eq("id", client_id);

  // Enregistrer le gain (seulement si ce n'est pas "rien")
  let gain = null;
  if (lot.valeur) {
    const { data } = await supabaseAdmin
      .from("gains")
      .insert({ client_id, lot_label: lot.label, lot_valeur: lot.valeur })
      .select()
      .single();
    gain = data;
  }

  return NextResponse.json({ lot, gain });
}

// Lister les gains en attente
export async function GET(req: NextRequest) {
  const statut = req.nextUrl.searchParams.get("statut") ?? "en_attente";
  const { data, error } = await supabaseAdmin
    .from("gains")
    .select("*, clients(phone)")
    .eq("statut", statut)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
