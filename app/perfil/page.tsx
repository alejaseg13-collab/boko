"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Profile = { id: string; nombre: string | null; apellidos: string | null; email: string | null; telefono: string | null; avatar_url: string | null };
type Order = { id: string; created_at: string; total: number; status: string; shipping_address: Record<string, string> | null; order_items: { count: number }[] };

const statusColor: Record<string, string> = {
  "En camino":  "text-[#2D7A5F]",
  "Procesando": "text-[#C07A2D]",
  "Entregado":  "text-boko-muted",
  "Cancelado":  "text-red-500",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
}

export default function PerfilDashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/iniciar-sesion"); return; }

      const [{ data: prof }, { data: ords }] = await Promise.all([
        supabase.from("profiles").select("id, nombre, apellidos, email, telefono, avatar_url").eq("id", session.user.id).single(),
        supabase.from("orders")
          .select("id, created_at, total, status, shipping_address, order_items(count)")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(6),
      ]);

      setProfile(prof as Profile);
      setOrders((ords as Order[]) ?? []);
      setLoading(false);
    }
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="grid grid-cols-2 gap-6">
          <div className="h-48 bg-gray-100 rounded-2xl" />
          <div className="h-48 bg-gray-100 rounded-2xl" />
        </div>
        <div className="h-64 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  const fullName = [profile?.nombre, profile?.apellidos].filter(Boolean).join(" ") || "Sin nombre";
  const lastAddr = orders[0]?.shipping_address;

  return (
    <div className="flex flex-col gap-6">

      {/* Fila superior */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Perfil */}
        <div className="bg-white rounded-2xl border border-boko-border p-8 flex flex-col items-center gap-3">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-[#796a73]/20 flex items-center justify-center text-[#796a73] font-bold text-2xl">
              {fullName[0]?.toUpperCase() ?? "?"}
            </div>
          )}
          <p className="font-serif font-bold text-lg text-boko-dark">{fullName}</p>
          <Link href="/perfil/configuracion" className="text-sm text-boko-muted underline hover:text-boko-dark transition-colors">
            Editar perfil
          </Link>
        </div>

        {/* Detalles de contacto */}
        <div className="bg-white rounded-2xl border border-boko-border p-8 flex flex-col gap-3">
          <p className="font-bold text-base text-boko-dark">Detalles de pago</p>
          <div className="flex flex-col gap-1 text-sm">
            <p className="font-semibold text-boko-dark">{fullName}</p>
            {lastAddr?.direccion && (
              <p className="text-boko-muted">{lastAddr.direccion}{lastAddr.ciudad ? `, ${lastAddr.ciudad}` : ""}</p>
            )}
            <p className="text-boko-muted">{profile?.email ?? "—"}</p>
            {profile?.telefono && <p className="text-boko-muted">{profile.telefono}</p>}
          </div>
          <Link href="/perfil/configuracion" className="mt-2 w-fit px-5 py-2 rounded-lg bg-boko-dark text-white text-sm font-medium hover:opacity-80 transition-opacity">
            Editar detalles
          </Link>
        </div>
      </div>

      {/* Historial de pedidos */}
      <div className="bg-white rounded-2xl border border-boko-border overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-boko-border">
          <p className="font-bold text-sm text-boko-dark">Historial reciente de pedidos</p>
          <Link href="/perfil/pedidos" className="text-sm text-boko-muted hover:text-boko-dark underline transition-colors">
            Ver todo
          </Link>
        </div>
        {orders.length === 0 ? (
          <p className="px-6 py-8 text-sm text-boko-muted text-center">Aún no tienes pedidos.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-boko-border bg-boko-cream">
                <th className="text-left px-6 py-3 text-xs text-boko-muted font-medium">ID</th>
                <th className="text-left px-6 py-3 text-xs text-boko-muted font-medium">Fecha</th>
                <th className="text-left px-6 py-3 text-xs text-boko-muted font-medium">Total</th>
                <th className="text-left px-6 py-3 text-xs text-boko-muted font-medium">Estado</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const itemCount = order.order_items?.[0]?.count ?? 0;
                return (
                  <tr key={order.id} className="border-b border-boko-border last:border-0 hover:bg-boko-cream/40 transition-colors">
                    <td className="px-6 py-3.5 text-boko-dark font-medium text-xs">{order.id.slice(0, 8)}…</td>
                    <td className="px-6 py-3.5 text-boko-muted">{fmtDate(order.created_at)}</td>
                    <td className="px-6 py-3.5 text-boko-muted">${order.total.toLocaleString("es-CO")} ({itemCount} prod.)</td>
                    <td className={`px-6 py-3.5 font-medium ${statusColor[order.status] ?? "text-boko-muted"}`}>{order.status}</td>
                    <td className="px-6 py-3.5 text-right">
                      <Link href={`/perfil/pedidos/${order.id}`} className="text-[#E05B7F] text-xs hover:underline">
                        Ver detalles
                      </Link>
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
