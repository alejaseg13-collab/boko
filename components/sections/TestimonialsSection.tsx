"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
type Review = { id: string; nombre: string; rating: number; texto: string; created_at: string; fotos: string[] };

function Stars({ n, size = 12 }: { n: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i < n ? "#F5A623" : "#E5E7EB"} stroke="none">
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
          <svg width="28" height="28" viewBox="0 0 24 24" fill={i < (hover || value) ? "#EFC050" : "#E5E7EB"} stroke="none" className="transition-colors">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
    </div>
  );
}

const MAX_PHOTOS = 4;

export default function TestimonialsSection() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState("");
  const [rating, setRating] = useState(5);
  const [texto, setTexto] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.from("reviews").select("id, nombre, rating, texto, created_at, fotos")
      .is("product_id", null).order("created_at", { ascending: false }).limit(4)
      .then(({ data }) => { setReviews((data as Review[]) ?? []); setLoadingReviews(false); });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      supabase.from("profiles").select("nombre, apellidos").eq("id", session.user.id).single()
        .then(({ data }) => {
          if (data) setNombre([data.nombre, data.apellidos].filter(Boolean).join(" "));
        });
    });
  }, []);

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []).slice(0, MAX_PHOTOS - files.length);
    setFiles(prev => [...prev, ...selected].slice(0, MAX_PHOTOS));
    setPreviews(prev => [...prev, ...selected.map(f => URL.createObjectURL(f))].slice(0, MAX_PHOTOS));
    e.target.value = "";
  }

  function removeFile(idx: number) {
    setFiles(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!texto.trim() || !nombre.trim()) { setError("El nombre y el comentario son obligatorios."); return; }
    setError(""); setSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const urls: string[] = [];

      for (const file of files) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `general/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: upErr } = await supabase.storage.from("reviews").upload(path, file);
        if (upErr) throw new Error(`Error al subir imagen: ${upErr.message}`);
        const { data } = supabase.storage.from("reviews").getPublicUrl(path);
        urls.push(data.publicUrl);
      }

      const { data: inserted, error: insErr } = await supabase.from("reviews").insert({
        user_id: session?.user.id ?? null,
        product_id: null,
        nombre: nombre.trim(),
        rating,
        texto: texto.trim(),
        fotos: urls,
      }).select().single();

      if (insErr) throw insErr;

      setReviews(prev => [inserted as Review, ...prev].slice(0, 4));
      setDone(true);
      setTexto(""); setFiles([]); setPreviews([]); setRating(5);
      setTimeout(() => { setDone(false); setShowForm(false); }, 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al enviar reseña");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="pt-4 pb-16 bg-boko-cream">
      <div className="max-w-378 mx-auto px-6">
        <div className="text-center mb-12">
          <p className="font-serif text-5xl text-[#796a73]">Esto dicen</p>
          <p className="font-serif text-5xl font-bold text-[#796a73]">nuestros clientes</p>
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center justify-center px-7 py-3 rounded-full bg-[#796a73] text-white text-sm font-medium hover:bg-[#5a4a54] transition-colors"
            >
              {showForm ? "Cancelar" : "Escribir reseña"}
            </button>
          </div>
        </div>

        {/* Formulario de reseña */}
        {showForm && (
          <div className="max-w-2xl mx-auto mb-12 bg-white rounded-3xl border border-boko-border p-8">
            {done ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <div className="w-14 h-14 rounded-full bg-[#6B9E7A]/10 flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6B9E7A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <p className="font-serif text-xl font-bold text-boko-dark">¡Gracias por tu reseña!</p>
                <p className="text-sm text-boko-muted">Tu comentario ya aparece en la sección.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <h3 className="font-serif text-xl font-bold text-boko-dark">Deja tu opinión</h3>
                {error && <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl">{error}</p>}

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-500">Tu calificación</label>
                  <StarSelector value={rating} onChange={setRating} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-500">Nombre</label>
                  <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} required
                    placeholder="Tu nombre"
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-[#796a73]/40" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-500">Comentario</label>
                  <textarea value={texto} onChange={e => setTexto(e.target.value)} required rows={4}
                    placeholder="Cuéntanos tu experiencia con Bokō..."
                    className="w-full px-4 py-3 rounded-xl bg-gray-100 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#796a73]/40" />
                </div>

                {/* Adjuntar imágenes */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-gray-500">Fotos (opcional, máx. {MAX_PHOTOS})</label>
                  <div className="flex flex-wrap gap-3">
                    {previews.map((src, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeFile(i)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center">
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                            <path d="M18 6L6 18M6 6l12 12"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                    {files.length < MAX_PHOTOS && (
                      <button type="button" onClick={() => fileInputRef.current?.click()}
                        className="w-20 h-20 rounded-xl border-2 border-dashed border-boko-border flex flex-col items-center justify-center gap-1 text-boko-muted hover:border-[#796a73] hover:text-[#796a73] transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 5v14M5 12h14"/></svg>
                        <span className="text-xs">Foto</span>
                      </button>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
                </div>

                <button type="submit" disabled={submitting}
                  className="w-fit px-7 py-2.5 rounded-xl bg-[#796a73] text-white text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-60">
                  {submitting ? "Enviando..." : "Publicar reseña"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Tarjetas de reseñas */}
        {loadingReviews ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-boko-cream rounded-3xl p-6 flex flex-col gap-4 shadow-[0_8px_36px_rgba(0,0,0,0.15)] animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-boko-border shrink-0" />
                  <div className="flex flex-col gap-1.5 flex-1">
                    <div className="h-3 bg-boko-border rounded w-2/3" />
                    <div className="h-2 bg-boko-border rounded w-1/2" />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="h-2 bg-boko-border rounded" />
                  <div className="h-2 bg-boko-border rounded w-4/5" />
                  <div className="h-2 bg-boko-border rounded w-3/5" />
                </div>
              </div>
            ))}
          </div>
        ) : reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reviews.map((r) => (
              <div key={r.id} className="bg-boko-cream rounded-3xl p-6 flex flex-col gap-4 shadow-[0_8px_36px_rgba(0,0,0,0.15)]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-boko-border flex items-center justify-center text-boko-dark font-bold text-lg shrink-0">
                    {r.nombre[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-base text-[#796a73]">{r.nombre}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Stars n={r.rating} />
                      <span className="text-xs text-boko-muted">{r.rating}.0 rating</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-boko-muted leading-relaxed">{r.texto}</p>
                {r.fotos?.length > 0 && (
                  <div className="flex gap-2">
                    {r.fotos.slice(0, 3).map((src, i) => (
                      <img key={i} src={src} alt="" className="w-14 h-14 rounded-lg object-cover" />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
