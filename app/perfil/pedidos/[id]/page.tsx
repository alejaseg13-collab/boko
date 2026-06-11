"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Fragment } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type OrderItem = { id: string; nombre: string; precio: number; cantidad: number; subtotal: number; imagen_url: string | null };
type Order = {
  id: string;
  created_at: string;
  status: string;
  subtotal: number;
  descuento: number;
  envio: number;
  total: number;
  metodo_pago: string | null;
  billing_address: Record<string, string> | null;
  shipping_address: Record<string, string> | null;
  order_items: OrderItem[];
};

const steps = [
  { label: "Orden recibida", n: 1 },
  { label: "Procesando",     n: 2 },
  { label: "En camino",      n: 3 },
  { label: "Entregado",      n: 4 },
];

const statusToStep: Record<string, number> = {
  "Procesando": 2,
  "En camino":  3,
  "Entregado":  4,
  "Cancelado":  1,
};

function fmt(n: number) { return "$" + n.toLocaleString("es-CO"); }

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
}

function AddressBlock({ title, addr }: { title: string; addr: Record<string, string> | null }) {
  return (
    <div className="p-6 border-b md:border-b-0 md:border-r border-boko-border">
      <p className="text-xs text-gray-400 mb-4">{title}</p>
      {addr ? (
        <>
          <p className="font-semibold text-boko-dark text-sm mb-1">{addr.nombre ?? "—"}</p>
          <p className="text-sm text-gray-400 mb-5 leading-relaxed">{addr.direccion ?? "—"}</p>
          <div className="flex flex-col gap-3">
            <div><p className="text-xs text-gray-400 mb-0.5">Correo</p><p className="text-sm text-gray-600">{addr.correo ?? "—"}</p></div>
            <div><p className="text-xs text-gray-400 mb-0.5">Teléfono</p><p className="text-sm text-gray-600">{addr.telefono ?? "—"}</p></div>
          </div>
        </>
      ) : (
        <p className="text-sm text-gray-400">Sin información</p>
      )}
    </div>
  );
}

export default function DetallePedidoPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/iniciar-sesion"); return; }

      const { data } = await supabase
        .from("orders")
        .select("id, created_at, status, subtotal, descuento, envio, total, metodo_pago, billing_address, shipping_address, order_items(id, nombre, precio, cantidad, subtotal, imagen_url)")
        .eq("id", id as string)
        .eq("user_id", session.user.id)
        .single();
      setOrder(data as Order | null);
      setLoading(false);
    }
    load();
  }, [id, router]);

  if (loading) {
    return <div className="animate-pulse flex flex-col gap-4"><div className="h-8 bg-gray-100 rounded w-1/3" /><div className="h-48 bg-gray-100 rounded-2xl" /></div>;
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <p className="text-boko-muted">Pedido no encontrado.</p>
        <Link href="/perfil/pedidos" className="text-sm text-[#796a73] underline mt-2 inline-block">Volver</Link>
      </div>
    );
  }

  const current = statusToStep[order.status] ?? 1;

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="font-serif text-2xl font-bold text-[#796a73]">Detalles de pedido</h1>
          <span className="text-gray-300">·</span>
          <span className="text-gray-400 text-sm">{fmtDate(order.created_at)}</span>
          <span className="text-gray-300">·</span>
          <span className="text-gray-400 text-sm">{order.order_items.length} Productos</span>
        </div>
        <Link href="/perfil/pedidos" className="text-sm text-boko-dark underline hover:text-[#796a73] transition-colors whitespace-nowrap">
          Volver a la lista
        </Link>
      </div>

      {/* Addresses + Order Summary */}
      <div className="bg-white rounded-2xl border border-boko-border overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto]">
          <AddressBlock title="Dirección de facturación" addr={order.billing_address as Record<string, string> | null} />
          <AddressBlock title="Dirección de envío" addr={order.shipping_address as Record<string, string> | null} />

          {/* Order totals */}
          <div className="p-6 min-w-55">
            <div className="flex items-start justify-between gap-6 mb-5">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Order ID</p>
                <p className="font-bold text-boko-dark text-sm">{order.id.slice(0, 8)}…</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 mb-0.5">Método de pago</p>
                <p className="font-semibold text-boko-dark text-sm">{order.metodo_pago ?? "—"}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2.5 text-sm border-t border-boko-border pt-4">
              <div className="flex justify-between text-gray-500"><span>Subtotal:</span><span>{fmt(order.subtotal)}</span></div>
              {order.descuento > 0 && (
                <div className="flex justify-between text-gray-500"><span>Descuento</span><span>-{fmt(order.descuento)}</span></div>
              )}
              <div className="flex justify-between text-gray-500"><span>Envío</span><span>{order.envio > 0 ? fmt(order.envio) : "Gratis"}</span></div>
              <div className="flex justify-between font-bold text-boko-dark text-base mt-1 pt-3 border-t border-boko-border">
                <span>Total</span><span>{fmt(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress tracker */}
      <div className="bg-white rounded-2xl border border-boko-border px-10 py-7">
        <div className="relative pb-8">
          <div className="flex items-center">
            {steps.map((step, i) => {
              const isLast  = i === steps.length - 1;
              const done    = step.n < current;
              const active  = step.n === current;
              const pending = step.n > current;

              return (
                <Fragment key={step.n}>
                  <div className="relative shrink-0">
                    {done ? (
                      <div className="w-10 h-10 rounded-full bg-[#796a73] flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </div>
                    ) : active ? (
                      <div className="w-10 h-10 rounded-full bg-boko-dark flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{String(step.n).padStart(2, "0")}</span>
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-white">
                        <span className="text-gray-400 text-xs font-medium">{String(step.n).padStart(2, "0")}</span>
                      </div>
                    )}
                    <span className={`absolute top-full mt-2 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap ${pending ? "text-gray-400" : "text-boko-dark font-medium"}`}>
                      {step.label}
                    </span>
                  </div>
                  {!isLast && (
                    <div className={`flex-1 h-1.5 ${step.n < current ? "bg-[#796a73]" : "bg-gray-200"}`} />
                  )}
                </Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Products table */}
      <div className="bg-white rounded-2xl border border-boko-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-boko-border">
              <th className="text-left px-6 py-3.5 text-xs text-gray-400 font-medium">Producto</th>
              <th className="text-left px-6 py-3.5 text-xs text-gray-400 font-medium">Precio</th>
              <th className="text-left px-6 py-3.5 text-xs text-gray-400 font-medium">Cantidad</th>
              <th className="text-left px-6 py-3.5 text-xs text-gray-400 font-medium">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.order_items.map((item) => (
              <tr key={item.id} className="border-b border-boko-border last:border-0">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {item.imagen_url && (
                      <img src={item.imagen_url} alt={item.nombre} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                    )}
                    <span className="text-boko-dark">{item.nombre}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-400">{fmt(item.precio)}</td>
                <td className="px-6 py-4 text-gray-400">x{item.cantidad}</td>
                <td className="px-6 py-4 font-semibold text-boko-dark">{fmt(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
