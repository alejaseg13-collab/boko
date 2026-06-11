"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Item = { id: string; slug: string; nombre: string; precio: number; imagen: string; category: string | null };

const SPEED = 0.5;
const MIN_LOOP_ITEMS = 10; // mínimo de tarjetas para que el loop sea suave

export default function BestSellersCarousel() {
  const [items, setItems] = useState<Item[]>([]);
  const trackRef  = useRef<HTMLDivElement>(null);
  const posRef    = useRef(0);
  const rafRef    = useRef<number>();
  const copiesRef = useRef(2); // cuántas veces se repite el set original

  useEffect(() => {
    supabase
      .from("products")
      .select("id, slug, nombre, precio, imagenes, categories(nombre)")
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data, error }) => {
        if (error) { console.error("BestSellers error:", error); return; }
        if (!data?.length) return;
        setItems(data.map((p: any) => ({
          id: p.id,
          slug: p.slug,
          nombre: p.nombre,
          precio: p.precio,
          imagen: p.imagenes?.[0] ?? "/images/products/product-1.jpg",
          category: Array.isArray(p.categories)
            ? (p.categories[0]?.nombre ?? null)
            : (p.categories?.nombre ?? null),
        })));
      });
  }, []);

  useEffect(() => {
    if (items.length === 0) return;
    const track = trackRef.current;
    if (!track) return;

    // Calculamos cuántas copias necesitamos para ≥ MIN_LOOP_ITEMS tarjetas
    copiesRef.current = Math.max(2, Math.ceil(MIN_LOOP_ITEMS / items.length));

    posRef.current = 0;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const tick = () => {
      // Ancho de UN set original = total / copias
      const oneSet = track.scrollWidth / copiesRef.current;
      if (oneSet === 0) { rafRef.current = requestAnimationFrame(tick); return; }
      posRef.current = (posRef.current + SPEED) % oneSet;
      track.style.transform = `translateX(-${posRef.current}px)`;
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [items.length]);

  const skip = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track || items.length === 0) return;
    const oneSet    = track.scrollWidth / copiesRef.current;
    const cardWidth = oneSet / items.length;
    posRef.current  = (posRef.current + dir * cardWidth + oneSet) % oneSet;
  };

  // Suficientes copias para el loop suave
  const copies = items.length > 0 ? Math.max(2, Math.ceil(MIN_LOOP_ITEMS / items.length)) : 2;
  const loop   = Array.from({ length: copies }, () => items).flat();

  return (
    <>
      <h2 className="font-serif text-3xl font-bold text-[#796a73] text-center mb-6">
        Best sellers
      </h2>

      {items.length === 0 ? (
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-1/2 md:w-1/5 shrink-0 px-2 flex flex-col gap-2 animate-pulse">
              <div className="aspect-4/5 bg-gray-200 rounded-2xl" />
              <div className="h-3 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="relative">
          <button onClick={() => skip(-1)} aria-label="Anterior"
            className="absolute left-0 top-[42%] -translate-y-1/2 -translate-x-4 z-10 w-8 h-8 rounded-full bg-white/70 backdrop-blur-sm shadow-sm flex items-center justify-center text-boko-muted hover:text-boko-dark hover:bg-white transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <button onClick={() => skip(1)} aria-label="Siguiente"
            className="absolute right-0 top-[42%] -translate-y-1/2 translate-x-4 z-10 w-8 h-8 rounded-full bg-white/70 backdrop-blur-sm shadow-sm flex items-center justify-center text-boko-muted hover:text-boko-dark hover:bg-white transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
          </button>

          <div className="-mx-2 overflow-hidden">
            <div ref={trackRef} className="flex">
              {loop.map((item, i) => (
                <div key={i} className="w-1/2 md:w-1/5 shrink-0 px-2">
                  <Link href={`/tienda/${item.slug}`} className="group block">
                    <div className="relative aspect-4/5 bg-white rounded-2xl overflow-hidden mb-3">
                      <img
                        src={item.imagen}
                        alt={item.nombre}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-sm font-semibold text-boko-dark group-hover:text-boko-muted transition-colors line-clamp-2">
                        {item.nombre}
                      </h3>
                      {item.category && <span className="text-xs text-boko-muted">{item.category}</span>}
                      <p className="font-serif font-bold text-boko-dark text-lg mt-0.5">
                        ${item.precio.toLocaleString("es-CO")}
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
