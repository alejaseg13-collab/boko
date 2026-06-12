"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type DBProduct = {
  id: string; nombre: string; slug: string; precio: number;
  precio_anterior: number | null; imagenes: string[]; stock: number;
  is_personalizable: boolean; etiquetas: string[]; tallas: string[];
  categories: { nombre: string } | null;
};

const CATS  = ["Videojuegos", "Accesorios", "Naturaleza", "Humanos", "Animales", "Anime", "Otros"];
const SIZES = ["Mini", "Pequeño", "Mediano", "Grande"];

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer" onClick={onChange}>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors shrink-0 ${checked ? "bg-[#6B9E7A] border-[#6B9E7A]" : "border-[#C5BFB8] bg-white"}`}>
        {checked && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </div>
      <span className="text-sm font-medium text-boko-dark">{label}</span>
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

const badgeStyle: Record<string, { cls: string; label: string }> = {
  sale:   { cls: "bg-[#2D7A5F] text-white", label: "10% OFF" },
  custom: { cls: "bg-boko-dark text-white",  label: "Personalizado" },
};

function TiendaCard({ product }: { product: DBProduct }) {
  const [wishlisted, setWishlisted] = useState(false);
  const badgeKey = product.precio_anterior ? "sale" : product.is_personalizable ? "custom" : null;
  const badge = badgeKey ? badgeStyle[badgeKey] : null;
  const image = product.imagenes?.[0] ?? "/images/products/product-1.jpg";

  async function toggleWishlist() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    if (wishlisted) {
      await supabase.from("wishlist").delete().eq("user_id", session.user.id).eq("product_id", product.id);
    } else {
      await supabase.from("wishlist").upsert({ user_id: session.user.id, product_id: product.id });
    }
    setWishlisted(!wishlisted);
  }

  return (
    <div className="flex flex-col w-full">
      <Link href={`/tienda/${product.slug}`} className="block">
        <div className="relative aspect-square bg-white rounded-2xl overflow-hidden mb-2 group">
          <img src={image} alt={product.nombre} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
          {badge && <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${badge.cls}`}>{badge.label}</span>}
        </div>
      </Link>
      <button onClick={toggleWishlist} className="flex items-center gap-1.5 mb-2">
        <svg width="14" height="14" viewBox="0 0 24 24" fill={wishlisted ? "#E05B7F" : "none"} stroke={wishlisted ? "#E05B7F" : "#9B8B7E"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <span className={`text-xs ${wishlisted ? "text-[#E05B7F]" : "text-boko-muted"}`}>
          {wishlisted ? "Producto agregado" : "Añadir a deseados"}
        </span>
      </button>
      <Link href={`/tienda/${product.slug}`} className="flex flex-col gap-0.5">
        <h3 className="font-serif font-bold text-boko-dark text-sm leading-snug">{product.nombre}</h3>
        {(product.categories || product.tallas?.[0]) && (
          <span className="text-xs text-boko-muted">
            {[product.categories?.nombre, product.tallas?.[0]].filter(Boolean).join(" / ")}
          </span>
        )}
        <p className="font-serif font-bold text-boko-dark text-lg mt-1">${product.precio.toLocaleString("es-CO")}</p>
        {product.precio_anterior && <p className="text-xs text-boko-muted line-through">${product.precio_anterior.toLocaleString("es-CO")}</p>}
      </Link>
    </div>
  );
}

export default function TiendaPage() {
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  const [cats,  setCats]  = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [sort,  setSort]  = useState("nuevos");
  const [absMin, setAbsMin] = useState(0);
  const [absMax, setAbsMax] = useState(500000);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(500000);
  const priceInited = useRef(false);

  useEffect(() => {
    supabase
      .from("products")
      .select("id, nombre, slug, precio, precio_anterior, imagenes, stock, is_personalizable, etiquetas, tallas, categories(nombre)")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
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

  function FilterPanel({ mobile = false }: { mobile?: boolean }) {
    const hCls = mobile
      ? "font-serif text-xl font-bold text-[#796a73] mb-4 text-center"
      : "text-base text-boko-muted mb-4";
    return (
      <div className="flex flex-col gap-7">
        <div>
          <h4 className={hCls}>Por categoría</h4>
          <div className="flex flex-col gap-3">
            {CATS.map(c => <Checkbox key={c} label={c} checked={cats.includes(c)} onChange={() => toggleCat(c)} />)}
          </div>
        </div>
        <div className="border-b border-boko-border" />
        <div>
          <h4 className={hCls}>Por tamaño</h4>
          <div className="flex flex-col gap-3">
            {SIZES.map(s => <Checkbox key={s} label={s} checked={sizes.includes(s)} onChange={() => toggleSize(s)} />)}
          </div>
        </div>
        <div className="border-b border-boko-border" />
        <div>
          <h4 className={`${hCls} mb-3`}>Por precio</h4>
          <PriceSlider absMin={absMin} absMax={absMax} valMin={priceMin} valMax={priceMax} onMin={setPriceMin} onMax={setPriceMax} />
        </div>
        <div className="border-b border-boko-border" />
        <div>
          <h4 className={hCls}>Por popularidad</h4>
          <div className="flex flex-col gap-3">
            <RadioBtn label="Más nuevos"            checked={sort === "nuevos"}      onChange={() => setSort("nuevos")} />
            <RadioBtn label="Precio: menor a mayor" checked={sort === "precio_asc"}  onChange={() => setSort("precio_asc")} />
            <RadioBtn label="Precio: mayor a menor" checked={sort === "precio_desc"} onChange={() => setSort("precio_desc")} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="relative w-full h-70 overflow-hidden rounded-br-[50px]">
        <img src="/images/products/tienda_res.png" alt="Tienda Bokō" className="w-full h-full object-cover object-bottom" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="font-serif text-5xl text-[#796a73] drop-shadow-md">Tienda</h1>
        </div>
      </div>

      {/* Modal filtros móvil */}
      {filterOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col bg-white overflow-y-auto">
          <div className="flex items-center justify-between px-6 py-5 border-b border-boko-border sticky top-0 bg-white">
            <h3 className="font-serif text-3xl font-bold text-boko-dark">Filtros</h3>
            <button onClick={() => setFilterOpen(false)} className="text-boko-muted hover:text-boko-dark transition-colors">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="px-6 py-6 flex-1">
            <FilterPanel mobile />
          </div>
          <div className="px-6 py-4 border-t border-boko-border sticky bottom-0 bg-white flex gap-3">
            {hasFilters && (
              <button onClick={() => { clearFilters(); setFilterOpen(false); }}
                className="flex-1 py-3 rounded-xl border border-boko-border text-sm text-boko-dark font-medium">
                Limpiar
              </button>
            )}
            <button onClick={() => setFilterOpen(false)}
              className="flex-1 py-3 rounded-xl bg-[#796a73] text-white text-sm font-medium">
              Ver resultados
            </button>
          </div>
        </div>
      )}

      <div className="max-w-[1512px] mx-auto px-4 md:px-24 py-10">
        <div className="flex gap-14">

          {/* Sidebar filtros — solo desktop */}
          <aside className="hidden md:block w-[210px] shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-3xl font-bold text-boko-dark">Filtros</h3>
              {hasFilters && (
                <button onClick={clearFilters} className="text-xs text-[#796a73] hover:underline">Limpiar</button>
              )}
            </div>
            <div className="border-b border-boko-border mb-7" />
            <FilterPanel />
          </aside>

          {/* Contenido principal */}
          <div className="flex-1 min-w-0">

            {/* MÓVIL: fila 1 — título + botón filtros */}
            <div className="md:hidden flex items-center justify-between mb-3">
              <h2 className="font-serif text-3xl font-bold text-[#796a73]">Artículos</h2>
              <button onClick={() => setFilterOpen(true)} className="relative text-boko-muted p-1">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
                </svg>
                {hasFilters && (
                  <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-[#796a73] text-white text-[9px] flex items-center justify-center">
                    {cats.length + sizes.length + (sort !== "nuevos" ? 1 : 0) + (priceMin !== absMin || priceMax !== absMax ? 1 : 0)}
                  </span>
                )}
              </button>
            </div>

            {/* MÓVIL: fila 2 — barra de búsqueda */}
            <div className="md:hidden relative mb-4">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-boko-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input type="text" placeholder="Buscar" value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-full border border-boko-border bg-white text-sm text-boko-dark placeholder:text-boko-muted focus:outline-none focus:border-boko-muted" />
            </div>

            {/* DESKTOP: título + búsqueda en misma fila */}
            <div className="hidden md:flex items-center gap-5 mb-6">
              <h2 className="font-serif text-4xl font-bold text-[#796a73] shrink-0">Artículos</h2>
              <div className="flex-1 relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-boko-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <input type="text" placeholder="Buscar" value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-full border border-boko-border bg-white text-sm text-boko-dark placeholder:text-boko-muted focus:outline-none focus:border-boko-muted" />
              </div>
            </div>

            {/* Resultados + filtros activos */}
            <div className="mb-4 md:mb-8">
              <p className="text-base text-boko-dark font-medium mb-3">
                {loading ? "Cargando..." : `Mostrando ${sorted.length} de ${products.length} resultado${products.length !== 1 ? "s" : ""}`}
              </p>
              {hasFilters && (
                <div className="flex flex-col gap-2">
                  <span className="text-sm text-boko-muted">Filtros activos</span>
                  <div className="flex flex-wrap gap-2">
                    {(priceMin !== absMin || priceMax !== absMax) && (
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full border border-boko-border text-xs text-boko-dark bg-white">
                        Price: ${priceMin.toLocaleString("es-CO")} - ${priceMax.toLocaleString("es-CO")}
                        <button onClick={() => { setPriceMin(absMin); setPriceMax(absMax); }} className="ml-1 text-boko-muted hover:text-boko-dark">×</button>
                      </span>
                    )}
                    {cats.map(c => (
                      <span key={c} className="flex items-center gap-1 px-3 py-1 rounded-full border border-boko-border text-xs text-boko-dark bg-white">
                        {c} <button onClick={() => toggleCat(c)} className="ml-1 text-boko-muted hover:text-boko-dark">×</button>
                      </span>
                    ))}
                    {sizes.map(s => (
                      <span key={s} className="flex items-center gap-1 px-3 py-1 rounded-full border border-boko-border text-xs text-boko-dark bg-white">
                        {s} <button onClick={() => toggleSize(s)} className="ml-1 text-boko-muted hover:text-boko-dark">×</button>
                      </span>
                    ))}
                  </div>
                  <button onClick={clearFilters} className="text-sm text-[#796a73] underline font-medium self-start">Borrar filtros</button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-10">

                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-3 animate-pulse">
                    <div className="aspect-square bg-gray-100 rounded-2xl" />
                    <div className="h-3 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : sorted.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="font-serif text-2xl text-boko-muted mb-2">Sin productos</p>
                <p className="text-sm text-boko-muted">
                  {hasFilters ? "No hay productos con esos filtros." : "Aún no hay productos publicados."}
                </p>
                {hasFilters && (
                  <button onClick={clearFilters} className="mt-4 text-sm text-[#796a73] underline">Limpiar filtros</button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-10">

                {sorted.map(p => <TiendaCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1512px] mx-auto px-4 md:px-24 pt-4 pb-16">
        <div className="flex flex-col md:flex-row gap-10 items-center justify-center">
          {[
            { icon: "/images/icons/icon-box.svg",     title: "Envío gratis",    desc: "Envío gratis a partir de $150.000" },
            { icon: "/images/icons/icon-wallet.svg",  title: "Pagos flexibles", desc: "Múltiples opciones de pago" },
            { icon: "/images/icons/icon-headset.svg", title: "Contacto 24/7",   desc: "Estamos conectados todos los días" },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-boko-cream rounded-4xl h-29 flex-1 flex items-center px-7.5 shadow-[0px_4px_4px_rgba(0,0,0,0.08),0px_4px_16px_rgba(0,0,0,0.08)]">
              <div className="flex items-center gap-6 w-full">
                <img src={icon} alt="" className="w-[34px] h-[34px] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-serif font-bold text-2xl text-[#796a73] tracking-[0.24px] leading-[1.32]">{title}</p>
                  <p className="text-sm text-[#77757f] leading-[1.16]">{desc}</p>
                </div>
                <img src="/images/icons/icon-tick.svg" alt="" className="w-[23px] h-[23px] shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
