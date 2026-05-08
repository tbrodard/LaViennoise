"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Evenement, Inscription } from "@/lib/types";

const TYPE_LABELS: Record<string, string> = {
  karaoke: "🎤 Karaoké",
  scene_ouverte: "🎸 Scène ouverte",
  autre: "📅 Autre",
};

export default function AdminEvenements() {
  const router = useRouter();
  const [events, setEvents] = useState<Evenement[]>([]);
  const [inscriptions, setInscriptions] = useState<Record<string, Inscription[]>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    titre: "", type: "scene_ouverte", date: "", heure: "20:00", description: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !sessionStorage.getItem("admin_auth")) {
      router.replace("/admin");
    }
    loadEvents();
  }, [router]);

  const loadEvents = async () => {
    const res = await fetch("/api/evenements");
    const data = await res.json();
    setEvents(Array.isArray(data) ? data : []);
  };

  const loadInscriptions = async (eventId: string) => {
    if (inscriptions[eventId]) return;
    const res = await fetch(`/api/inscriptions?evenement_id=${eventId}`);
    const data = await res.json();
    setInscriptions((prev) => ({ ...prev, [eventId]: Array.isArray(data) ? data : [] }));
  };

  const toggle = (id: string) => {
    if (expanded === id) {
      setExpanded(null);
    } else {
      setExpanded(id);
      loadInscriptions(id);
    }
  };

  const deleteEvent = async (id: string) => {
    await fetch(`/api/evenements/${id}`, { method: "DELETE" });
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const createEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/evenements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setEvents((prev) => [data, ...prev]);
    setShowForm(false);
    setForm({ titre: "", type: "scene_ouverte", date: "", heure: "20:00", description: "" });
    setSaving(false);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      <header className="flex items-center justify-between px-4 pt-8 pb-4">
        <Link href="/admin/dashboard" className="text-sm" style={{ color: "var(--cream-muted)" }}>← Retour</Link>
        <h1 className="text-lg font-bold" style={{ color: "var(--gold)" }}>🎤 Événements</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-sm px-3 py-1.5 rounded-full font-semibold"
          style={{ background: "var(--gold)", color: "var(--bg)" }}
        >
          + Ajouter
        </button>
      </header>

      <main className="flex-1 px-4 pb-16 max-w-sm mx-auto w-full flex flex-col gap-4">
        {/* Formulaire création */}
        {showForm && (
          <form onSubmit={createEvent} className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: "var(--bg-card)", border: "1px solid var(--gold-dark)" }}>
            <p className="font-semibold" style={{ color: "var(--cream)" }}>Nouvel événement</p>

            <input
              type="text"
              value={form.titre}
              onChange={(e) => setForm({ ...form, titre: e.target.value })}
              placeholder="Titre *"
              required
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
              style={{ background: "var(--bg-elevated)", color: "var(--cream)", border: "1px solid var(--gold-dark)" }}
            />

            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
              style={{ background: "var(--bg-elevated)", color: "var(--cream)", border: "1px solid var(--gold-dark)" }}
            >
              <option value="karaoke">Karaoké</option>
              <option value="scene_ouverte">Scène ouverte</option>
              <option value="autre">Autre</option>
            </select>

            <div className="flex gap-2">
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
                className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none"
                style={{ background: "var(--bg-elevated)", color: "var(--cream)", border: "1px solid var(--gold-dark)" }}
              />
              <input
                type="time"
                value={form.heure}
                onChange={(e) => setForm({ ...form, heure: e.target.value })}
                className="w-28 rounded-xl px-4 py-2.5 text-sm outline-none"
                style={{ background: "var(--bg-elevated)", color: "var(--cream)", border: "1px solid var(--gold-dark)" }}
              />
            </div>

            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Description (optionnel)"
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
              style={{ background: "var(--bg-elevated)", color: "var(--cream)", border: "1px solid var(--gold-dark)" }}
            />

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
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: "var(--gold)", color: "var(--bg)" }}
              >
                {saving ? "…" : "Créer"}
              </button>
            </div>
          </form>
        )}

        {/* Liste événements */}
        {events.length === 0 ? (
          <div className="rounded-2xl p-8 text-center" style={{ background: "var(--bg-card)" }}>
            <p style={{ color: "var(--cream-muted)" }}>Aucun événement</p>
          </div>
        ) : (
          events.map((ev) => (
            <div key={ev.id} className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--bg-elevated)" }}>
              <button onClick={() => toggle(ev.id)} className="w-full text-left p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs" style={{ color: "var(--gold)" }}>{TYPE_LABELS[ev.type]}</span>
                    <p className="font-semibold mt-0.5" style={{ color: "var(--cream)" }}>{ev.titre}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--cream-muted)" }}>
                      {new Date(ev.date).toLocaleDateString("fr-CH", { day: "numeric", month: "long" })} à {ev.heure.slice(0, 5)}
                    </p>
                  </div>
                  <span style={{ color: "var(--gold-dark)" }}>{expanded === ev.id ? "↑" : "↓"}</span>
                </div>
              </button>

              {expanded === ev.id && (
                <div className="px-5 pb-5 border-t" style={{ borderColor: "var(--bg-elevated)" }}>
                  {ev.type === "scene_ouverte" && (
                    <div className="mt-4">
                      <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--cream-muted)" }}>
                        Inscriptions ({inscriptions[ev.id]?.length ?? 0})
                      </p>
                      {inscriptions[ev.id]?.map((insc) => (
                        <div key={insc.id} className="flex items-center gap-3 py-2 border-b" style={{ borderColor: "var(--bg-elevated)" }}>
                          <div className="flex-1">
                            <p className="text-sm font-medium" style={{ color: "var(--cream)" }}>{insc.nom}</p>
                            {insc.instrument && <p className="text-xs" style={{ color: "var(--cream-muted)" }}>{insc.instrument}</p>}
                            {insc.commentaire && <p className="text-xs italic" style={{ color: "var(--cream-muted)" }}>{insc.commentaire}</p>}
                          </div>
                          {insc.phone && <p className="text-xs" style={{ color: "var(--cream-muted)" }}>{insc.phone}</p>}
                        </div>
                      ))}
                      {!inscriptions[ev.id]?.length && (
                        <p className="text-sm" style={{ color: "var(--cream-muted)" }}>Aucune inscription</p>
                      )}
                    </div>
                  )}
                  <button
                    onClick={() => deleteEvent(ev.id)}
                    className="mt-4 w-full py-2 rounded-xl text-sm"
                    style={{ background: "var(--bg-elevated)", color: "var(--danger)" }}
                  >
                    Supprimer l'événement
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </main>
    </div>
  );
}
