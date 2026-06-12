"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type DBProduct = {
  id: string; nombre: string; slug: string; descripcion: string | null;
  precio: number; precio_anterior: number | null; stock: number;
  imagenes: string[]; tallas: string[];
  etiquetas?: string[] | null; sku?: string | null;
  is_personalizable: boolean;
  categories: { nombre: string } | null;
};

type GuestCartItem = { product_id: string; nombre: string; slug: string; precio: number; imagenes: string[]; cantidad: number };
function readGuestCart(): GuestCartItem[] { try { return JSON.parse(localStorage.getItem("boko_cart") ?? "[]"); } catch { return []; } }
function writeGuestCart(c: GuestCartItem[]) { localStorage.setItem("boko_cart", JSON.stringify(c)); }

type Review = { id: string; nombre: string; rating: number; texto: string; fotos: string[]; created_at: string };

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d < 1) return "Hoy";
  if (d < 7) return `Hace ${d} día${d > 1 ? "s" : ""}`;
  if (d < 30) return `Hace ${Math.floor(d / 7)} semana${Math.floor(d / 7) > 1 ? "s" : ""}`;
  if (d < 365) return `Hace ${Math.floor(d / 30)} mes${Math.floor(d / 30) > 1 ? "es" : ""}`;
  return `Hace ${Math.floor(d / 365)} año${Math.floor(d / 365) > 1 ? "s" : ""}`;
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

function Stars({ n, size = 18 }: { n: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i < Math.round(n) ? "#EFC050" : "#E5E7EB"} stroke="none">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

const MAX_REVIEW_PHOTOS = 4;

export default function DetalleProductoPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<DBProduct | null>(null);
  const [related, setRelated] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState(0);
  const [selectedImg, setSelectedImg] = useState(0);
  const [cartAdded, setCartAdded] = useState(false);
  const [wishAdded, setWishAdded] = useState<Record<string, boolean>>({});

  // Reviews
  const reviewFileRef = useRef<HTMLInputElement>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [revNombre, setRevNombre] = useState("");
  const [revRating, setRevRating] = useState(5);
  const [revTexto, setRevTexto] = useState("");
  const [revFiles, setRevFiles] = useState<File[]>([]);
  const [revPreviews, setRevPreviews] = useState<string[]>([]);
  const [revSubmitting, setRevSubmitting] = useState(false);
  const [revDone, setRevDone] = useState(false);
  const [revError, setRevError] = useState("");

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("products")
        .select("id, nombre, slug, descripcion, precio, precio_anterior, stock, imagenes, tallas, etiquetas, sku, is_personalizable, categories(nombre)")
        .eq("slug", slug as string)
        .single();
      setProduct(data as DBProduct | null);
      if (data) {
        const { data: rel } = await supabase
          .from("products")
          .select("id, nombre, slug, precio, precio_anterior, imagenes, tallas, is_personalizable, categories(nombre)")
          .neq("slug", slug as string)
          .limit(4);
        setRelated((rel as DBProduct[]) ?? []);
      }
      if (data) {
        const { data: revData } = await supabase.from("reviews")
          .select("id, nombre, rating, texto, fotos, created_at")
          .eq("product_id", data.id)
          .order("created_at", { ascending: false });
        setReviews((revData as Review[]) ?? []);
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: prof } = await supabase.from("profiles").select("nombre, apellidos").eq("id", session.user.id).single();
        if (prof) setRevNombre([prof.nombre, prof.apellidos].filter(Boolean).join(" "));
      }

      setLoading(false);
    }
    load();
  }, [slug]);

  async function doAddToCart(): Promise<boolean> {
    if (!product) return false;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      const cart = readGuestCart();
      const ex = cart.find(i => i.product_id === product.id);
      if (ex) { ex.cantidad += qty; } else {
        cart.push({ product_id: product.id, nombre: product.nombre, slug: product.slug, precio: product.precio, imagenes: product.imagenes ?? [], cantidad: qty });
      }
      writeGuestCart(cart);
      return true;
    }
    const { error } = await supabase.from("cart_items").upsert(
      { user_id: session.user.id, product_id: product.id, cantidad: qty },
      { onConflict: "user_id,product_id" }
    );
    return !error;
  }

  async function addToCart() { if (await doAddToCart()) setCartAdded(true); }
  async function buyNow() { await doAddToCart(); router.push("/checkout"); }

  async function addToWishlist(productId: string) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push("/iniciar-sesion"); return; }
    await supabase.from("wishlist").upsert({ user_id: session.user.id, product_id: productId });
    setWishAdded(prev => ({ ...prev, [productId]: true }));
  }

  function handleRevFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []).slice(0, MAX_REVIEW_PHOTOS - revFiles.length);
    setRevFiles(prev => [...prev, ...selected].slice(0, MAX_REVIEW_PHOTOS));
    setRevPreviews(prev => [...prev, ...selected.map(f => URL.createObjectURL(f))].slice(0, MAX_REVIEW_PHOTOS));
    e.target.value = "";
  }

  function removeRevFile(idx: number) {
    setRevFiles(prev => prev.filter((_, i) => i !== idx));
    setRevPreviews(prev => prev.filter((_, i) => i !== idx));
  }

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!revTexto.trim() || !revNombre.trim()) { setRevError("El nombre y el comentario son obligatorios."); return; }
    if (!product) return;
    setRevError(""); setRevSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const urls: string[] = [];
      for (const file of revFiles) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${product.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: upErr } = await supabase.storage.from("reviews").upload(path, file);
        if (upErr) throw new Error(`Error al subir imagen: ${upErr.message}`);
        const { data } = supabase.storage.from("reviews").getPublicUrl(path);
        urls.push(data.publicUrl);
      }
      const { data: inserted, error: insErr } = await supabase.from("reviews").insert({
        user_id: session?.user.id ?? null,
        product_id: product.id,
        nombre: revNombre.trim(),
        rating: revRating,
        texto: revTexto.trim(),
        fotos: urls,
      }).select().single();
      if (insErr) throw insErr;
      setReviews(prev => [inserted as Review, ...prev]);
      setRevDone(true);
      setRevTexto(""); setRevFiles([]); setRevPreviews([]); setRevRating(5);
      setTimeout(() => { setRevDone(false); setShowReviewForm(false); }, 2500);
    } catch (err: unknown) {
      setRevError(err instanceof Error ? err.message : "Error al enviar reseña");
    } finally {
      setRevSubmitting(false);
    }
  }

  if (loading) {
    return (
      <>
        <div className="relative w-full h-70 overflow-hidden">
          <img src="/images/products/tienda_res.png" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="font-serif text-5xl text-[#796a73] drop-shadow-md">Tienda</h1>
          </div>
        </div>
        <div className="max-w-300 mx-auto px-6 py-14 flex justify-center">
          <div className="animate-pulse flex gap-14 w-full">
            <div className="flex-1 aspect-square bg-gray-100 rounded-3xl" />
            <div className="flex-1 flex flex-col gap-4 pt-4">
              <div className="h-6 bg-gray-100 rounded w-1/3" />
              <div className="h-12 bg-gray-100 rounded w-3/4" />
              <div className="h-8 bg-gray-100 rounded w-1/4" />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <div className="max-w-300 mx-auto px-6 py-20 text-center">
        <p className="font-serif text-3xl text-boko-muted">Producto no encontrado</p>
        <Link href="/tienda" className="mt-6 inline-block text-sm text-[#796a73] underline">Volver a la tienda</Link>
      </div>
    );
  }

  const images = product.imagenes?.length ? product.imagenes : ["/images/products/product-1.jpg"];
  const mainImage = images[selectedImg] ?? images[0];
  const tallas = product.tallas?.length ? product.tallas : [];
  const etiquetas = product.etiquetas?.length ? product.etiquetas : [];
  const titleWords = product.nombre.split(" ");
  const firstLine = titleWords.slice(0, 2).join(" ");
  const secondLine = titleWords.slice(2).join(" ");

  function prevImg() { setSelectedImg(i => (i - 1 + images.length) % images.length); }
  function nextImg() { setSelectedImg(i => (i + 1) % images.length); }

  const shareText = encodeURIComponent(`Mira este producto de Bokō: ${typeof window !== "undefined" ? window.location.href : ""}`);
  const shareUrl = typeof window !== "undefined" ? encodeURIComponent(window.location.href) : "";

  return (
    <>
      {/* Hero */}
      <div className="relative w-full h-70 overflow-hidden rounded-br-[50px]">
        <img src="/images/products/tienda_res.png" alt="Tienda Bokō" className="w-full h-full object-cover object-bottom" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="font-serif text-5xl text-[#796a73] drop-shadow-md">Tienda</h1>
        </div>
      </div>

      <div className="max-w-300 mx-auto px-6 py-14">

        {/* Detalle principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-start">

          {/* Galería */}
          <div className="flex flex-col gap-4">
            <div className="rounded-3xl overflow-hidden aspect-square bg-boko-cream">
              <img src={mainImage} alt={product.nombre} className="w-full h-full object-cover" />
            </div>
            {images.length > 1 && (
              <div className="flex items-center gap-3">
                <button onClick={prevImg} className="w-8 h-8 flex items-center justify-center rounded-full border border-boko-border text-boko-muted hover:border-boko-dark transition-colors shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
                <div className="flex gap-3 flex-1">
                  {images.map((img, i) => ({ img, i })).filter(({ i }) => i !== selectedImg).slice(0, 3).map(({ img, i }) => (
                    <button key={i} onClick={() => setSelectedImg(i)}
                      className="flex-1 aspect-square rounded-2xl overflow-hidden border-2 border-transparent hover:border-boko-border cursor-pointer transition-colors">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                <button onClick={nextImg} className="w-8 h-8 flex items-center justify-center rounded-full border border-boko-border text-boko-muted hover:border-boko-dark transition-colors shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                </button>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-5 pt-2">
            {product.precio_anterior && (
              <span className="w-fit px-4 py-1.5 rounded-full bg-[#6B9E7A] text-white text-xs font-semibold">
                {Math.round((1 - product.precio / product.precio_anterior) * 100)}% OFF
              </span>
            )}

            <h2 className="font-serif text-5xl text-boko-dark leading-tight">
              <span className="font-bold">{firstLine}</span><br />
              <span>{secondLine || ""}</span>
            </h2>

            <div className="flex items-center gap-2">
              <Stars n={5} />
              <span className="text-sm text-boko-muted font-medium">5.0 rating</span>
            </div>

            <div>
              <p className="font-serif text-4xl font-bold text-boko-dark">
                ${product.precio.toLocaleString("es-CO")}
              </p>
              {product.precio_anterior && (
                <p className="text-sm text-boko-muted line-through mt-1">
                  ${product.precio_anterior.toLocaleString("es-CO")}
                </p>
              )}
            </div>

            <p className="text-sm text-boko-muted leading-relaxed">
              {product.descripcion ?? "Pieza tejida artesanalmente con materiales de alta calidad. Cada pieza es única y hecha con amor."}
            </p>

            {tallas.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-boko-dark mb-3">Tamaños disponibles</p>
                <div className="flex flex-wrap gap-2">
                  {tallas.map((size, i) => (
                    <button key={size} onClick={() => setSelectedSize(i)}
                      className={`px-4 py-2 rounded-full text-sm border transition-colors ${selectedSize === i ? "border-boko-dark text-boko-dark bg-white font-medium" : "border-boko-border text-boko-muted hover:border-boko-muted"}`}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center border border-boko-border rounded-full overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center text-boko-muted hover:text-boko-dark transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/></svg>
                </button>
                <span className="w-8 text-center text-sm font-semibold text-boko-dark">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-10 h-10 flex items-center justify-center text-boko-muted hover:text-boko-dark transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                </button>
              </div>
              <button onClick={addToCart} disabled={cartAdded}
                className="flex-1 py-3 rounded-full bg-[#6B9E7A] text-white text-sm font-medium hover:bg-[#557e62] transition-colors disabled:opacity-70 disabled:cursor-default">
                {cartAdded ? "¡Añadido!" : "Añadir al carrito"}
              </button>
              <button onClick={buyNow}
                className="flex-1 py-3 rounded-full bg-boko-dark text-white text-sm font-medium hover:opacity-80 transition-opacity">
                Comprar ahora
              </button>
            </div>

            {/* SKU / Etiquetas / Compartir */}
            <div className="flex flex-col gap-2 pt-2 text-sm border-t border-boko-border mt-2">
              {product.sku && (
                <div className="flex gap-2">
                  <span className="font-semibold text-boko-dark min-w-24">SKU:</span>
                  <span className="text-boko-muted">{product.sku}</span>
                </div>
              )}
              {etiquetas.length > 0 && (
                <div className="flex gap-2">
                  <span className="font-semibold text-boko-dark min-w-24">Etiquetas:</span>
                  <span className="text-boko-muted">{etiquetas.join(", ")}</span>
                </div>
              )}
              <div className="flex gap-2 items-center">
                <span className="font-semibold text-boko-dark min-w-24">Compartir:</span>
                <div className="flex items-center gap-3">
                  {/* WhatsApp */}
                  <a href={`https://wa.me/?text=${shareText}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#25D366] transition-colors">
                    <img src="/images/icons/whatsapp.svg" width={18} height={18} alt="" />
                  </a>
                  {/* TikTok */}
                  <a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-black transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.82a8.18 8.18 0 0 0 4.78 1.52V6.89a4.85 4.85 0 0 1-1.01-.2z"/></svg>
                  </a>
                  {/* Instagram */}
                  <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#E1306C] transition-colors">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
                  </a>
                  {/* Facebook */}
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#1877F2] transition-colors">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rating y reseñas */}
        <div className="mt-16 pt-10 border-t border-boko-border">

          {/* Resumen de calificación */}
          {(() => {
            const avg = reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;
            const breakdown = [5, 4, 3, 2, 1].map(s => ({
              stars: s,
              pct: reviews.length ? Math.round((reviews.filter(r => r.rating === s).length / reviews.length) * 100) : 0,
            }));
            return (
              <div className="flex flex-col md:flex-row gap-10 md:gap-20 items-start mb-10">
                <div className="flex flex-col items-center gap-2 min-w-36">
                  <span className="font-serif text-6xl font-bold text-boko-dark">{reviews.length ? avg.toFixed(1) : "—"}</span>
                  <span className="text-sm text-boko-muted">de 5</span>
                  <Stars n={Math.round(avg)} size={22} />
                  <span className="text-xs text-boko-muted">({reviews.length} reseña{reviews.length !== 1 ? "s" : ""})</span>
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  {breakdown.map(({ stars, pct }) => (
                    <div key={stars} className="flex items-center gap-3 text-xs text-boko-muted">
                      <span className="w-16 text-right shrink-0">{stars} {stars === 1 ? "estrella" : "estrellas"}</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#EFC050] rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Cabecera reseñas + botón escribir */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-boko-muted">{reviews.length} reseña{reviews.length !== 1 ? "s" : ""}</p>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-5 py-2 rounded-xl bg-[#796a73] text-white text-sm font-medium hover:opacity-80 transition-opacity"
            >
              {showReviewForm ? "Cancelar" : "Escribir reseña"}
            </button>
          </div>

          {/* Formulario de reseña */}
          {showReviewForm && (
            <div className="mb-8 bg-gray-50 rounded-2xl border border-boko-border p-6">
              {revDone ? (
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#6B9E7A]/10 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B9E7A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <p className="font-semibold text-boko-dark">¡Gracias por tu reseña!</p>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
                  <h3 className="font-semibold text-boko-dark">Tu opinión sobre este producto</h3>
                  {revError && <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl">{revError}</p>}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-gray-500">Calificación</label>
                    <StarSelector value={revRating} onChange={setRevRating} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-gray-500">Nombre</label>
                    <input type="text" value={revNombre} onChange={e => setRevNombre(e.target.value)} required placeholder="Tu nombre"
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-boko-border text-sm focus:outline-none focus:border-[#796a73]" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-gray-500">Comentario</label>
                    <textarea value={revTexto} onChange={e => setRevTexto(e.target.value)} required rows={4}
                      placeholder="Cuéntanos qué te pareció el producto..."
                      className="w-full px-4 py-3 rounded-xl bg-white border border-boko-border text-sm resize-none focus:outline-none focus:border-[#796a73]" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-gray-500">Fotos (opcional, máx. {MAX_REVIEW_PHOTOS})</label>
                    <div className="flex flex-wrap gap-3">
                      {revPreviews.map((src, i) => (
                        <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden">
                          <img src={src} alt="" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => removeRevFile(i)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center">
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                          </button>
                        </div>
                      ))}
                      {revFiles.length < MAX_REVIEW_PHOTOS && (
                        <button type="button" onClick={() => reviewFileRef.current?.click()}
                          className="w-20 h-20 rounded-xl border-2 border-dashed border-boko-border flex flex-col items-center justify-center gap-1 text-boko-muted hover:border-[#796a73] hover:text-[#796a73] transition-colors">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 5v14M5 12h14"/></svg>
                          <span className="text-xs">Foto</span>
                        </button>
                      )}
                    </div>
                    <input ref={reviewFileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleRevFiles} />
                  </div>
                  <button type="submit" disabled={revSubmitting}
                    className="w-fit px-7 py-2.5 rounded-xl bg-[#796a73] text-white text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-60">
                    {revSubmitting ? "Enviando..." : "Publicar reseña"}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Lista de reseñas */}
          {reviews.length === 0 ? (
            <p className="text-sm text-boko-muted text-center py-10">Aún no hay reseñas. ¡Sé el primero!</p>
          ) : (
            <div className="flex flex-col divide-y divide-boko-border">
              {reviews.map((r) => (
                <div key={r.id} className="py-7">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#796a73]/20 flex items-center justify-center text-[#796a73] font-bold text-sm shrink-0">
                        {r.nombre[0]?.toUpperCase()}
                      </div>
                      <span className="font-semibold text-boko-dark text-sm">{r.nombre}</span>
                    </div>
                    <span className="text-xs text-boko-muted whitespace-nowrap">{r.created_at ? timeAgo(r.created_at) : ""}</span>
                  </div>
                  <p className="text-sm text-boko-muted leading-relaxed mb-4">{r.texto}</p>
                  {r.fotos?.length > 0 && (
                    <div className="flex gap-3 mb-4">
                      {r.fotos.map((src, i) => (
                        <a key={i} href={src} target="_blank" rel="noopener noreferrer"
                          className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 block shrink-0">
                          <img src={src} alt="Foto reseña" className="w-full h-full object-cover hover:opacity-90 transition-opacity" />
                        </a>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Stars n={r.rating} size={14} />
                    <span className="text-xs text-boko-muted">{r.rating}.0 rating</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* También te podría interesar */}
        {related.length > 0 && (
          <div className="mt-16 pt-10 border-t border-boko-border">
            <h3 className="font-serif text-2xl font-bold text-boko-dark mb-8">También te podría interesar</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p) => {
                const img = p.imagenes?.[0] ?? "/images/products/product-1.jpg";
                const discount = p.precio_anterior ? Math.round((1 - p.precio / p.precio_anterior) * 100) : 0;
                return (
                  <div key={p.id} className="flex flex-col gap-3">
                    <Link href={`/tienda/${p.slug}`} className="block">
                      <div className="relative aspect-square bg-boko-cream rounded-2xl overflow-hidden group">
                        {discount > 0 && (
                          <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-[#6B9E7A] text-white text-xs font-semibold">
                            {discount}% OFF
                          </span>
                        )}
                        <img src={img} alt={p.nombre} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); addToWishlist(p.id); }}
                          className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-1.5 py-2.5 bg-boko-dark/75 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill={wishAdded[p.id] ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                          </svg>
                          {wishAdded[p.id] ? "¡Guardado!" : "Añadir a deseados"}
                        </button>
                      </div>
                    </Link>
                    <div className="flex flex-col gap-1">
                      <h4 className="font-serif font-bold text-boko-dark text-sm leading-snug">{p.nombre}</h4>
                      {p.categories && <span className="text-xs text-boko-muted">{p.categories.nombre}</span>}
                      <Stars n={5} size={13} />
                      <p className="font-serif font-bold text-boko-dark text-lg mt-0.5">${p.precio.toLocaleString("es-CO")}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Feature cards */}
      <div className="max-w-[1512px] mx-auto px-4 md:px-24 pt-4 pb-16">
        <div className="flex flex-col md:flex-row gap-4 md:gap-10">
          {[
            { icon: "/images/icons/icon-box.svg",     title: "Envío gratis",    desc: "Envío gratis a partir de $150.000" },
            { icon: "/images/icons/icon-wallet.svg",  title: "Pagos flexibles", desc: "Múltiples opciones de pago" },
            { icon: "/images/icons/icon-headset.svg", title: "Contacto 24/7",   desc: "Estamos conectados todos los días" },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-white rounded-3xl flex-1 p-6 shadow-[0px_4px_4px_rgba(0,0,0,0.08),0px_4px_16px_rgba(0,0,0,0.08)]">
              <div className="flex items-start justify-between mb-4">
                <img src={icon} alt="" className="w-[34px] h-[34px]" />
                <img src="/images/icons/icon-tick.svg" alt="" className="w-6 h-6" />
              </div>
              <p className="font-serif font-bold text-xl text-[#796a73] leading-snug mb-1">{title}</p>
              <p className="text-sm text-[#77757f]">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
