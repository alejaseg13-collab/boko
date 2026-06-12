"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/tienda", label: "Tienda" },
  { href: "/personalizados", label: "Personalizados" },
  { href: "/contacto", label: "Contacto" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [profileHref, setProfileHref] = useState("/perfil");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { setProfileHref("/iniciar-sesion"); return; }
      const metaRole = session.user.user_metadata?.role as string | undefined;
      if (metaRole === "admin") { setProfileHref("/admin"); return; }
      supabase.from("profiles").select("role").eq("id", session.user.id).single().then(({ data }) => {
        setProfileHref(data?.role === "admin" ? "/admin" : "/perfil");
      });
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) { setProfileHref("/iniciar-sesion"); return; }
      const metaRole = session.user.user_metadata?.role as string | undefined;
      if (metaRole === "admin") { setProfileHref("/admin"); return; }
      supabase.from("profiles").select("role").eq("id", session.user.id).single().then(({ data }) => {
        setProfileHref(data?.role === "admin" ? "/admin" : "/perfil");
      });
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const iconClass = "hover:text-[#5a4a54] transition-colors";

  const icons = (
    <>
      <button aria-label="Buscar" className={iconClass}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
      </button>
      <Link href="/carrito" aria-label="Carrito" className={iconClass}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      </Link>
      <Link href="/wishlist" aria-label="Lista de deseos" className={iconClass}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </Link>
      <Link href={profileHref} aria-label="Mi cuenta" className={iconClass}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
      </Link>
    </>
  );

  return (
    <>
      <header className="bg-boko-cream border-b border-boko-border sticky top-0 z-50">
        <div className="max-w-[1512px] mx-auto px-4 md:px-6 h-[72px] md:h-[93px] flex items-center justify-between">

          {/* Izquierda: hamburguesa + logo (móvil) | logo solo (desktop) */}
          <div className="flex items-center gap-3">
            {/* Hamburguesa — solo móvil */}
            <button
              aria-label="Menú"
              className="md:hidden text-[#796a73] hover:text-[#5a4a54] transition-colors"
              onClick={() => setMenuOpen(v => !v)}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                <line x1="3" y1="7" x2="21" y2="7" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="17" x2="21" y2="17" />
              </svg>
            </button>

            {/* Logo — móvil: junto al hamburger | desktop: solo */}
            <Link href="/" className="shrink-0">
              <Image src="/images/logo.png" alt="Bokō" width={190} height={72}
                className="h-10 md:h-16 w-auto object-contain mix-blend-multiply" priority />
            </Link>
          </div>

          {/* Nav links — solo desktop */}
          <nav className="hidden md:flex items-center gap-8">
            {links.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <Link key={href} href={href}
                  className={`text-sm font-medium transition-colors relative pb-1 text-[#796a73] ${
                    isActive
                      ? "after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-[#796a73]"
                      : "hover:text-[#5a4a54]"
                  }`}>
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Íconos — siempre visibles */}
          <div className="flex items-center gap-3 md:gap-5 text-[#796a73]">
            {icons}
          </div>
        </div>
      </header>

      {/* Mobile menu — fullscreen overlay */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-60 flex flex-col" style={{ backgroundColor: '#796a73' }}>
          {/* Header del menú */}
          <div className="h-[72px] flex items-center px-4 border-b border-white/20">
            <button
              aria-label="Cerrar menú"
              className="text-white"
              onClick={() => setMenuOpen(false)}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Links */}
          <nav className="flex flex-col px-8 pt-6">
            {links.map(({ href, label }, i) => (
              <div key={href}>
                <Link href={href}
                  className="block py-4 text-white font-bold text-lg tracking-wide"
                  onClick={() => setMenuOpen(false)}>
                  {label}
                </Link>
                {i < links.length - 1 && <div className="h-px bg-white/30" />}
              </div>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
