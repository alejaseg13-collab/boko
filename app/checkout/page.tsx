"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type CartItem = {
  id: string;
  cantidad: number;
  product_id: string;
  products: { id: string; nombre: string; precio: number; imagenes: string[] };
};

type GuestCartItem = { product_id: string; nombre: string; slug: string; precio: number; imagenes: string[]; cantidad: number };

function readGuestCart(): GuestCartItem[] {
  try { return JSON.parse(localStorage.getItem("boko_cart") ?? "[]"); } catch { return []; }
}

function fmt(n: number) { return "$" + n.toLocaleString("es-CO"); }

const inputClass = "w-full px-4 py-2.5 rounded-xl border border-boko-border text-sm text-boko-dark placeholder:text-gray-400 bg-white focus:outline-none focus:border-[#796a73] transition-colors";
const selectClass = `${inputClass} appearance-none`;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-gray-500">{label}</label>
      {children}
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [payment, setPayment] = useState("Tarjeta débito/crédito");
  const [userId, setUserId] = useState<string | null>(null);
  const [orderDone, setOrderDone] = useState(false);

  // Form fields
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [direccion, setDireccion] = useState("");
  const [departamento, setDepartamento] = useState("Cundinamarca");
  const [ciudad, setCiudad] = useState("Bogotá");
  const [codigoPostal, setCodigoPostal] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [nota, setNota] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // Guest checkout — load cart from localStorage
        const guestCart = readGuestCart();
        const normalized: CartItem[] = guestCart.map(g => ({
          id: g.product_id,
          cantidad: g.cantidad,
          product_id: g.product_id,
          products: { id: g.product_id, nombre: g.nombre, precio: g.precio, imagenes: g.imagenes },
        }));
        setCartItems(normalized);
        setLoading(false);
        return;
      }

      setUserId(session.user.id);
      setCorreo(session.user.email ?? "");

      const [{ data: cart }, { data: profile }] = await Promise.all([
        supabase
          .from("cart_items")
          .select("id, cantidad, product_id, products(id, nombre, precio, imagenes)")
          .eq("user_id", session.user.id),
        supabase
          .from("profiles")
          .select("nombre, apellidos, telefono")
          .eq("id", session.user.id)
          .single(),
      ]);

      setCartItems((cart as CartItem[]) ?? []);
      if (profile) {
        setNombre(profile.nombre ?? "");
        setApellidos(profile.apellidos ?? "");
        setTelefono(profile.telefono ?? "");
      }
      setLoading(false);
    }
    load();
  }, []);

  const subtotal = cartItems.reduce((acc, i) => acc + i.products.precio * i.cantidad, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (cartItems.length === 0) return;
    setError("");
    setSubmitting(true);

    const shippingAddress = { nombre, apellidos, direccion, departamento, ciudad, codigo_postal: codigoPostal, correo, telefono };

    try {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: userId,
          status: "Procesando",
          subtotal,
          descuento: 0,
          envio: 0,
          total: subtotal,
          metodo_pago: payment,
          tiempo_entrega_dias: 5,
          shipping_address: shippingAddress,
          billing_address: shippingAddress,
          nota_interna: nota || null,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const { error: itemsError } = await supabase.from("order_items").insert(
        cartItems.map(item => ({
          order_id: order.id,
          product_id: item.product_id,
          nombre: item.products.nombre,
          precio: item.products.precio,
          cantidad: item.cantidad,
          subtotal: item.products.precio * item.cantidad,
          imagen_url: item.products.imagenes?.[0] ?? null,
        }))
      );

      if (itemsError) throw itemsError;

      // Clear cart
      if (userId) {
        await supabase.from("cart_items").delete().eq("user_id", userId);
        router.push("/perfil/pedidos");
      } else {
        localStorage.removeItem("boko_cart");
        setOrderDone(true);
        setSubmitting(false);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al procesar el pedido");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-378 mx-auto px-10 py-12 animate-pulse">
        <div className="grid grid-cols-[1fr_340px] gap-10">
          <div className="h-96 bg-gray-100 rounded-2xl" />
          <div className="h-64 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (orderDone) {
    return (
      <div className="max-w-378 mx-auto px-10 py-24 text-center flex flex-col items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-[#6B9E7A]/10 flex items-center justify-center">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#6B9E7A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h2 className="font-serif text-3xl font-bold text-boko-dark">¡Pedido realizado!</h2>
        <p className="text-boko-muted text-sm max-w-sm">
          Tu pedido ha sido recibido. Te contactaremos pronto con los detalles de envío al correo <strong>{correo}</strong>.
        </p>
        <a href="/tienda" className="px-8 py-3 rounded-xl bg-[#796a73] text-white text-sm font-medium hover:opacity-80 transition-opacity">
          Seguir comprando
        </a>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-378 mx-auto px-10 py-20 text-center">
        <p className="text-boko-muted text-sm">Tu carrito está vacío.</p>
        <a href="/tienda" className="mt-4 inline-block text-sm text-[#796a73] underline">Ir a la tienda</a>
      </div>
    );
  }

  return (
    <div className="max-w-378 mx-auto px-10 py-12">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-[1fr_340px] gap-10 items-start">

          {/* Formulario */}
          <div className="flex flex-col gap-10">

            {error && (
              <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">{error}</p>
            )}

            {/* Información de envío */}
            <div className="flex flex-col gap-5">
              <h2 className="font-bold text-2xl text-boko-dark">Información de envío</h2>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Nombres">
                  <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} required className={inputClass} />
                </Field>
                <Field label="Apellidos">
                  <input type="text" value={apellidos} onChange={e => setApellidos(e.target.value)} required className={inputClass} />
                </Field>
              </div>

              <Field label="Dirección de entrega">
                <input type="text" value={direccion} onChange={e => setDireccion(e.target.value)} required className={inputClass} />
              </Field>

              <div className="grid grid-cols-3 gap-4">
                <Field label="Departamento">
                  <div className="relative">
                    <select value={departamento} onChange={e => setDepartamento(e.target.value)} className={selectClass}>
                      <option>Cundinamarca</option>
                      <option>Antioquia</option>
                      <option>Valle del Cauca</option>
                      <option>Atlántico</option>
                    </select>
                    <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                  </div>
                </Field>
                <Field label="Ciudad">
                  <div className="relative">
                    <select value={ciudad} onChange={e => setCiudad(e.target.value)} className={selectClass}>
                      <option>Bogotá</option>
                      <option>Chía</option>
                      <option>Medellín</option>
                      <option>Cali</option>
                    </select>
                    <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                  </div>
                </Field>
                <Field label="Código postal">
                  <input type="text" value={codigoPostal} onChange={e => setCodigoPostal(e.target.value)} className={inputClass} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Correo">
                  <input type="email" value={correo} onChange={e => setCorreo(e.target.value)} required className={inputClass} />
                </Field>
                <Field label="Teléfono">
                  <input type="tel" value={telefono} onChange={e => setTelefono(e.target.value)} className={inputClass} />
                </Field>
              </div>
            </div>

            {/* Separador */}
            <div className="border-t border-boko-border" />

            {/* Información adicional */}
            <div className="flex flex-col gap-4">
              <h2 className="font-bold text-2xl text-boko-dark">Información adicional</h2>
              <Field label="Notas del pedido (Opcional)">
                <textarea
                  value={nota}
                  onChange={e => setNota(e.target.value)}
                  placeholder="Notas extra sobre tu pedido."
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border border-boko-border text-sm placeholder:text-gray-400 bg-white focus:outline-none focus:border-[#796a73] transition-colors resize-none"
                />
              </Field>
            </div>

          </div>

          {/* Resumen del pedido */}
          <div className="bg-white rounded-2xl border border-boko-border p-6 flex flex-col gap-5 sticky top-32">
            <h2 className="font-bold text-base text-boko-dark">Resumen del pedido</h2>

            {/* Items */}
            <div className="flex flex-col gap-3">
              {cartItems.map((item) => {
                const img = item.products.imagenes?.[0] ?? "/images/products/product-1.jpg";
                return (
                  <div key={item.id} className="flex items-center gap-3">
                    <img src={img} alt={item.products.nombre} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                    <p className="flex-1 text-xs text-boko-dark leading-snug">{item.products.nombre}</p>
                    <span className="text-xs text-gray-400 whitespace-nowrap">x{item.cantidad}</span>
                    <span className="text-xs font-semibold text-boko-dark whitespace-nowrap">{fmt(item.products.precio)}</span>
                  </div>
                );
              })}
            </div>

            {/* Totales */}
            <div className="flex flex-col gap-2 text-sm border-t border-boko-border pt-4">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal:</span>
                <span>{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Envío:</span>
                <span>Gratis</span>
              </div>
              <div className="flex justify-between font-bold text-boko-dark text-base pt-2 border-t border-boko-border mt-1">
                <span>Total:</span>
                <span>{fmt(subtotal)}</span>
              </div>
            </div>

            {/* Método de pago */}
            <div className="flex flex-col gap-2">
              <p className="font-bold text-sm text-boko-dark">Método de pago</p>
              {["Nequi", "PSE", "Tarjeta débito/crédito"].map((method) => (
                <label key={method} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    checked={payment === method}
                    onChange={() => setPayment(method)}
                    className="accent-[#796a73]"
                  />
                  <span className="text-sm text-gray-600">{method}</span>
                </label>
              ))}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-[#796a73] text-white text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-60"
            >
              {submitting ? "Procesando..." : "Confirmar pedido"}
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}
