"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

export default function CrearCuentaPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (!terms) {
      setError("Debes aceptar los términos y condiciones");
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password, nombre, apellidos);
      fetch("/api/welcome-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, nombre }),
      }).catch(() => {});
      router.push("/perfil");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al crear la cuenta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[50%_50%] md:min-h-[85vh]">

      {/* Imagen izquierda */}
      <div className="hidden md:block relative">
        <img
          src="/images/products/login-hero.png?v=2"
          alt="Bokō amigurumis"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
      </div>

      {/* Formulario derecha */}
      <div className="flex flex-col items-center justify-start md:justify-center px-4 pt-6 pb-10 md:px-10 md:py-12 bg-white col-span-1 gap-6">
        <img src="/images/logo.png" alt="Bokō" className="h-24 md:h-32 object-contain mix-blend-multiply" />
        <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white rounded-2xl shadow-[0_12px_60px_rgba(0,0,0,0.18)] p-6 md:p-10 flex flex-col gap-4 md:gap-5">
          <h1 className="font-serif text-2xl text-[#796a73] text-center">Crear cuenta</h1>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-xl text-center">{error}</p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nombres"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-boko-border text-sm text-boko-dark placeholder:text-boko-muted focus:outline-none focus:border-[#796a73]"
            />
            <input
              type="text"
              placeholder="Apellidos"
              value={apellidos}
              onChange={e => setApellidos(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-boko-border text-sm text-boko-dark placeholder:text-boko-muted focus:outline-none focus:border-[#796a73]"
            />
          </div>

          <input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-boko-border text-sm text-boko-dark placeholder:text-boko-muted focus:outline-none focus:border-[#796a73]"
          />

          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-boko-border text-sm text-boko-dark placeholder:text-boko-muted focus:outline-none focus:border-[#796a73] pr-11"
            />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-boko-muted hover:text-boko-dark transition-colors">
              <EyeIcon open={showPass} />
            </button>
          </div>

          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirmar contraseña"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-boko-border text-sm text-boko-dark placeholder:text-boko-muted focus:outline-none focus:border-[#796a73] pr-11"
            />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-boko-muted hover:text-boko-dark transition-colors">
              <EyeIcon open={showConfirm} />
            </button>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={terms}
              onChange={e => setTerms(e.target.checked)}
              className="w-5 h-5 rounded accent-[#796a73] shrink-0"
            />
            <span className="text-sm text-boko-muted">Acepto los términos y condiciones.</span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#796a73] text-white text-sm font-medium hover:bg-[#5a4a54] transition-colors disabled:opacity-60"
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>

          <p className="text-center text-sm text-boko-muted">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/iniciar-sesion" className="font-bold text-boko-dark hover:underline">
              Inicia sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
