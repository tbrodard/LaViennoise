"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { RouteLot } from "@/lib/types";

const COLORS = ["#7C2D3E", "#D4A847", "#A87C2A", "#E8671C", "#9E3D52", "#E8C876", "#4CAF7D", "#5B8FD4"];

export default function AdminRoue() {
  const router = useRouter();
  const [seuil, setSeuil] = useState(5);
  const [lots, setLots] = useState<RouteLot[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !sessionStorage.getItem("admin_auth")) {
      router.replace("/admin");
    }
    fetch("/api/roue-config")
      .then((r) => r.json())
      .then((d) => { setSeuil(d.seuil_boissons); setLots(d.lots ?? []); });
  }, [router]);

  const updateLot = (id: string, field: keyof RouteLot, value: string | number) => {
    setLots((prev) => prev.map((l) => l.id === id ? { ...l, [field]: value } : l));
  };

  const addLot = () => {
    setLots((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        label: "Nouveau lot",
        valeur: "",
        probabilite: 10,
        couleur: COLORS[prev.length % COLORS.length],
      },
    ]);
  };

  const removeLot = (id: string) => setLots((prev) => prev.filter((l) => l.id !== id));

  const save = async () => {
    setSaving(true);
    await fetch("/api/roue-config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seuil_boissons: seuil, lots }),
    });
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const totalProba = lots.reduce((s, l) => s + Number(l.probabilite), 0);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      <header className="flex items-center justify-between px-4 pt-8 pb-4">
        <Link href="/admin/dashboard" className="text-sm" style={{ color: "var(--cream-muted)" }}>← Retour</Link>
        <h1 className="text-lg font-bold" style={{ color: "var(--gold)" }}>🎰 Config. Roue</h1>
        <div className="w-12" />
      </header>

      <main className="flex-1 px-4 pb-24 max-w-sm mx-auto w-full flex flex-col gap-5">
        {/* Seuil */}
        <div className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--bg-elevated)" }}>
          <p className="font-semibold mb-3" style={{ color: "var(--cream)" }}>Seuil de boissons</p>
          <p className="text-xs mb-3" style={{ color: "var(--cream-muted)" }}>
            Nombre de boissons pour débloquer un tour de roue
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSeuil((s) => Math.max(1, s - 1))}
              className="w-10 h-10 rounded-xl text-xl font-bold"
              style={{ background: "var(--bg-elevated)", color: "var(--cream)" }}
            >−</button>
            <span className="text-3xl font-bold flex-1 text-center" style={{ color: "var(--gold)" }}>
              {seuil}
            </span>
            <button
              onClick={() => setSeuil((s) => s + 1)}
              className="w-10 h-10 rounded-xl text-xl font-bold"
              style={{ background: "var(--bg-elevated)", color: "var(--cream)" }}
            >+</button>
          </div>
        </div>

        {/* Lots */}
        <div className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--bg-elevated)" }}>
          <div className="flex justify-between items-center mb-1">
            <p className="font-semibold" style={{ color: "var(--cream)" }}>Lots de la roue</p>
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: totalProba === 100 ? "var(--success)" : "var(--danger)", color: "white" }}
            >
              Total: {totalProba}%
            </span>
          </div>
          <p className="text-xs mb-4" style={{ color: "var(--cream-muted)" }}>
            Les probabilités doivent totaliser 100%
          </p>

          <div className="flex flex-col gap-4">
            {lots.map((lot) => (
              <div key={lot.id} className="rounded-xl p-4" style={{ background: "var(--bg-elevated)" }}>
                <div className="flex gap-2 mb-2">
                  <input
                    type="color"
                    value={lot.couleur}
                    onChange={(e) => updateLot(lot.id, "couleur", e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0.5"
                    style={{ background: "transparent" }}
                  />
                  <input
                    type="text"
                    value={lot.label}
                    onChange={(e) => updateLot(lot.id, "label", e.target.value)}
                    placeholder="Label affiché"
                    className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
                    style={{ background: "var(--bg-card)", color: "var(--cream)" }}
                  />
                  <button
                    onClick={() => removeLot(lot.id)}
                    className="px-2 rounded-lg text-sm"
                    style={{ color: "var(--danger)" }}
                  >✕</button>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs" style={{ color: "var(--cream-muted)" }}>Valeur interne</label>
                    <input
                      type="text"
                      value={lot.valeur}
                      onChange={(e) => updateLot(lot.id, "valeur", e.target.value)}
                      placeholder="(vide = rien)"
                      className="w-full rounded-lg px-3 py-1.5 text-sm outline-none mt-0.5"
                      style={{ background: "var(--bg-card)", color: "var(--cream)" }}
                    />
                  </div>
                  <div className="w-20">
                    <label className="text-xs" style={{ color: "var(--cream-muted)" }}>Proba %</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={lot.probabilite}
                      onChange={(e) => updateLot(lot.id, "probabilite", Number(e.target.value))}
                      className="w-full rounded-lg px-3 py-1.5 text-sm outline-none mt-0.5 text-center"
                      style={{ background: "var(--bg-card)", color: "var(--gold)" }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addLot}
            className="w-full mt-3 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: "var(--bg-elevated)", color: "var(--cream-muted)" }}
          >
            + Ajouter un lot
          </button>
        </div>
      </main>

      {/* Bouton sauvegarder fixe */}
      <div className="fixed bottom-6 left-4 right-4 max-w-sm mx-auto">
        <button
          onClick={save}
          disabled={saving || totalProba !== 100}
          className="w-full py-4 rounded-2xl font-bold text-base transition-all active:scale-95 disabled:opacity-50"
          style={{ background: saved ? "var(--success)" : "var(--gold)", color: "var(--bg)" }}
        >
          {saved ? "✓ Sauvegardé !" : saving ? "Sauvegarde…" : "Sauvegarder"}
        </button>
      </div>
    </div>
  );
}
