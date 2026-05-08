"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Evenement, Inscription } from "@/lib/types";

const TYPE_LABELS: Record<string, string> = {
  karaoke: "🎤 Karaoké",
  scene_ouverte: "🎸 Scène ouverte",
  autre: "📅 Événement",
};

function getSessionId() {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem("session_id");
  if (!id) {
    id = Math.random().toString(36).slice(2);
    sessionStorage.setItem("session_id", id);
  }
  return id;
}

interface InscriptionWithVotes extends Inscription {
  votes: { count: number }[];
  voted?: boolean;
}

export default function EvenementsPage() {
  const [events, setEvents] = useState<Evenement[]>([]);
  const [selected, setSelected] = useState<Evenement | null>(null);
  const [inscriptions, setInscriptions] = useState<InscriptionWithVotes[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nom: "", instrument: "", commentaire: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch("/api/evenements")
      .then((r) => r.json())
      .then((d) => { setEvents(d); setLoading(false); });
  }, []);

  const selectEvent = async (ev: Evenement) => {
    setSelected(ev);
    setShowForm(false);
    setSubmitted(false);
    const res = await fetch(`/api/inscriptions?evenement_id=${ev.id}`);
    const data: InscriptionWithVotes[] = await res.json();
    const sid = getSessionId();
    // Vérifier les votes
    const withVotes = await Promise.all(
      data.map(async (insc) => {
        const vRes = await fetch(`/api/votes?inscription_id=${insc.id}&session_id=${sid}`).catch(() => null);
        return insc;
      })
    );
    setInscriptions(withVotes);
  };

  const vote = async (insc: InscriptionWithVotes) => {
    const sid = getSessionId();
    const res = await fetch("/api/votes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inscription_id: insc.id, evenement_id: selected!.id, session_id: sid }),
    });
    const data = await res.json();
    setInscriptions((prev) =>
      prev.map((i) => {
        if (i.id !== insc.id) return i;
        const delta = data.action === "added" ? 1 : -1;
        return {
          ...i,
          voted: data.action === "added",
          votes: [{ count: (i.votes?.[0]?.count ?? 0) + delta }],
        };
      })
    );
  };

  const submitInscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    await fetch("/api/inscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, evenement_id: selected.id }),
    });
    setSubmitting(false);
    setSubmitted(true);
    setShowForm(false);
    selectEvent(selected);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="text-2xl animate-pulse" style={{ color: "var(--gold)" }}>🎤</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      <header className="flex items-center justify-between px-4 pt-8 pb-4">
        <Link href="/client" className="text-sm" style={{ color: "var(--cream-muted)" }}>
          ← Retour
        </Link>
        <h1 className="text-lg font-bold" style={{ color: "var(--gold)" }}>
          Événements
        </h1>
        <div className="w-12" />
      </header>

      <main className="flex-1 px-4 pb-16 max-w-sm mx-auto w-full flex flex-col gap-4">
        {events.length === 0 ? (
          <div
            className="rounded-2xl p-8 text-center"
            style={{ background: "var(--bg-card)", border: "1px solid var(--bg-elevated)" }}
          >
            <p className="text-3xl mb-3">🎵</p>
            <p style={{ color: "var(--cream-muted)" }}>Aucun événement prévu pour le moment.</p>
            <p className="text-sm mt-1" style={{ color: "var(--cream-muted)" }}>Revenez bientôt !</p>
          </div>
        ) : (
          events.map((ev) => (
            <button
              key={ev.id}
              onClick={() => selectEvent(ev)}
              className="w-full text-left rounded-2xl p-5 transition-all active:scale-95"
              style={{
                background: selected?.id === ev.id ? "var(--wine)" : "var(--bg-card)",
                border: `1px solid ${selected?.id === ev.id ? "var(--wine-light)" : "var(--bg-elevated)"}`,
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ background: "var(--bg-elevated)", color: "var(--gold)" }}
                  >
                    {TYPE_LABELS[ev.type] ?? ev.type}
                  </span>
                  <h3 className="font-semibold mt-2" style={{ color: "var(--cream)" }}>{ev.titre}</h3>
                  {ev.description && (
                    <p className="text-sm mt-0.5" style={{ color: "var(--cream-muted)" }}>{ev.description}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <p className="text-sm font-semibold" style={{ color: "var(--gold)" }}>
                    {new Date(ev.date).toLocaleDateString("fr-CH", { day: "numeric", month: "short" })}
                  </p>
                  <p className="text-xs" style={{ color: "var(--cream-muted)" }}>{ev.heure.slice(0, 5)}</p>
                </div>
              </div>
            </button>
          ))
        )}

        {/* Panneau événement sélectionné */}
        {selected && (
          <div
            className="rounded-2xl p-5 flex flex-col gap-4"
            style={{ background: "var(--bg-card)", border: "1px solid var(--gold-dark)" }}
          >
            <h2 className="font-bold text-lg" style={{ color: "var(--gold)" }}>{selected.titre}</h2>

            {selected.type === "scene_ouverte" && (
              <>
                {/* Liste des inscrits */}
                {inscriptions.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs uppercase tracking-wider" style={{ color: "var(--cream-muted)" }}>
                      Artistes inscrits
                    </p>
                    {inscriptions.map((insc) => (
                      <div
                        key={insc.id}
                        className="flex justify-between items-center rounded-xl px-4 py-3"
                        style={{ background: "var(--bg-elevated)" }}
                      >
                        <div>
                          <p className="font-medium text-sm" style={{ color: "var(--cream)" }}>{insc.nom}</p>
                          {insc.instrument && (
                            <p className="text-xs" style={{ color: "var(--cream-muted)" }}>{insc.instrument}</p>
                          )}
                        </div>
                        <button
                          onClick={() => vote(insc)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all active:scale-95"
                          style={{
                            background: insc.voted ? "var(--gold)" : "var(--bg-card)",
                            color: insc.voted ? "var(--bg)" : "var(--cream-muted)",
                          }}
                        >
                          👏 {insc.votes?.[0]?.count ?? 0}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Formulaire inscription */}
                {submitted ? (
                  <div className="text-center py-3">
                    <p className="text-xl">🎉</p>
                    <p className="font-semibold" style={{ color: "var(--gold)" }}>Tu es inscrit·e !</p>
                    <p className="text-sm mt-1" style={{ color: "var(--cream-muted)" }}>À bientôt sur scène !</p>
                  </div>
                ) : showForm ? (
                  <form onSubmit={submitInscription} className="flex flex-col gap-3">
                    <p className="text-sm font-semibold" style={{ color: "var(--cream)" }}>S'inscrire à la scène ouverte</p>
                    {["nom", "instrument", "commentaire", "phone"].map((field) => (
                      <input
                        key={field}
                        type={field === "phone" ? "tel" : "text"}
                        placeholder={
                          field === "nom" ? "Ton prénom *" :
                          field === "instrument" ? "Ton instrument / style" :
                          field === "commentaire" ? "Note (optionnel)" :
                          "Ton numéro (optionnel)"
                        }
                        value={(formData as Record<string, string>)[field]}
                        onChange={(e) => setFormData((prev) => ({ ...prev, [field]: e.target.value }))}
                        required={field === "nom"}
                        className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                        style={{
                          background: "var(--bg-elevated)",
                          color: "var(--cream)",
                          border: "1px solid var(--gold-dark)",
                        }}
                      />
                    ))}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="flex-1 py-2.5 rounded-xl text-sm"
                        style={{ background: "var(--bg-elevated)", color: "var(--cream-muted)" }}
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 py-2.5 rounded-xl font-semibold text-sm"
                        style={{ background: "var(--gold)", color: "var(--bg)" }}
                      >
                        {submitting ? "Envoi…" : "S'inscrire"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setShowForm(true)}
                    className="w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-95"
                    style={{ background: "var(--wine)", color: "var(--cream)" }}
                  >
                    🎸 Je veux jouer !
                  </button>
                )}
              </>
            )}

            {selected.type === "karaoke" && (
              <p className="text-sm" style={{ color: "var(--cream-muted)" }}>
                🎤 Viens chanter et amuse-toi ! Pas d'inscription nécessaire.
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
