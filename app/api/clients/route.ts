import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get("phone");
  if (!phone) return NextResponse.json({ error: "phone requis" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("clients")
    .select("*")
    .eq("phone", phone)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    // Créer le client
    const { data: newClient, error: createError } = await supabaseAdmin
      .from("clients")
      .insert({ phone })
      .select()
      .single();
    if (createError) return NextResponse.json({ error: createError.message }, { status: 500 });
    return NextResponse.json(newClient);
  }

  return NextResponse.json(data);
}
