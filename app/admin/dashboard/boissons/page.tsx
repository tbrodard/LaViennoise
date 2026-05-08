"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Client } from "@/lib/types";

interface GainWithClient {
  id: string;
  lot_label: string;
  lot_valeur: string;
  statut: string;
  created_at: string;
  clients: { phone: string };
  client_id: string;
}

export default function AdminBoissons() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [client, setClient] = useState<Client | null>(null);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);
  const [gains, setGains] = useState<GainWithClient[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && !sessionStorage.getItem("admin_auth")) {
      router.replace("/admin");
    }
    loadGains();
  }, [router]);

  const loadGains = async () => {
    const res = await fetch("/api/gains?statut=en_attente");
    const data = await res.json();
    setGains(Array.isArray(data) ? data : []);
  };

  const searchClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    setMessage("");
    setClient(null);
    const res = await fetch(`/api/clients?phone=${encodeURIComponent(phone)}`);
    const data = await res.json();
    if (data.id) setClient(data);
    else setMessage("Client non trouvé");
    setSearching(false);
  };

  const addBoissons = async (qty: number) => {
    if (!client) return;
    setAdding(true);
    const res = await fetch("/api/boissons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: client.id, quantite: qty }),
    });
    const data = await res.json();
    setClient(data.client);
    if (data.tours_gagnes > 0) {
      setMessage(`🎉 +${qty} boisson${qty > 1 ? "s" : ""} — ${data.tours_gagnes} tour${data.tours_gagnes > 1 ? "s" : ""} de roue débloqué${data.tours_gagnes > 1 ? "s" : ""} !`);
    } else {
      setMessage(`✅ +${qty} boisson${qty > 1 ? "s" : ""} ajoutée${qty > 1 ? "s" : ""}`);
    }
    setAdding(false);
  };

  const validerGain = async (id: string, statut: "valide" | "refuse") => {
    await fetch(`/api/gains/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut }),
    });
    setGains((prev) => prev.filter((g) => g.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      <header className="flex items-center justify-between px-4 pt-8 pb-4">
        <Link href="/admin/dashboard" className="text-sm" style={{ color: "var(--cream-muted)" }}>← Retour</Link>
        <h1 className="text-lg font-bold" style={{ color: "var(--gold)" }}>🍺 Boissons & Gains</h1>
        <div className="w-12" />
      </header>

      <main className="flex-1 px-4 pb-16 max-w-sm mx-auto w-full flex flex-col gap-5">
        {/* Recherche client */}
        <div className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--bg-elevated)" }}>
          <p className="font-semibold mb-3" style={{ color: "var(--cream)" }}>Créditer un client</p>
          <form onSubmit={searchClient} className="flex gap-2">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Numéro de téléphone"
              className="flex-1 rounded-xl px-3 py-2.5 text-sm outline-none"
              style={{ background: "var(--bg-elevated)", color: "var(--cream)", border: "1px solid var(--gold-dark)" }}
            />
            <button
              type="submit"
              disabled={searching}
              className="px-4 py-2.5 rounded-xl font-semibold text-sm"
              style={{ background: "var(--gold)", color: "var(--bg)" }}
            >
              {searching ? "…" : "Chercher"}
            </button>
          </form>

          {message && (
            <p className="text-sm mt-3 text-center font-medium" style={{ color: "var(--gold-light)" }}>{message}</p>
          )}

          {client && (
            <div className="mt-4">
              <div className="rounded-xl p-4 mb-4" style={{ background: "var(--bg-elevated)" }}>
                <p className="font-semibold text-sm" style={{ color: "var(--cream)" }}>{client.phone}</p>
                <div className="flex gap-4 mt-2 text-xs" style={{ color: "var(--cream-muted)" }}>
                  <span>🍺 {client.boissons_total} total</span>
                  <span>🎰 {client.tours_disponibles} tour{client.tours_disponibles !== 1 ? "s" : ""}</span>
                  <span>📈 {client.boissons_depuis_derniere_roue} en cours</span>
                </div>
              </div>

              <div className="flex gap-2">
                {[1, 2, 3].map((n) => (
                  <button
                    key={n}
                    onClick={() => addBoissons(n)}
                    disabled={adding}
                    className="flex-1 py-3 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50"
                    style={{ background: "var(--wine)", color: "var(--cream)" }}
                  >
                    +{n}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Gains en attente */}
        <div className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--bg-elevated)" }}>
          <div className="flex justify-between items-center mb-3">
            <p className="font-semibold" style={{ color: "var(--cream)" }}>🏆 Gains en attente</p>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-bold"
              style={{ background: "var(--wine)", color: "var(--cream)" }}
            >
              {gains.length}
            </span>
          </div>

          {gains.length === 0 ? (
            <p className="text-sm text-center py-4" style={{ color: "var(--cream-muted)" }}>Aucun gain en attente</p>
          ) : (
            <div className="flex flex-col gap-3">
              {gains.map((g) => (
                <div key={g.id} className="rounded-xl p-4" style={{ background: "var(--bg-elevated)" }}>
                  <p className="text-xs mb-0.5" style={{ color: "var(--cream-muted)" }}>{g.clients?.phone}</p>
                  <p className="font-semibold" style={{ color: "var(--gold)" }}>{g.lot_label}</p>
                  <p className="text-xs mb-3" style={{ color: "var(--cream-muted)" }}>
                    {new Date(g.created_at).toLocaleString("fr-CH")}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => validerGain(g.id, "valide")}
                      className="flex-1 py-2 rounded-lg text-sm font-semibold"
                      style={{ background: "var(--success)", color: "white" }}
                    >
                      ✓ Valider
                    </button>
                    <button
                      onClick={() => validerGain(g.id, "refuse")}
                      className="flex-1 py-2 rounded-lg text-sm font-semibold"
                      style={{ background: "var(--bg-card)", color: "var(--cream-muted)" }}
                    >
                      ✗ Refuser
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
