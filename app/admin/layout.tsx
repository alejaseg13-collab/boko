"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";

const navItems = [
  {
    href: "/admin/pedidos",
    label: "Pedidos",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
        <rect x="9" y="3" width="6" height="4" rx="1"/>
        <path d="M9 12h6M9 16h4"/>
      </svg>
    ),
  },
  {
    href: "/admin/inventario",
    label: "Inventario",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    href: "/admin/productos",
    label: "Productos",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    ),
  },
  {
    href: "/admin/resenas",
    label: "Reseñas",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        <path d="M8 10h8M8 14h5"/>
      </svg>
    ),
  },
  {
    href: "/admin/clientes",
    label: "Clientes",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    href: "/admin/perfil",
    label: "Mi perfil",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/iniciar-sesion");
  }

  return (
    <div className="max-w-378 mx-auto px-10 py-10">
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8">

        {/* Sidebar */}
        <aside className="bg-white rounded-2xl border border-boko-border overflow-hidden h-fit">
          <div className="px-5 py-4 border-b border-boko-border">
            <p className="font-serif font-bold text-xl text-[#796a73]">Panel Admin</p>
          </div>
          <nav className="flex flex-col">
            {navItems.map(({ href, label, icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-5 py-3.5 text-sm transition-colors border-l-2 ${
                    active
                      ? "bg-gray-50 text-[#796a73] font-semibold border-[#796a73]"
                      : "text-gray-400 hover:bg-gray-50 hover:text-gray-600 border-transparent"
                  }`}
                >
                  <span className={active ? "text-[#796a73]" : "text-gray-400"}>{icon}</span>
                  <span>{label}</span>
                </Link>
              );
            })}
            <button onClick={handleSignOut} className="flex items-center gap-3 px-5 py-3.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-100 w-full text-left">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span>Cerrar sesión</span>
            </button>
          </nav>
        </aside>

        {/* Contenido */}
        <div>{children}</div>
      </div>
    </div>
  );
}
