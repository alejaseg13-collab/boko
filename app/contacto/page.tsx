import Image from "next/image";

const cards = [
  {
    dark: false,
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 10 H40 Q42 10 42 12 V28 Q42 30 40 30 H26 L20 38 L20 30 H8 Q6 30 6 28 V12 Q6 10 8 10 Z" />
        <circle cx="24" cy="20" r="3" fill="currentColor" stroke="none" />
        <line x1="24" y1="14" x2="24" y2="14.5" />
      </svg>
    ),
    text: "Tienes cualquier duda o consulta sobre mis servicios.",
  },
  {
    dark: true,
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 8 H34 L40 16 V38 Q40 40 38 40 H10 Q8 40 8 38 V16 Z" />
        <line x1="24" y1="22" x2="24" y2="32" />
        <line x1="19" y1="27" x2="29" y2="27" />
        <circle cx="32" cy="14" r="6" fill="#796a73" stroke="currentColor" />
        <line x1="32" y1="11" x2="32" y2="17" />
        <line x1="29" y1="14" x2="35" y2="14" />
      </svg>
    ),
    text: "Recomiendas algún amigurumi para agregar al catálogo.",
  },
  {
    dark: false,
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="24" cy="24" r="18" />
        <polygon points="24,13 26.5,20 34,20 28,24.5 30.5,31.5 24,27 17.5,31.5 20,24.5 14,20 21.5,20" />
      </svg>
    ),
    text: "Quieres dar un feedback sobre el servicio.",
  },
];

export default function ContactoPage() {
  return (
    <>
      {/* Hero */}
      <div className="relative w-full h-70 overflow-hidden rounded-bl-[48px]">
        <Image
          src="/images/products/contacto-banner.png"
          alt="Contacto Bokō"
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="font-serif text-5xl italic text-white/80 drop-shadow-lg">Contacto</h1>
        </div>
      </div>

      {/* No dudes en contactarme */}
      <section className="pt-16 pb-10 text-center">
        <h2 className="font-serif text-5xl text-[#796a73] leading-tight">
          No dudes en<br /><span className="font-bold">contactarme si:</span>
        </h2>
      </section>

      {/* Tres tarjetas */}
      <section className="pb-20">
        <div className="max-w-325 mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map(({ dark, icon, text }, i) => (
              <div
                key={i}
                className={`rounded-3xl p-10 flex flex-col items-center gap-6 text-center shadow-[0_4px_24px_rgba(0,0,0,0.08)] ${
                  dark ? "bg-[#796a73] text-white" : "bg-boko-cream text-[#796a73]"
                }`}
              >
                <div className={dark ? "text-white" : "text-[#796a73]"}>{icon}</div>
                <p className={`text-base font-semibold leading-snug ${dark ? "text-white" : "text-[#796a73]"}`}>
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Formulario de contacto */}
      <section className="bg-[#f0ede9] rounded-tl-[72px] px-20 pt-24 pb-24">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-[5fr_7fr] gap-20 items-center">

            {/* Izquierda */}
            <div className="flex flex-col gap-6">
              <h2 className="font-serif text-3xl text-[#796a73]">
                Ponte en <span className="font-bold">contacto</span>
              </h2>
              <p className="text-sm text-[#796a73]/70 leading-relaxed text-justify">
                Puedes formalizar tu requerimiento a través del formulario de esta página, vía mensaje directo en Instagram o mediante nuestra línea de atención en WhatsApp. Centralizamos la comunicación en estos canales para asegurar el seguimiento técnico de cada pieza, desde la validación del diseño hasta la confirmación de despacho.
              </p>

              <div className="grid grid-cols-2 gap-x-6 gap-y-5 mt-2">
                {[
                  {
                    icon: <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>,
                    label: "WhatsApp", value: "+57 322 2284303",
                  },
                  {
                    icon: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>,
                    label: "Dirección", value: "Chía - Cundinamarca",
                  },
                  {
                    icon: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
                    label: "Correo", value: "nubygar@bokocrochet.com",
                  },
                  {
                    icon: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
                    label: "Horarios", value: "Lun - Sab / 8:00-8:00",
                  },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#796a73" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      {icon}
                    </svg>
                    <div>
                      <p className="font-semibold text-sm text-[#796a73]">{label}</p>
                      <p className="text-xs text-[#796a73]/70">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#796a73]/20 pt-5 mt-2">
                <p className="font-semibold text-base text-[#796a73] mb-3">Síguenos</p>
                <div className="flex items-center gap-4">
                  {[
                    <path key="fb" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>,
                    <path key="tt" d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>,
                    <path key="ig" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>,
                  ].map((path, i) => (
                    <a key={i} href="#" className="text-[#796a73] hover:opacity-70 transition-opacity">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">{path}</svg>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Derecha — formulario */}
            <div className="flex flex-col gap-5">
              <h2 className="font-serif text-5xl text-[#796a73] leading-tight">
                Te damos respuesta<br /><span className="font-bold">lo antes posible</span>
              </h2>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Nombre completo *", type: "text", placeholder: "Ingresa tu nombre completo" },
                  { label: "Correo electrónico *", type: "email", placeholder: "Ejemplo: nombre@dominio.com" },
                  { label: "Motivo *", type: "text", placeholder: "Título" },
                ].map(({ label, type, placeholder }) => (
                  <div key={label} className="flex flex-col gap-1 bg-white/80 rounded-xl px-4 py-3 border border-[#796a73]/10">
                    <label className="text-xs font-medium text-[#796a73]">{label}</label>
                    <input type={type} placeholder={placeholder} className="text-sm text-[#796a73]/60 placeholder:text-[#796a73]/40 bg-transparent focus:outline-none" />
                  </div>
                ))}
                <div className="flex flex-col gap-1 bg-white/80 rounded-xl px-4 py-3 border border-[#796a73]/10">
                  <label className="text-xs font-medium text-[#796a73]">Descripción *</label>
                  <textarea rows={4} placeholder="Escribe aquí tu mensaje" className="text-sm text-[#796a73]/60 placeholder:text-[#796a73]/40 bg-transparent focus:outline-none resize-none" />
                </div>
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" className="mt-0.5 w-5 h-5 accent-[#796a73] shrink-0" />
                <span className="text-xs text-[#796a73]/70">Acepto la política de privacidad de Boko.</span>
              </label>
              <button type="submit" className="w-fit px-12 py-3 rounded-full bg-[#796a73] text-white text-sm font-medium hover:bg-[#5a4a54] transition-colors">
                Enviar
              </button>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}

