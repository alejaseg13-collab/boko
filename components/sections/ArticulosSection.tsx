"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type DBProduct = {
  id: string; slug: string; nombre: string; precio: number;
  precio_anterior: number | null; imagenes: string[];
  etiquetas: string[]; tallas: string[];
  categories: { nombre: string } | null;
};

const CATS  = ["Videojuegos", "Accesorios", "Naturaleza", "Humanos", "Animales", "Anime", "Otros"];
const SIZES = ["Mini", "Pequeño", "Mediano", "Grande"];

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer" onClick={onChange}>
      <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-colors shrink-0 ${checked ? "bg-[#6B9E7A] border-[#6B9E7A]" : "border-[#C5BFB8] bg-white"}`}>
        {checked && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </div>
      <span className="text-sm text-boko-dark">{label}</span>
    </label>
  );
}

function RadioBtn({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer" onClick={onChange}>
      <div className={`w-6 h-6 rounded-full border-2 transition-colors shrink-0 flex items-center justify-center ${checked ? "border-[#6B9E7A]" : "border-[#C5BFB8] bg-white"}`}>
        {checked && <div className="w-3 h-3 rounded-full bg-[#6B9E7A]" />}
      </div>
      <span className="text-sm text-boko-dark">{label}</span>
    </label>
  );
}

function PriceSlider({ absMin, absMax, valMin, valMax, onMin, onMax }: {
  absMin: number; absMax: number; valMin: number; valMax: number;
  onMin: (v: number) => void; onMax: (v: number) => void;
}) {
  const range = absMax - absMin || 1;
  const pMin = ((valMin - absMin) / range) * 100;
  const pMax = ((valMax - absMin) / range) * 100;
  const minOnTop = pMin > 80;
  return (
    <div>
      <p className="text-sm font-semibold text-boko-dark mb-4">
        ${valMin.toLocaleString("es-CO")} – ${valMax.toLocaleString("es-CO")}
      </p>
      <div className="relative h-5 flex items-center">
        <div className="absolute inset-x-0 h-1.5 bg-boko-border rounded-full">
          <div className="absolute h-full bg-[#6B9E7A] rounded-full"
            style={{ left: `${pMin}%`, right: `${100 - pMax}%` }} />
        </div>
        <div className="absolute w-4 h-4 rounded-full bg-white border-2 border-[#6B9E7A] shadow-sm pointer-events-none"
          style={{ left: `calc(${pMin}% - 8px)` }} />
        <div className="absolute w-4 h-4 rounded-full bg-white border-2 border-[#6B9E7A] shadow-sm pointer-events-none"
          style={{ left: `calc(${pMax}% - 8px)` }} />
        <input type="range" min={absMin} max={absMax} step={1000} value={valMin}
          onChange={e => onMin(Math.min(+e.target.value, valMax - 1000))}
          className={`absolute inset-0 w-full opacity-0 cursor-pointer ${minOnTop ? "z-30" : "z-10"}`} />
        <input type="range" min={absMin} max={absMax} step={1000} value={valMax}
          onChange={e => onMax(Math.max(+e.target.value, valMin + 1000))}
          className={`absolute inset-0 w-full opacity-0 cursor-pointer ${minOnTop ? "z-10" : "z-20"}`} />
      </div>
    </div>
  );
}

function ProductCard({ p }: { p: DBProduct }) {
  const [wishlisted, setWishlisted] = useState(false);
  const img = p.imagenes?.[0] ?? "/images/products/product-1.jpg";
  const discount = p.precio_anterior ? Math.round((1 - p.precio / p.precio_anterior) * 100) : null;

  return (
    <div className="flex flex-col">
      <Link href={`/tienda/${p.slug}`} className="block">
        <div className="relative aspect-square bg-white rounded-2xl overflow-hidden mb-2 group">
          <img src={img} alt={p.nombre} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
          {discount && (
            <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold bg-[#2D7A5F] text-white">
              {discount}% OFF
            </span>
          )}
        </div>
      </Link>
      <button onClick={() => setWishlisted(!wishlisted)} className="flex items-center gap-1.5 mb-2">
        <svg width="14" height="14" viewBox="0 0 24 24" fill={wishlisted ? "#E05B7F" : "none"} stroke={wishlisted ? "#E05B7F" : "#9B8B7E"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <span className={`text-xs ${wishlisted ? "text-[#E05B7F]" : "text-boko-muted"}`}>
          {wishlisted ? "Producto agregado" : "Añadir a deseados"}
        </span>
      </button>
      <Link href={`/tienda/${p.slug}`} className="flex flex-col gap-0.5">
        <h3 className="font-serif font-bold text-boko-dark text-sm leading-snug">{p.nombre}</h3>
        {p.categories && <span className="text-xs text-boko-muted">{p.categories.nombre}</span>}
        <p className="font-serif font-bold text-boko-dark text-lg mt-1">${p.precio.toLocaleString("es-CO")}</p>
      </Link>
    </div>
  );
}

export default function ArticulosSection() {
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [loading, setLoading]   = useState(true);

  const [cats,  setCats]  = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [sort,  setSort]  = useState("nuevos");
  const [absMin, setAbsMin] = useState(0);
  const [absMax, setAbsMax] = useState(500000);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(500000);
  const priceInited = useRef(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    supabase
      .from("products")
      .select("id, slug, nombre, precio, precio_anterior, imagenes, etiquetas, tallas, categories(nombre)")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error("ArticulosSection error:", error);
        const prods = (data as DBProduct[]) ?? [];
        setProducts(prods);
        setLoading(false);
        if (!priceInited.current && prods.length > 0) {
          priceInited.current = true;
          const prices = prods.map(p => p.precio);
          const mn = Math.min(...prices);
          const mx = Math.max(...prices);
          setAbsMin(mn); setAbsMax(mx);
          setPriceMin(mn); setPriceMax(mx);
        }
      });
  }, []);

  function toggleCat(c: string)  { setCats(p  => p.includes(c) ? p.filter(x => x !== c) : [...p, c]); }
  function toggleSize(s: string) { setSizes(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]); }

  const filtered = products
    .filter(p => cats.length  === 0 || p.etiquetas?.some(e => cats.includes(e)))
    .filter(p => sizes.length === 0 || p.etiquetas?.some(e => sizes.includes(e)) || p.tallas?.some(t => sizes.some(s => t.toLowerCase().includes(s.toLowerCase()))))
    .filter(p => p.precio >= priceMin && p.precio <= priceMax)
    .filter(p => !search || p.nombre.toLowerCase().includes(search.toLowerCase()));

  const sorted = sort === "precio_asc"
    ? [...filtered].sort((a, b) => a.precio - b.precio)
    : sort === "precio_desc"
    ? [...filtered].sort((a, b) => b.precio - a.precio)
    : filtered;

  const hasFilters = cats.length > 0 || sizes.length > 0 || sort !== "nuevos"
    || priceMin !== absMin || priceMax !== absMax || search;

  function clearFilters() {
    setCats([]); setSizes([]); setSort("nuevos");
    setPriceMin(absMin); setPriceMax(absMax); setSearch("");
  }

  const display = sorted.slice(0, hasFilters ? 12 : 6);

  return (
    <section className="bg-boko-cream pt-14 pb-0">
      <div className="max-w-[1512px] mx-auto px-24">
        <div className="flex gap-14">

          {/* Sidebar */}
          <aside className="hidden md:block w-[210px] shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-3xl font-bold text-boko-dark">Filtros</h3>
              {hasFilters && (
                <button onClick={clearFilters} className="text-xs text-[#796a73] hover:underline">Limpiar</button>
              )}
            </div>
            <div className="border-b border-boko-border mb-7" />

            <div className="mb-7">
              <h4 className="text-base text-boko-muted mb-4">Por categoría</h4>
              <div className="flex flex-col gap-3">
                {CATS.map(c => <Checkbox key={c} label={c} checked={cats.includes(c)} onChange={() => toggleCat(c)} />)}
              </div>
            </div>

            <div className="mb-7">
              <h4 className="text-base text-boko-muted mb-4">Por tamaño</h4>
              <div className="flex flex-col gap-3">
                {SIZES.map(s => <Checkbox key={s} label={s} checked={sizes.includes(s)} onChange={() => toggleSize(s)} />)}
              </div>
            </div>

            <div className="mb-7">
              <h4 className="text-base text-boko-muted mb-3">Por precio</h4>
              <PriceSlider absMin={absMin} absMax={absMax} valMin={priceMin} valMax={priceMax} onMin={setPriceMin} onMax={setPriceMax} />
            </div>

            <div className="mb-7">
              <h4 className="text-base text-boko-muted mb-4">Por popularidad</h4>
              <div className="flex flex-col gap-3">
                <RadioBtn label="Más nuevos"            checked={sort === "nuevos"}      onChange={() => setSort("nuevos")} />
                <RadioBtn label="Precio: menor a mayor" checked={sort === "precio_asc"}  onChange={() => setSort("precio_asc")} />
                <RadioBtn label="Precio: mayor a menor" checked={sort === "precio_desc"} onChange={() => setSort("precio_desc")} />
              </div>
            </div>
          </aside>

          {/* Contenido */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-5 mb-6">
              <h2 className="font-serif text-4xl font-bold text-[#796a73] shrink-0">Artículos</h2>
              <div className="flex-1 relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-boko-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <input type="text" placeholder="Buscar" value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-full border border-boko-border bg-white text-sm text-boko-dark placeholder:text-boko-muted focus:outline-none focus:border-boko-muted" />
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-10">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-2 animate-pulse">
                    <div className="aspect-square bg-gray-100 rounded-2xl" />
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : display.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-boko-muted text-sm">
                  {hasFilters ? "No hay productos con esos filtros." : "No hay productos disponibles aún."}
                </p>
                {hasFilters && (
                  <button onClick={clearFilters} className="mt-3 text-sm text-[#796a73] underline">Limpiar filtros</button>
                )}
              </div>
            ) : (
              <>
                <p className="text-base text-boko-dark font-medium mb-4">
                  Mostrando {display.length} artículo{display.length !== 1 ? "s" : ""}
                  {sorted.length > display.length && ` de ${sorted.length}`}
                </p>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-10">
                  {display.map(p => <ProductCard key={p.id} p={p} />)}
                </div>
              </>
            )}

            <div className="mt-10">
              <Link href="/tienda"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-[#796a73] text-white text-sm font-medium hover:bg-[#5a4a54] transition-colors">
                Mira la tienda completa aquí
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
