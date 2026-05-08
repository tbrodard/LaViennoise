"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Client, RoueConfig } from "@/lib/types";

export default function ClientDashboard() {
  const params = useParams();
  const router = useRouter();
  const phone = decodeURIComponent(params.phone as string);

  const [client, setClient] = useState<Client | null>(null);
  const [config, setConfig] = useState<RoueConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [cr, cc] = await Promise.all([
        fetch(`/api/clients?phone=${encodeURIComponent(phone)}`),
        fetch("/api/roue-config"),
      ]);
      const [c, conf] = await Promise.all([cr.json(), cc.json()]);
      if (!c.id) { router.push("/client"); return; }
      setClient(c);
      setConfig(conf);
      setLoading(false);
    };
    load();
  }, [phone, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="text-2xl animate-pulse" style={{ color: "var(--gold)" }}>☕</div>
      </div>
    );
  }

  const seuil = config?.seuil_boissons ?? 5;
  const depuis = client!.boissons_depuis_derniere_roue;
  const progression = Math.min((depuis / seuil) * 100, 100);
  const reste = seuil - depuis;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-8 pb-4">
        <button
          onClick={() => router.push("/client")}
          className="text-sm"
          style={{ color: "var(--cream-muted)" }}
        >
          ← Retour
        </button>
        <h1 className="text-lg font-bold" style={{ color: "var(--gold)" }}>
          La Viennoise
        </h1>
        <div className="w-12" />
      </header>

      <main className="flex-1 px-4 pb-16 flex flex-col gap-4 max-w-sm mx-auto w-full">
        {/* Salutation */}
        <div
          className="rounded-2xl p-5"
          style={{ background: "var(--bg-card)", border: "1px solid var(--gold-dark)" }}
        >
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--cream-muted)" }}>
            Ton numéro
          </p>
          <p className="font-semibold text-lg" style={{ color: "var(--cream)" }}>{phone}</p>
          <p className="text-xs mt-2" style={{ color: "var(--cream-muted)" }}>
            Membre depuis le{" "}
            {new Date(client!.created_at).toLocaleDateString("fr-CH", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Compteur boissons */}
        <div
          className="rounded-2xl p-5"
          style={{ background: "var(--bg-card)", border: "1px solid var(--gold-dark)" }}
        >
          <div className="flex justify-between items-center mb-3">
            <p className="font-semibold" style={{ color: "var(--cream)" }}>
              🍺 Boissons
            </p>
            <span className="text-2xl font-bold" style={{ color: "var(--gold)" }}>
              {client!.boissons_total}
            </span>
          </div>

          {/* Barre de progression */}
          <div className="mb-2">
            <div
              className="w-full h-3 rounded-full overflow-hidden"
              style={{ background: "var(--bg-elevated)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${progression}%`,
                  background: "linear-gradient(90deg, var(--gold-dark), var(--gold))",
                }}
              />
            </div>
            <div className="flex justify-between text-xs mt-1" style={{ color: "var(--cream-muted)" }}>
              <span>{depuis} / {seuil} vers la roue</span>
              {reste > 0 && <span>encore {reste} boisson{reste > 1 ? "s" : ""}</span>}
            </div>
          </div>

          {client!.tours_disponibles > 0 && (
            <p className="text-sm font-medium mt-1" style={{ color: "var(--gold-light)" }}>
              🎉 {client!.tours_disponibles} tour{client!.tours_disponibles > 1 ? "s" : ""} disponible{client!.tours_disponibles > 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* CTA Roue */}
        {client!.tours_disponibles > 0 ? (
          <Link
            href={`/client/${encodeURIComponent(phone)}/roue`}
            className="w-full py-4 rounded-2xl font-bold text-lg text-center transition-all active:scale-95"
            style={{
              background: "linear-gradient(135deg, var(--gold-dark), var(--gold), var(--gold-light))",
              color: "var(--bg)",
            }}
          >
            🎰 Tourner la roue !
          </Link>
        ) : (
          <div
            className="w-full py-4 rounded-2xl text-center opacity-60"
            style={{ background: "var(--bg-card)", border: "1px solid var(--bg-elevated)" }}
          >
            <p className="font-semibold" style={{ color: "var(--cream-muted)" }}>
              🎰 Roue bloquée
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--cream-muted)" }}>
              Commande encore {reste} boisson{reste > 1 ? "s" : ""} pour jouer
            </p>
          </div>
        )}

        {/* Événements */}
        <Link
          href="/evenements"
          className="w-full py-4 rounded-2xl font-semibold text-center transition-all active:scale-95"
          style={{ background: "var(--wine)", color: "var(--cream)" }}
        >
          🎤 Voir les événements
        </Link>
      </main>
    </div>
  );
}
