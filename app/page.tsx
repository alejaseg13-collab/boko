import Image from "next/image";
import HeroCarousel from "@/components/sections/HeroCarousel";
import BestSellersCarousel from "@/components/sections/BestSellersCarousel";
import ArticulosSection from "@/components/sections/ArticulosSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";

export default function HomePage() {
  return (
    <>
      <HeroCarousel />

      {/* Featured bar — overlaps carousel on desktop */}
      {/* Featured bar: -mt-14 sube el bloque 56px dentro del carousel.
          El fondo cream empieza exactamente en top-14 (= 56px) para que
          coincida con el borde del carousel — las tarjetas flotan mitad/mitad. */}
      <div className="relative z-10 -mt-14">
        <div className="absolute top-14 inset-x-0 bottom-0 bg-boko-cream" />
        <div className="relative max-w-[1512px] mx-auto px-6 pb-8">
          <div className="flex flex-col md:flex-row gap-10 items-center justify-center">
            {[
              { icon: "/images/icons/icon-box.svg",     title: "Envío gratis",    desc: "Envío gratis a partir de $150.000" },
              { icon: "/images/icons/icon-wallet.svg",  title: "Pagos flexibles", desc: "Múltiples opciones de pago" },
              { icon: "/images/icons/icon-headset.svg", title: "Contacto 24/7",   desc: "Estamos conectados todos los días" },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="bg-boko-cream rounded-4xl h-29 flex-1 flex items-center px-7.5 shadow-[0px_4px_4px_rgba(0,0,0,0.08),0px_4px_16px_rgba(0,0,0,0.08)]"
              >
                <div className="flex items-center gap-6 w-full">
                  <img src={icon} alt="" className="w-[34px] h-[34px] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-serif font-bold text-2xl text-[#796a73] tracking-[0.24px] leading-[1.32]">{title}</p>
                    <p className="text-sm text-[#77757f] leading-[1.16]">{desc}</p>
                  </div>
                  <img src="/images/icons/icon-tick.svg" alt="" className="w-[23px] h-[23px] shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Best Sellers */}
      <section className="pt-8 pb-8 bg-boko-cream">
        <div className="max-w-[1512px] mx-auto px-6">
          <BestSellersCarousel />
        </div>
      </section>

      {/* Nuestra esencia - stats */}
      <section className="relative" style={{ backgroundColor: '#796a73' }}>
        {/* Wavy cream top edge */}
        <div className="absolute top-0 left-0 w-full overflow-hidden" style={{ lineHeight: 0 }}>
          <svg viewBox="0 0 1440 160" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '160px' }}>
            <path d="M0,32 C400,160 1000,0 1440,64 L1440,0 L0,0 Z" fill="#fdfdfd" />
          </svg>
        </div>
        <div className="pt-36 pb-16">
          <div className="max-w-[1512px] mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-white text-base leading-relaxed text-justify">
                  Más que figuras de crochet, creamos vínculos. Bajo el concepto de tejer el alma, cada una de nuestras piezas nace para transformar hilos en personajes con propósito y sentimiento. Si tienes en mente un héroe de serie, cine o videojuego que no está en nuestra tienda, gestionamos tu pedido personalizado para darle forma a esa idea que quieres conservar.
                </p>
              </div>
              <div className="flex gap-12 justify-center md:justify-end items-center">
                <div className="flex flex-col items-center gap-3 text-center">
                  {/* Yarn ball icon */}
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round">
                    <circle cx="24" cy="24" r="18" />
                    <path d="M10 18 C14 12 34 12 38 18" />
                    <path d="M7 26 C12 20 36 20 41 26" />
                    <path d="M10 34 C14 28 34 28 38 34" />
                    <path d="M24 6 C20 16 20 32 24 42" />
                    <path d="M24 6 C28 16 28 32 24 42" />
                  </svg>
                  <p className="font-serif text-5xl font-bold text-white">200+</p>
                  <p className="text-white/80 text-sm max-w-[140px]">Personajes diferentes creados bajo pedido.</p>
                </div>
                <div className="w-px bg-white/30 self-stretch" />
                <div className="flex flex-col items-center gap-3 text-center">
                  {/* Chat bubble with star icon */}
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 10 H40 Q42 10 42 12 V30 Q42 32 40 32 H26 L20 40 L20 32 H8 Q6 32 6 30 V12 Q6 10 8 10 Z" />
                    <polygon points="24,16 25.5,20.5 30,21 26.5,24.5 27.5,29 24,26.5 20.5,29 21.5,24.5 18,21 22.5,20.5" fill="white" stroke="none" />
                  </svg>
                  <p className="font-serif text-5xl font-bold text-white">4.9/5</p>
                  <p className="text-white/80 text-sm max-w-[140px]">Nivel de satisfacción en la fidelidad del diseño.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ArticulosSection />

      {/* Nuestra esencia - texto */}
      <section className="pt-2 pb-4 bg-boko-cream">
        <div className="max-w-[1512px] mx-auto px-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 items-center">
            {/* Imagen grande pegada al texto */}
            <div className="relative min-h-80 md:min-h-136">
              <Image
                src="/images/products/nuestra-esencia-2.png"
                alt="Nuestra esencia - piezas artesanales"
                fill
                className="object-contain object-left"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            {/* Contenido */}
            <div className="flex flex-col gap-5">
              {/* Ícono dos siluetas */}
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none" stroke="#796a73" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <ellipse cx="28" cy="28" rx="26" ry="26" />
                <circle cx="21" cy="20" r="6" />
                <path d="M10 42c0-6 5-10 11-10s8 2.5 9 4" />
                <circle cx="35" cy="20" r="6" />
                <path d="M46 42c0-6-5-10-11-10s-8 2.5-9 4" />
              </svg>

              <p className="text-boko-muted text-sm italic">El arte de tejer el alma</p>

              <h2 className="font-serif text-5xl text-boko-dark leading-tight">
                Nuestra <span className="font-bold italic">esencia</span>
              </h2>

              <p className="text-boko-muted text-sm leading-relaxed">
                Transformamos hilos en figuras con historia. Usando la técnica de tejido en espiral, creamos amigurumis firmes y detallados que, según la tradición, obtienen un alma para cuidar de su dueño. Ya sea una pieza de nuestro catálogo o tu personaje favorito de videojuegos, lo creamos.
              </p>

            </div>
          </div>
        </div>
      </section>

      <TestimonialsSection />

      {/* CTA Personalizados */}
      <section className="py-16 bg-boko-cream">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="bg-boko-cream rounded-3xl shadow-[0_12px_60px_rgba(0,0,0,0.18)] overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">

              {/* Izquierda */}
              <div className="flex flex-col gap-6 p-12 border-r border-boko-border justify-center">
                <Image
                  src="/images/logo.png"
                  alt="Bokō"
                  width={240}
                  height={110}
                  className="h-36 w-auto object-contain mix-blend-multiply self-start"
                />
                <div>
                  <h2 className="font-serif text-3xl text-[#796a73] leading-tight">¿Tienes algún</h2>
                  <h2 className="font-serif text-3xl font-bold text-[#796a73] leading-tight">proyecto especial?</h2>
                </div>
                <p className="text-boko-muted text-sm leading-relaxed text-justify">
                  ¿Buscas un personaje muy específico que no está en el catálogo o necesitas un pedido al por mayor para un evento? Cuéntanos los detalles. Estamos listos para tejer el alma de piezas únicas.
                </p>
              </div>

              {/* Derecha */}
              <div className="flex flex-col gap-5 p-12">
                <h3 className="font-serif text-3xl text-[#796a73] leading-tight">
                  Démosle <span className="font-bold italic">vida a tu idea.</span>
                </h3>
                <div className="bg-[#f0ece8] rounded-2xl p-6 flex flex-col gap-4">
                  <div className="flex flex-col gap-1 bg-boko-cream rounded-xl px-4 py-3 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                    <label className="text-xs font-medium text-boko-dark">Nombre completo *</label>
                    <input type="text" placeholder="Ingresa tu nombre completo" className="text-sm text-boko-muted placeholder:text-boko-muted bg-transparent focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1 bg-boko-cream rounded-xl px-4 py-3 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                    <label className="text-xs font-medium text-boko-dark">Correo electrónico *</label>
                    <input type="email" placeholder="Ejemplo: nombre@dominio.com" className="text-sm text-boko-muted placeholder:text-boko-muted bg-transparent focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1 bg-boko-cream rounded-xl px-4 py-3 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                    <label className="text-xs font-medium text-boko-dark">Descripción *</label>
                    <textarea rows={4} placeholder="Escribe aquí tu mensaje" className="text-sm text-boko-muted placeholder:text-boko-muted bg-transparent focus:outline-none resize-none" />
                  </div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" className="mt-0.5 w-5 h-5 rounded accent-[#796a73] shrink-0" />
                    <span className="text-xs text-boko-muted">
                      Acepto la política de privacidad y términos y condiciones de Boko.
                    </span>
                  </label>
                  <button type="submit" className="w-fit px-8 py-3 rounded-xl bg-[#796a73] text-white text-sm font-medium hover:bg-[#5a4a54] transition-colors">
                    Enviar
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </>
  );
}
