"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type CartItem = {
  id: string;
  cantidad: number;
  product_id: string;
  products: { id: string; nombre: string; slug: string; precio: number; imagenes: string[] };
};

type GuestCartItem = { product_id: string; nombre: string; slug: string; precio: number; imagenes: string[]; cantidad: number };

function readGuestCart(): GuestCartItem[] {
  try { return JSON.parse(localStorage.getItem("boko_cart") ?? "[]"); } catch { return []; }
}
function writeGuestCart(cart: GuestCartItem[]) {
  localStorage.setItem("boko_cart", JSON.stringify(cart));
}
function normalizeGuest(cart: GuestCartItem[]): CartItem[] {
  return cart.map(g => ({
    id: g.product_id,
    cantidad: g.cantidad,
    product_id: g.product_id,
    products: { id: g.product_id, nombre: g.nombre, slug: g.slug, precio: g.precio, imagenes: g.imagenes },
  }));
}

function fmt(n: number) { return "$" + n.toLocaleString("es-CO"); }

export default function CarritoPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [cupon, setCupon] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsGuest(true);
        setItems(normalizeGuest(readGuestCart()));
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("cart_items")
        .select("id, cantidad, product_id, products(id, nombre, slug, precio, imagenes)")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: true });
      setItems((data as CartItem[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function changeQty(item: CartItem, delta: number) {
    const newQty = Math.max(1, item.cantidad + delta);
    if (isGuest) {
      const cart = readGuestCart();
      const found = cart.find(i => i.product_id === item.product_id);
      if (found) { found.cantidad = newQty; writeGuestCart(cart); }
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, cantidad: newQty } : i));
      return;
    }
    await supabase.from("cart_items").update({ cantidad: newQty }).eq("id", item.id);
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, cantidad: newQty } : i));
  }

  async function remove(item: CartItem) {
    if (isGuest) {
      const cart = readGuestCart().filter(i => i.product_id !== item.product_id);
      writeGuestCart(cart);
      setItems(prev => prev.filter(i => i.id !== item.id));
      return;
    }
    await supabase.from("cart_items").delete().eq("id", item.id);
    setItems(prev => prev.filter(i => i.id !== item.id));
  }

  const subtotal = items.reduce((acc, i) => acc + i.products.precio * i.cantidad, 0);

  return (
    <div className="max-w-378 mx-auto px-4 md:px-10 py-8 md:py-12">

      <h1 className="font-serif text-4xl font-bold text-[#796a73] text-center mb-8 md:mb-10">
        Carrito
      </h1>

      {loading ? (
        <div className="animate-pulse flex flex-col gap-4">
          <div className="h-48 bg-gray-100 rounded-2xl" />
          <div className="h-24 bg-gray-100 rounded-2xl" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#C5BFB8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          <p className="text-boko-muted text-sm">Tu carrito está vacío.</p>
          <Link href="/tienda" className="px-6 py-2.5 rounded-xl bg-[#796a73] text-white text-sm font-medium hover:opacity-80 transition-opacity">
            Ir a la tienda
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6 items-start">

          {/* Columna izquierda */}
          <div className="flex flex-col gap-4">

            {/* ── MÓVIL: tarjetas ── */}
            <div className="md:hidden flex flex-col gap-3">
              {items.map((item) => {
                const img = item.products.imagenes?.[0] ?? "/images/products/product-1.jpg";
                return (
                  <div key={item.id} className="bg-white rounded-2xl border border-boko-border p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <Link href={`/tienda/${item.products.slug}`}>
                        <img src={img} alt={item.products.nombre} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                      </Link>
                      <Link href={`/tienda/${item.products.slug}`} className="flex-1 text-boko-dark font-medium text-sm leading-snug hover:underline">
                        {item.products.nombre}
                      </Link>
                      <button onClick={() => remove(item)} className="w-7 h-7 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-400 hover:border-gray-500 transition-colors shrink-0">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button onClick={() => changeQty(item, -1)} className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 text-sm">−</button>
                        <span className="w-6 text-center text-sm font-medium text-boko-dark">{item.cantidad}</span>
                        <button onClick={() => changeQty(item, +1)} className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 text-sm">+</button>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">{fmt(item.products.precio)} c/u</p>
                        <p className="font-bold text-boko-dark text-sm">{fmt(item.products.precio * item.cantidad)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <Link href="/tienda" className="px-5 py-2.5 rounded-xl bg-gray-100 text-boko-dark text-sm font-medium hover:bg-gray-200 transition-colors inline-block w-fit">
                Volver a la tienda
              </Link>
            </div>

            {/* ── DESKTOP: tabla ── */}
            <div className="hidden md:block bg-white rounded-2xl border border-boko-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-boko-border">
                    <th className="text-left px-6 py-4 text-xs font-bold text-boko-dark">Producto</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-boko-dark">Precio</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-boko-dark">Cantidad</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-boko-dark">Subtotal</th>
                    <th className="px-6 py-4" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const img = item.products.imagenes?.[0] ?? "/images/products/product-1.jpg";
                    return (
                      <tr key={item.id} className="border-b border-boko-border last:border-0">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <Link href={`/tienda/${item.products.slug}`}>
                              <img src={img} alt={item.products.nombre} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                            </Link>
                            <Link href={`/tienda/${item.products.slug}`} className="text-boko-dark font-medium leading-snug hover:underline">
                              {item.products.nombre}
                            </Link>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-gray-500 whitespace-nowrap">{fmt(item.products.precio)}</td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <button onClick={() => changeQty(item, -1)} className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors text-sm shrink-0">−</button>
                            <span className="w-5 text-center text-sm text-boko-dark font-medium">{item.cantidad}</span>
                            <button onClick={() => changeQty(item, +1)} className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors text-sm shrink-0">+</button>
                          </div>
                        </td>
                        <td className="px-6 py-5 font-bold text-boko-dark whitespace-nowrap">{fmt(item.products.precio * item.cantidad)}</td>
                        <td className="px-6 py-5">
                          <button onClick={() => remove(item)} className="w-7 h-7 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-400 hover:border-gray-500 hover:text-gray-600 transition-colors">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                              <path d="M18 6L6 18M6 6l12 12"/>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="px-6 py-4 border-t border-boko-border">
                <Link href="/tienda" className="px-5 py-2.5 rounded-xl bg-gray-100 text-boko-dark text-sm font-medium hover:bg-gray-200 transition-colors inline-block">
                  Volver a la tienda
                </Link>
              </div>
            </div>

            {/* Cupón */}
            <div className="bg-white rounded-2xl border border-boko-border px-4 md:px-6 py-4 flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4">
              <span className="text-sm font-bold text-boko-dark whitespace-nowrap">Cupón</span>
              <input
                type="text"
                placeholder="Ingresa el código"
                value={cupon}
                onChange={e => setCupon(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 text-sm placeholder:text-gray-400 focus:outline-none"
              />
              <button className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-[#796a73] text-white text-sm font-medium hover:opacity-80 transition-opacity whitespace-nowrap">
                Aplicar cupón
              </button>
            </div>

          </div>

          {/* Total del carrito */}
          <div className="bg-white rounded-2xl border border-boko-border p-6 flex flex-col gap-4">
            <h2 className="font-bold text-boko-dark text-base">Total del carrito</h2>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal:</span>
                <span>{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Envío</span>
                <span>Gratis</span>
              </div>
              <div className="flex justify-between font-bold text-boko-dark text-base pt-3 border-t border-boko-border">
                <span>Total:</span>
                <span>{fmt(subtotal)}</span>
              </div>
            </div>
            <Link href="/checkout" className="w-full py-3 rounded-xl bg-[#796a73] text-white text-sm font-medium text-center hover:opacity-80 transition-opacity">
              Ir al checkout
            </Link>
          </div>

        </div>
      )}
    </div>
  );
}
