import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { client_id, quantite = 1 } = await req.json();
  if (!client_id) return NextResponse.json({ error: "client_id requis" }, { status: 400 });

  // Récupère le client et la config roue
  const [{ data: client }, { data: config }] = await Promise.all([
    supabaseAdmin.from("clients").select("*").eq("id", client_id).single(),
    supabaseAdmin.from("roue_config").select("seuil_boissons").eq("id", "default").single(),
  ]);

  if (!client) return NextResponse.json({ error: "Client introuvable" }, { status: 404 });

  const seuil = config?.seuil_boissons ?? 5;
  const nouvDepuis = client.boissons_depuis_derniere_roue + quantite;
  const toursGagnes = Math.floor(nouvDepuis / seuil);
  const reste = nouvDepuis % seuil;

  const { data: updated, error } = await supabaseAdmin
    .from("clients")
    .update({
      boissons_total: client.boissons_total + quantite,
      boissons_depuis_derniere_roue: reste,
      tours_disponibles: client.tours_disponibles + toursGagnes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", client_id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ client: updated, tours_gagnes: toursGagnes });
}
