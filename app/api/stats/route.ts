import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const [
    { count: totalClients },
    { count: totalGains },
    { count: gainsEnAttente },
    { data: topClients },
    { data: recentGains },
  ] = await Promise.all([
    supabaseAdmin.from("clients").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("gains").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("gains").select("*", { count: "exact", head: true }).eq("statut", "en_attente"),
    supabaseAdmin
      .from("clients")
      .select("phone, boissons_total")
      .order("boissons_total", { ascending: false })
      .limit(5),
    supabaseAdmin
      .from("gains")
      .select("*, clients(phone)")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  // Total boissons
  const { data: boissonsData } = await supabaseAdmin
    .from("clients")
    .select("boissons_total");
  const totalBoissons = boissonsData?.reduce((s, c) => s + c.boissons_total, 0) ?? 0;

  return NextResponse.json({
    totalClients,
    totalBoissons,
    totalGains,
    gainsEnAttente,
    topClients,
    recentGains,
  });
}
