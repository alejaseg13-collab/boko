import Image from "next/image";
import HeroCarousel from "@/components/sections/HeroCarousel";
import HomeForm from "@/components/forms/HomeForm";
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
      <div className="relative z-10 -mt-8 md:-mt-14">
        <div className="absolute top-8 md:top-14 inset-x-0 bottom-0 bg-boko-cream" />
        <div className="relative max-w-[1512px] mx-auto px-4 md:px-6 pb-8">
          <div className="flex flex-col md:flex-row gap-3 md:gap-10 items-center justify-center">
            {[
              { icon: "/images/icons/icon-box.svg",     title: "Envío gratis",    desc: "Envío gratis a partir de $150.000" },
              { icon: "/images/icons/icon-wallet.svg",  title: "Pagos flexibles", desc: "Múltiples opciones de pago" },
              { icon: "/images/icons/icon-headset.svg", title: "Contacto 24/7",   desc: "Estamos conectados todos los días" },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="bg-white md:bg-boko-cream rounded-4xl w-full md:flex-1 flex items-center px-7.5 h-24 md:h-29 shadow-[0px_4px_4px_rgba(0,0,0,0.08),0px_4px_16px_rgba(0,0,0,0.08)]"
              >
                <div className="flex items-center gap-6 w-full">
                  <img src={icon} alt="" className="w-[34px] h-[34px] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-serif font-bold text-2xl text-[#796a73] tracking-[0.24px] leading-[1.32]">{title}</p>
                    <p className="text-sm text-[#77757f] leading-[1.16]">{desc}</p>
                  </div>
                  <img src="/images/icons/icon-tick.svg" alt="" className="w-[23px] h-[23px] shrink-0 hidden md:block" />
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div>
                <p className="text-white text-base leading-relaxed text-justify">
                  Más que figuras de crochet, creamos vínculos. Bajo el concepto de tejer el alma, cada una de nuestras piezas nace para transformar hilos en personajes con propósito y sentimiento. Si tienes en mente un héroe de serie, cine o videojuego que no está en nuestra tienda, gestionamos tu pedido personalizado para darle forma a esa idea que quieres conservar.
                </p>
              </div>
              <div className="flex flex-col md:flex-row gap-8 md:gap-12 justify-center md:justify-end items-center">
                <div className="flex flex-col items-center gap-3 text-center">
                  <Image src="/images/icons/icon-personajes.svg" alt="" width={48} height={48} />
                  <p className="font-serif text-5xl font-bold text-white">200+</p>
                  <p className="text-white/80 text-sm">Personajes diferentes<br />creados bajo pedido.</p>
                </div>
                <div className="h-px w-24 md:w-px md:h-auto bg-white/30 md:self-stretch" />
                <div className="flex flex-col items-center gap-3 text-center">
                  <Image src="/images/icons/icon-satisfaccion.svg" alt="" width={48} height={48} />
                  <p className="font-serif text-5xl font-bold text-white">4.9/5</p>
                  <p className="text-white/80 text-sm">Nivel de satisfacción<br />en la fidelidad del diseño.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ArticulosSection />

      {/* Nuestra esencia - texto */}
      <section className="pt-2 pb-4 bg-boko-cream">
        <div className="max-w-[1512px] mx-auto px-6 md:px-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 items-center">
            {/* Imagen grande pegada al texto */}
            <div className="relative h-80 md:h-auto md:min-h-136">
              <Image
                src="/images/products/nuestra-esencia-2.png"
                alt="Nuestra esencia - piezas artesanales"
                fill
                className="object-contain object-center md:object-left"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            {/* Contenido */}
            <div className="flex flex-col gap-5 pb-8 md:pb-0 items-center text-center md:items-start md:text-left">
              <Image src="/images/icons/nuestra_esencia.svg" alt="" width={56} height={56} />

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
              <div className="flex flex-col gap-6 p-6 md:p-12 border-b md:border-b-0 md:border-r border-boko-border justify-center">
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
              <div className="flex flex-col gap-5 p-6 md:p-12">
                <h3 className="font-serif text-3xl text-[#796a73] leading-tight">
                  Démosle <span className="font-bold italic">vida a tu idea.</span>
                </h3>
                <HomeForm />
              </div>

            </div>
          </div>
        </div>
      </section>
    </>
  );
}
