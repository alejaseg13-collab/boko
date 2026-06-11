"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type WishItem = {
  id: string;
  product_id: string;
  products: {
    id: string;
    nombre: string;
    slug: string;
    precio: number;
    precio_anterior: number | null;
    imagenes: string[];
    stock: number;
  };
};

export default function WishlistPage() {
  const router = useRouter();
  const [items, setItems] = useState<WishItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/iniciar-sesion"); return; }
      setUserId(session.user.id);

      const { data } = await supabase
        .from("wishlist")
        .select("id, product_id, products(id, nombre, slug, precio, precio_anterior, imagenes, stock)")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      setItems((data as WishItem[]) ?? []);
      setLoading(false);
    }
    load();
  }, [router]);

  async function removeItem(wishId: string) {
    await supabase.from("wishlist").delete().eq("id", wishId);
    setItems(prev => prev.filter(i => i.id !== wishId));
  }

  async function addToCart(item: WishItem) {
    const { error } = await supabase.from("cart_items").upsert(
      { user_id: userId, product_id: item.product_id, cantidad: 1 },
      { onConflict: "user_id,product_id" }
    );
    if (!error) router.push("/carrito");
  }

  return (
    <div className="max-w-378 mx-auto px-10 py-12">
      <h1 className="font-serif text-4xl font-bold text-[#796a73] text-center mb-10">
        Lista de deseados
      </h1>

      <div className="bg-white rounded-2xl border border-boko-border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-boko-muted animate-pulse">Cargando lista de deseados...</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-4">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C5BFB8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <p className="text-boko-muted text-sm">Tu lista de deseados está vacía.</p>
            <Link href="/tienda" className="text-sm text-[#796a73] underline">Explorar tienda</Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-boko-border">
                <th className="text-left px-6 py-4 text-xs font-bold text-boko-dark">Producto</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-boko-dark">Precio</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-boko-dark">Estado</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const p = item.products;
                const img = p.imagenes?.[0] ?? "/images/products/product-1.jpg";
                return (
                  <tr key={item.id} className="border-b border-boko-border last:border-0">
                    {/* Producto */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <Link href={`/tienda/${p.slug}`}>
                          <img src={img} alt={p.nombre} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                        </Link>
                        <Link href={`/tienda/${p.slug}`} className="text-boko-dark font-medium hover:underline">
                          {p.nombre}
                        </Link>
                      </div>
                    </td>

                    {/* Precio */}
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="text-boko-dark font-medium">${p.precio.toLocaleString("es-CO")} </span>
                      {p.precio_anterior && (
                        <span className="text-gray-400 line-through text-xs">${p.precio_anterior.toLocaleString("es-CO")}</span>
                      )}
                    </td>

                    {/* Estado */}
                    <td className="px-6 py-5">
                      {p.stock > 0 ? (
                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">En Stock</span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-red-50 text-red-500 text-xs font-medium">Sin Stock</span>
                      )}
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3 justify-end">
                        <button
                          onClick={() => addToCart(item)}
                          disabled={p.stock === 0}
                          className={`px-5 py-2.5 rounded-xl text-xs font-medium transition-opacity whitespace-nowrap ${
                            p.stock === 0
                              ? "bg-gray-200 text-gray-400 cursor-default"
                              : "bg-[#796a73] text-white hover:opacity-80"
                          }`}
                        >
                          Añadir al carrito
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-gray-300 text-gray-400 hover:border-gray-500 hover:text-gray-600 transition-colors shrink-0"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M18 6L6 18M6 6l12 12"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
