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

  return (
    <header className="bg-boko-cream border-b border-boko-border sticky top-0 z-50">
      <div className="max-w-[1512px] mx-auto px-6 h-[93px] flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="shrink-0 ml-6">
          <Image
            src="/images/logo.png"
            alt="Bokō — Tejer el alma"
            width={190}
            height={72}
            className="h-16 w-auto object-contain mix-blend-multiply"
            priority
          />
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`text-sm font-medium transition-colors relative pb-1 text-[#796a73] ${
                  isActive
                    ? "after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-[#796a73]"
                    : "hover:text-[#5a4a54]"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Iconos */}
        <div className="flex items-center gap-5 text-[#796a73]">
          <button aria-label="Buscar" className="hover:text-[#5a4a54] transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>
          <Link href="/carrito" aria-label="Carrito" className="hover:text-[#5a4a54] transition-colors relative">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </Link>
          <Link href="/wishlist" aria-label="Lista de deseos" className="hover:text-[#5a4a54] transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </Link>
          <Link href={profileHref} aria-label="Mi cuenta" className="hover:text-[#5a4a54] transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
