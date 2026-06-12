"use client";

import { useState } from "react";

const fieldClass = "flex flex-col gap-1 bg-boko-cream rounded-xl px-4 py-3 shadow-[0_4px_16px_rgba(0,0,0,0.08)]";
const inputClass = "text-sm text-boko-muted placeholder:text-boko-muted bg-transparent focus:outline-none";

export default function HomeForm() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [privacidad, setPrivacidad] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!privacidad) { setError("Acepta la política de privacidad para continuar."); return; }
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/contact-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, correo, descripcion, tipo: "inicio" }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
    } catch {
      setError("No se pudo enviar. Intenta de nuevo.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="bg-[#f0ece8] rounded-2xl p-6 flex flex-col items-center gap-3 text-center">
        <p className="text-2xl">✓</p>
        <p className="font-semibold text-[#796a73]">¡Mensaje enviado!</p>
        <p className="text-sm text-boko-muted">Te respondemos lo antes posible.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="bg-[#f0ece8] rounded-2xl p-6 flex flex-col gap-4">
        <div className={fieldClass}>
          <label className="text-xs font-medium text-boko-dark">Nombre completo *</label>
          <input required type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ingresa tu nombre completo" className={inputClass} />
        </div>
        <div className={fieldClass}>
          <label className="text-xs font-medium text-boko-dark">Correo electrónico *</label>
          <input required type="email" value={correo} onChange={e => setCorreo(e.target.value)} placeholder="Ejemplo: nombre@dominio.com" className={inputClass} />
        </div>
        <div className={fieldClass}>
          <label className="text-xs font-medium text-boko-dark">Descripción *</label>
          <textarea required rows={4} value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Escribe aquí tu mensaje" className={`${inputClass} resize-none`} />
        </div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={privacidad} onChange={e => setPrivacidad(e.target.checked)} className="mt-0.5 w-5 h-5 rounded accent-[#796a73] shrink-0" />
          <span className="text-xs text-boko-muted">Acepto la <a href="/terminos" target="_blank" className="underline hover:text-[#796a73]">política de privacidad y términos y condiciones</a> de Boko.</span>
        </label>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button type="submit" disabled={sending} className="w-fit px-8 py-3 rounded-xl bg-[#796a73] text-white text-sm font-medium hover:bg-[#5a4a54] transition-colors disabled:opacity-60">
          {sending ? "Enviando..." : "Enviar"}
        </button>
      </div>
    </form>
  );
}
