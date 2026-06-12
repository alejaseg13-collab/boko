"use client";

import { useState } from "react";

const fieldClass = "flex flex-col gap-1 bg-white/80 rounded-xl px-4 py-3 border border-[#796a73]/10";
const inputClass = "text-sm text-[#796a73]/60 placeholder:text-[#796a73]/40 bg-transparent focus:outline-none";

export default function ContactoForm() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [motivo, setMotivo] = useState("");
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
        body: JSON.stringify({ nombre, correo, motivo, descripcion, tipo: "contacto" }),
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
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <p className="text-3xl">✓</p>
        <p className="font-semibold text-[#796a73] text-lg">¡Mensaje enviado!</p>
        <p className="text-sm text-[#796a73]/60">Te respondemos lo antes posible.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <h2 className="font-serif text-3xl md:text-5xl text-[#796a73] leading-tight">
        Te damos respuesta<br /><span className="font-bold">lo antes posible</span>
      </h2>
      <div className="flex flex-col gap-3">
        <div className={fieldClass}>
          <label className="text-xs font-medium text-[#796a73]">Nombre completo *</label>
          <input required type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ingresa tu nombre completo" className={inputClass} />
        </div>
        <div className={fieldClass}>
          <label className="text-xs font-medium text-[#796a73]">Correo electrónico *</label>
          <input required type="email" value={correo} onChange={e => setCorreo(e.target.value)} placeholder="Ejemplo: nombre@dominio.com" className={inputClass} />
        </div>
        <div className={fieldClass}>
          <label className="text-xs font-medium text-[#796a73]">Motivo *</label>
          <input required type="text" value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Título" className={inputClass} />
        </div>
        <div className={fieldClass}>
          <label className="text-xs font-medium text-[#796a73]">Descripción *</label>
          <textarea required rows={4} value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Escribe aquí tu mensaje" className={`${inputClass} resize-none`} />
        </div>
      </div>
      <label className="flex items-start gap-3 cursor-pointer">
        <input type="checkbox" checked={privacidad} onChange={e => setPrivacidad(e.target.checked)} className="mt-0.5 w-5 h-5 accent-[#796a73] shrink-0" />
        <span className="text-xs text-[#796a73]/70">Acepto la <a href="/terminos" target="_blank" className="underline hover:opacity-80">política de privacidad</a> de Boko.</span>
      </label>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button type="submit" disabled={sending} className="w-full md:w-fit px-12 py-3 rounded-full bg-[#796a73] text-white text-sm font-medium hover:bg-[#5a4a54] transition-colors disabled:opacity-60">
        {sending ? "Enviando..." : "Enviar"}
      </button>
    </form>
  );
}
