"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Review = {
  id: string;
  created_at: string;
  nombre: string;
  rating: number;
  texto: string;
  fotos: string[];
  product_id: string | null;
  products: { nombre: string } | null;
};

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={i < n ? "#EFC050" : "#E5E7EB"} stroke="none">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

function StarSelector({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <button key={i} type="button"
          onMouseEnter={() => setHover(i + 1)} onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i + 1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill={i < (hover || value) ? "#EFC050" : "#E5E7EB"} stroke="none" className="transition-colors">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
    </div>
  );
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminResenasPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editRating, setEditRating] = useState(5);
  const [editTexto, setEditTexto] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [filter, setFilter] = useState<"all" | "general" | "product">("all");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("reviews")
      .select("id, created_at, nombre, rating, texto, fotos, product_id, products(nombre)")
      .order("created_at", { ascending: false });
    setReviews((data as Review[]) ?? []);
    setLoading(false);
  }

  function openEdit(r: Review) {
    setEditingId(r.id);
    setEditNombre(r.nombre);
    setEditRating(r.rating);
    setEditTexto(r.texto);
  }

  function cancelEdit() { setEditingId(null); }

  async function saveEdit(id: string) {
    setSaving(true);
    const { error } = await supabase.from("reviews").update({
      nombre: editNombre.trim(),
      rating: editRating,
      texto: editTexto.trim(),
    }).eq("id", id);
    if (error) {
      alert("Error al guardar: " + error.message);
      setSaving(false);
      return;
    }
    setReviews(prev => prev.map(r => r.id === id
      ? { ...r, nombre: editNombre.trim(), rating: editRating, texto: editTexto.trim() }
      : r
    ));
    setEditingId(null);
    setSaving(false);
  }

  async function deleteReview(id: string) {
    setDeletingId(id);
    setDeleteError("");
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) {
      setDeleteError("Error al eliminar: " + error.message);
      setDeletingId(null);
      return;
    }
    setReviews(prev => prev.filter(r => r.id !== id));
    setDeletingId(null);
  }

  async function deletePhoto(reviewId: string, photoUrl: string) {
    const updated = reviews.find(r => r.id === reviewId)?.fotos.filter(f => f !== photoUrl) ?? [];
    const { error } = await supabase.from("reviews").update({ fotos: updated }).eq("id", reviewId);
    if (error) { alert("Error al eliminar foto: " + error.message); return; }
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, fotos: updated } : r));
  }

  const filtered = reviews.filter(r => {
    if (filter === "general") return !r.product_id;
    if (filter === "product") return !!r.product_id;
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      {deleteError && (
        <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl">{deleteError}</p>
      )}
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-[#796a73]">Reseñas</h1>
        <div className="flex items-center gap-2 text-sm">
          {(["all", "general", "product"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg border transition-colors ${filter === f ? "bg-[#796a73] text-white border-[#796a73]" : "border-boko-border text-gray-500 hover:border-[#796a73]"}`}>
              {f === "all" ? "Todas" : f === "general" ? "Generales" : "De productos"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-boko-border px-6 py-16 text-center text-sm text-boko-muted">
          No hay reseñas aún.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-boko-border overflow-hidden">

              {editingId === r.id ? (
                /* ── Modo edición ── */
                <div className="p-6 flex flex-col gap-4">
                  <p className="text-xs font-semibold text-[#796a73] uppercase tracking-wide">Editando reseña</p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-500">Nombre</label>
                      <input type="text" value={editNombre} onChange={e => setEditNombre(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-[#796a73]/40" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-500">Calificación</label>
                      <StarSelector value={editRating} onChange={setEditRating} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-gray-500">Comentario</label>
                    <textarea value={editTexto} onChange={e => setEditTexto(e.target.value)} rows={4}
                      className="px-3 py-2.5 rounded-xl bg-gray-100 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#796a73]/40" />
                  </div>

                  {/* Fotos con opción de eliminar */}
                  {r.fotos?.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-gray-500">Fotos adjuntas</label>
                      <div className="flex flex-wrap gap-3">
                        {r.fotos.map((src, i) => (
                          <div key={i} className="relative group">
                            <img src={src} alt="" className="w-20 h-20 rounded-xl object-cover" />
                            <button type="button" onClick={() => deletePhoto(r.id, src)}
                              className="absolute inset-0 rounded-xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button onClick={() => saveEdit(r.id)} disabled={saving}
                      className="px-5 py-2 rounded-xl bg-[#796a73] text-white text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-60">
                      {saving ? "Guardando..." : "Guardar cambios"}
                    </button>
                    <button onClick={cancelEdit}
                      className="px-5 py-2 rounded-xl border border-boko-border text-sm text-gray-500 hover:bg-gray-50 transition-colors">
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                /* ── Vista normal ── */
                <div className="p-5 flex gap-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-[#796a73]/15 flex items-center justify-center text-[#796a73] font-bold text-sm shrink-0">
                    {r.nombre[0]?.toUpperCase()}
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-boko-dark">{r.nombre}</span>
                        <Stars n={r.rating} />
                        {r.products?.nombre && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-boko-cream text-[#796a73] font-medium">
                            {r.products.nombre}
                          </span>
                        )}
                        {!r.product_id && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">General</span>
                        )}
                      </div>
                      <span className="text-xs text-boko-muted whitespace-nowrap shrink-0">{fmtDate(r.created_at)}</span>
                    </div>
                    <p className="text-sm text-boko-muted leading-relaxed line-clamp-2">{r.texto}</p>
                    {r.fotos?.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {r.fotos.slice(0, 4).map((src, i) => (
                          <img key={i} src={src} alt="" className="w-12 h-12 rounded-lg object-cover" />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex items-start gap-2 shrink-0">
                    <button onClick={() => openEdit(r)}
                      className="px-3 py-1.5 rounded-lg border border-boko-border text-xs text-gray-500 hover:border-[#796a73] hover:text-[#796a73] transition-colors">
                      Editar
                    </button>
                    <button onClick={() => deleteReview(r.id)} disabled={deletingId === r.id}
                      className="px-3 py-1.5 rounded-lg border border-red-200 text-xs text-red-400 hover:bg-red-50 transition-colors disabled:opacity-50">
                      {deletingId === r.id ? "..." : "Eliminar"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
