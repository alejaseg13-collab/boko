"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Client = {
  id: string;
  nombre: string | null;
  apellidos: string | null;
  email: string | null;
  telefono: string | null;
  avatar_url: string | null;
  order_count: number;
};

export default function AdminClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // Load all customer profiles
      type ProfileRow = { id: string; nombre: string | null; apellidos: string | null; email: string | null; telefono: string | null; avatar_url: string | null };
      const { data: profilesRaw } = await supabase
        .from("profiles")
        .select("id, nombre, apellidos, email, telefono, avatar_url")
        .eq("role", "customer")
        .order("created_at", { ascending: false });

      const profiles = (profilesRaw ?? []) as ProfileRow[];

      // Count orders per user
      const { data: orderCounts } = await supabase
        .from("orders")
        .select("user_id");

      const countMap: Record<string, number> = {};
      (orderCounts ?? []).forEach((o: { user_id: string | null }) => {
        if (o.user_id) countMap[o.user_id] = (countMap[o.user_id] ?? 0) + 1;
      });

      setClients(profiles.map(p => ({
        id: p.id,
        nombre: p.nombre,
        apellidos: p.apellidos,
        email: p.email,
        telefono: p.telefono,
        avatar_url: p.avatar_url,
        order_count: countMap[p.id] ?? 0,
      })));
      setLoading(false);
    }
    load();
  }, []);

  const filtered = clients.filter(c =>
    [c.nombre, c.apellidos, c.email].filter(Boolean).join(" ").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="font-serif text-2xl font-bold text-[#796a73]">Gestión de clientes</h1>
        <span className="text-sm text-gray-400">{clients.length} clientes registrados</span>
      </div>

      {/* Buscador */}
      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input
          type="text"
          placeholder="Buscar por nombre o correo..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-boko-border text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#796a73] bg-white"
        />
      </div>

      <div className="bg-white rounded-2xl border border-boko-border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-boko-muted animate-pulse">Cargando clientes...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-boko-muted">
            {search ? "No se encontraron clientes." : "Aún no hay clientes registrados."}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-boko-border">
                <th className="text-left px-6 py-3.5 text-xs text-gray-400 font-medium">Cliente</th>
                <th className="text-left px-6 py-3.5 text-xs text-gray-400 font-medium">Correo</th>
                <th className="text-left px-6 py-3.5 text-xs text-gray-400 font-medium">Teléfono</th>
                <th className="text-left px-6 py-3.5 text-xs text-gray-400 font-medium">Pedidos</th>
                <th className="px-6 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(client => {
                const name = [client.nombre, client.apellidos].filter(Boolean).join(" ") || "Sin nombre";
                const initials = name[0]?.toUpperCase() ?? "?";
                return (
                  <tr key={client.id} className="border-b border-boko-border last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {client.avatar_url ? (
                          <img src={client.avatar_url} alt={name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-[#796a73]/20 flex items-center justify-center text-[#796a73] font-bold text-sm shrink-0">
                            {initials}
                          </div>
                        )}
                        <span className="font-medium text-boko-dark">{name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{client.email ?? "—"}</td>
                    <td className="px-6 py-4 text-gray-400">{client.telefono ?? "—"}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#796a73]/10 text-[#796a73]">
                        {client.order_count} pedido{client.order_count !== 1 ? "s" : ""}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-[#796a73] text-xs hover:underline font-medium">Ver perfil</button>
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
