"use client";

import { useRef, useState } from "react";

const fieldClass = "flex flex-col gap-1 bg-boko-cream rounded-xl px-4 py-3 shadow-[0_4px_16px_rgba(0,0,0,0.08)]";
const inputClass = "text-sm text-boko-muted placeholder:text-boko-muted bg-transparent focus:outline-none";

export default function PersonalizadosForm() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [privacidad, setPrivacidad] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!privacidad) { setError("Acepta la política de privacidad para continuar."); return; }
    setSending(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("nombre", nombre);
      fd.append("correo", correo);
      fd.append("descripcion", descripcion);
      fd.append("tipo", "personalizados");
      if (archivo) fd.append("archivo", archivo);

      const res = await fetch("/api/contact-email", { method: "POST", body: fd });
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
        <p className="font-semibold text-[#796a73]">¡Solicitud enviada!</p>
        <p className="text-sm text-boko-muted">Te respondemos lo antes posible.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="bg-[#f0ece8] rounded-2xl p-4 md:p-6 flex flex-col gap-4">
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
          <textarea required rows={3} value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Escribe aquí tu mensaje" className={`${inputClass} resize-none`} />
        </div>
        <div className={fieldClass}>
          <label className="text-xs font-medium text-boko-dark">Referencias</label>
          <div className="border-2 border-dashed border-boko-border rounded-xl p-4 flex flex-col items-center gap-2 text-center">
            <p className="text-xs font-semibold text-boko-dark">
              {archivo ? archivo.name : "Selecciona el archivo"}
            </p>
            <p className="text-xs text-boko-muted">Se permiten archivos .jpg, .png, .pdf con un tamaño máximo de 3MB</p>
            <input
              ref={fileRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f && f.size > 3 * 1024 * 1024) { setError("El archivo supera los 3MB."); return; }
                setArchivo(f ?? null);
                setError("");
              }}
            />
            <button type="button" onClick={() => fileRef.current?.click()} className="mt-1 px-5 py-2 rounded-lg bg-[#796a73] text-white text-xs font-medium hover:bg-[#5a4a54] transition-colors w-full md:w-fit">
              {archivo ? "Cambiar archivo" : "Seleccionar archivo"}
            </button>
          </div>
        </div>
      </div>
      <label className="flex items-start gap-3 cursor-pointer">
        <input type="checkbox" checked={privacidad} onChange={e => setPrivacidad(e.target.checked)} className="mt-0.5 w-5 h-5 rounded accent-[#796a73] shrink-0" />
        <span className="text-xs text-boko-muted">Acepto la política de privacidad y términos y condiciones de Boko.</span>
      </label>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button type="submit" disabled={sending} className="w-full md:w-fit px-8 py-3 rounded-xl bg-[#796a73] text-white text-sm font-medium hover:bg-[#5a4a54] transition-colors disabled:opacity-60">
        {sending ? "Enviando..." : "Enviar"}
      </button>
    </form>
  );
}
