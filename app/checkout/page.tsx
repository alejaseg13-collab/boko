"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

declare global {
  interface Window {
    ePayco: {
      checkout: {
        configure: (c: { key: string; test: boolean }) => {
          open: (p: Record<string, string>) => void;
        };
      };
    };
  }
}

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
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [cupon, setCupon] = useState("");
  const [cuponId, setCuponId] = useState<string | null>(null);
  const [descuento, setDescuento] = useState(0);
  const [cuponError, setCuponError] = useState("");
  const [cuponOk, setCuponOk] = useState(false);

  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [direccion, setDireccion] = useState("");
  const [departamento, setDepartamento] = useState("Cundinamarca");
  const [ciudad, setCiudad] = useState("Bogotá");
  const [codigoPostal, setCodigoPostal] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [nota, setNota] = useState("");

  // Load ePayco script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.epayco.co/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { if (document.body.contains(script)) document.body.removeChild(script); };
  }, []);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        const guestCart = readGuestCart();
        setCartItems(guestCart.map(g => ({
          id: g.product_id,
          cantidad: g.cantidad,
          product_id: g.product_id,
          products: { id: g.product_id, nombre: g.nombre, precio: g.precio, imagenes: g.imagenes },
        })));
        setLoading(false);
        return;
      }

      setUserId(session.user.id);
      setCorreo(session.user.email ?? "");

      const [{ data: cart }, { data: profile }] = await Promise.all([
        supabase.from("cart_items").select("id, cantidad, product_id, products(id, nombre, precio, imagenes)").eq("user_id", session.user.id),
        supabase.from("profiles").select("nombre, apellidos, telefono").eq("id", session.user.id).single(),
      ]);

      setCartItems((cart as CartItem[]) ?? []);
      if (profile) {
        setNombre((profile as any).nombre ?? "");
        setApellidos((profile as any).apellidos ?? "");
        setTelefono((profile as any).telefono ?? "");
      }
      setLoading(false);
    }
    load();
  }, []);

  const subtotal = cartItems.reduce((acc, i) => acc + i.products.precio * i.cantidad, 0);
  const total = subtotal - descuento;

  async function aplicarCupon() {
    if (!cupon.trim()) return;
    setCuponError("");
    setCuponOk(false);

    const { data, error } = await supabase
      .from("cupones")
      .select("*")
      .eq("codigo", cupon.trim().toUpperCase())
      .eq("activo", true)
      .single();

    if (error || !data) {
      setCuponError("Cupón no válido o expirado.");
      setDescuento(0);
      return;
    }

    const d = (data as any);

    // Verificar uso único: si ya lo usó este usuario, rechazar
    if (d.uso_unico && userId) {
      const { data: uso } = await supabase
        .from("cupon_usos")
        .select("id")
        .eq("cupon_id", d.id)
        .eq("user_id", userId)
        .maybeSingle();
      if (uso) {
        setCuponError("Este cupón ya fue utilizado.");
        setDescuento(0);
        return;
      }
    }

    const monto = d.tipo === "porcentaje"
      ? Math.round(subtotal * d.valor / 100)
      : Math.min(d.valor, subtotal);
    setDescuento(monto);
    setCuponId(d.id);
    setCuponOk(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (cartItems.length === 0) return;
    setError("");
    setSubmitting(true);

    if (!window.ePayco?.checkout) {
      setError("El sistema de pagos aún no ha cargado. Espera unos segundos y vuelve a intentarlo.");
      setSubmitting(false);
      return;
    }

    const shippingAddress = { nombre, apellidos, direccion, departamento, ciudad, codigo_postal: codigoPostal, correo, telefono };

    try {
      // 1. Crear pedido en Supabase con estado "Pendiente pago"
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: userId,
          status: "Pendiente pago",
          subtotal,
          descuento,
          envio: 0,
          total,
          metodo_pago: "ePayco",
          tiempo_entrega_dias: 5,
          shipping_address: shippingAddress,
          billing_address: shippingAddress,
          nota_interna: nota || null,
        } as any)
        .select()
        .single();

      if (orderError) {
        throw new Error(orderError.message ?? orderError.details ?? JSON.stringify(orderError));
      }

      // 2. Crear items del pedido
      const { error: itemsError } = await supabase.from("order_items").insert(
        cartItems.map(item => ({
          order_id: (order as any).id,
          product_id: item.product_id,
          nombre: item.products.nombre,
          precio: item.products.precio,
          cantidad: item.cantidad,
          subtotal: item.products.precio * item.cantidad,
          imagen_url: item.products.imagenes?.[0] ?? null,
        })) as any
      );

      if (itemsError) {
        throw new Error(itemsError.message ?? itemsError.details ?? JSON.stringify(itemsError));
      }

      // 3. Registrar uso del cupón si aplica
      if (cuponId && userId) {
        await supabase.from("cupon_usos").insert({
          cupon_id: cuponId,
          user_id: userId,
          order_id: (order as any).id,
        } as any);
      }

      // 4. Abrir modal de pago ePayco
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
      const handler = window.ePayco.checkout.configure({
        key: process.env.NEXT_PUBLIC_EPAYCO_PUBLIC_KEY!,
        test: false,
      });

      handler.open({
        name: "Pedido Bokō",
        description: cartItems.map(i => i.products.nombre).join(", ").slice(0, 100),
        invoice: (order as any).id,
        currency: "cop",
        amount: total.toString(),
        tax_base: "0",
        tax: "0",
        country: "CO",
        lang: "es",
        external: "false",
        response: `${siteUrl}/checkout/respuesta`,
        confirmation: `${siteUrl}/api/epayco/confirmacion`,
        email_billing: correo,
        name_billing: `${nombre} ${apellidos}`,
        address_billing: direccion,
        phone_billing: telefono,
      });

      setSubmitting(false);
    } catch (err: unknown) {
      const msg = err instanceof Error
        ? err.message
        : (err as any)?.message ?? (err as any)?.details ?? JSON.stringify(err);
      setError(msg || "Error al procesar el pedido");
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
            {error && <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">{error}</p>}

            <div className="flex flex-col gap-5">
              <h2 className="font-bold text-2xl text-boko-dark">Información de envío</h2>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Nombres"><input type="text" value={nombre} onChange={e => setNombre(e.target.value)} required className={inputClass} /></Field>
                <Field label="Apellidos"><input type="text" value={apellidos} onChange={e => setApellidos(e.target.value)} required className={inputClass} /></Field>
              </div>
              <Field label="Dirección de entrega">
                <input type="text" value={direccion} onChange={e => setDireccion(e.target.value)} required className={inputClass} />
              </Field>
              <div className="grid grid-cols-3 gap-4">
                <Field label="Departamento">
                  <div className="relative">
                    <select value={departamento} onChange={e => setDepartamento(e.target.value)} className={selectClass}>
                      <option>Cundinamarca</option><option>Antioquia</option><option>Valle del Cauca</option><option>Atlántico</option>
                      <option>Santander</option><option>Bolívar</option><option>Nariño</option><option>Otro</option>
                    </select>
                    <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                  </div>
                </Field>
                <Field label="Ciudad">
                  <input type="text" value={ciudad} onChange={e => setCiudad(e.target.value)} required className={inputClass} />
                </Field>
                <Field label="Código postal">
                  <input type="text" value={codigoPostal} onChange={e => setCodigoPostal(e.target.value)} className={inputClass} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Correo"><input type="email" value={correo} onChange={e => setCorreo(e.target.value)} required className={inputClass} /></Field>
                <Field label="Teléfono"><input type="tel" value={telefono} onChange={e => setTelefono(e.target.value)} required className={inputClass} /></Field>
              </div>
            </div>

            <div className="border-t border-boko-border" />

            <div className="flex flex-col gap-4">
              <h2 className="font-bold text-2xl text-boko-dark">Información adicional</h2>
              <Field label="Notas del pedido (Opcional)">
                <textarea value={nota} onChange={e => setNota(e.target.value)} placeholder="Notas extra sobre tu pedido." rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-boko-border text-sm placeholder:text-gray-400 bg-white focus:outline-none focus:border-[#796a73] transition-colors resize-none" />
              </Field>
            </div>
          </div>

          {/* Resumen */}
          <div className="bg-white rounded-2xl border border-boko-border p-6 flex flex-col gap-5 sticky top-32">
            <h2 className="font-bold text-base text-boko-dark">Resumen del pedido</h2>

            <div className="flex flex-col gap-3">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <img src={item.products.imagenes?.[0] ?? "/images/products/product-1.jpg"} alt={item.products.nombre} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                  <p className="flex-1 text-xs text-boko-dark leading-snug">{item.products.nombre}</p>
                  <span className="text-xs text-gray-400 whitespace-nowrap">x{item.cantidad}</span>
                  <span className="text-xs font-semibold text-boko-dark whitespace-nowrap">{fmt(item.products.precio)}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2 text-sm border-t border-boko-border pt-4">
              <div className="flex justify-between text-gray-500"><span>Subtotal:</span><span>{fmt(subtotal)}</span></div>
              {descuento > 0 && (
                <div className="flex justify-between text-green-600"><span>Descuento:</span><span>−{fmt(descuento)}</span></div>
              )}
              <div className="flex justify-between text-gray-500"><span>Envío:</span><span>Gratis</span></div>
              <div className="flex justify-between font-bold text-boko-dark text-base pt-2 border-t border-boko-border mt-1"><span>Total:</span><span>{fmt(total)}</span></div>
            </div>

            {/* Cupón */}
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ingresa el código"
                  value={cupon}
                  onChange={e => { setCupon(e.target.value); setCuponError(""); setCuponOk(false); }}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 text-sm placeholder:text-gray-400 focus:outline-none border border-transparent focus:border-[#796a73]"
                />
              </div>
              <button
                type="button"
                onClick={aplicarCupon}
                className="w-full py-2.5 rounded-xl bg-[#6B9E7A] text-white text-sm font-medium hover:opacity-80 transition-opacity"
              >
                Aplicar cupón
              </button>
              {cuponError && <p className="text-xs text-red-500">{cuponError}</p>}
              {cuponOk && <p className="text-xs text-green-600">¡Cupón aplicado correctamente!</p>}
            </div>

            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#796a73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
              <span className="text-sm text-gray-600">Pago seguro con <strong>ePayco</strong></span>
            </div>

            <button type="submit" disabled={submitting}
              className="w-full py-3 rounded-xl bg-[#796a73] text-white text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-60">
              {submitting ? "Procesando..." : "Ir a pagar"}
            </button>

            <p className="text-xs text-gray-400 text-center">
              Acepta tarjetas, PSE, Nequi, Daviplata y más
            </p>
          </div>

        </div>
      </form>
    </div>
  );
}
