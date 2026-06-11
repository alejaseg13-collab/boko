"use client";

import Link from "next/link";
import Image from "next/image";
import Badge from "./Badge";

export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  badge?: "new" | "bestseller" | "sale" | "custom";
  category?: string;
  rating?: number;
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/tienda/${product.slug}`} className="group block">
      <div className="relative aspect-4/5 bg-white rounded-2xl overflow-hidden mb-3">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 50vw, 20vw"
        />
        {product.badge && (
          <div className="absolute top-3 left-3">
            <Badge
              variant={product.badge}
              label={
                product.badge === "new" ? "Nuevo"
                : product.badge === "bestseller" ? "Más vendidos"
                : product.badge === "sale" ? "Oferta"
                : "Personalizado"
              }
            />
          </div>
        )}
        <button
          aria-label="Agregar a wishlist"
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-1.5 shadow-sm"
          onClick={(e) => e.preventDefault()}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2B1A0E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-boko-dark group-hover:text-boko-muted transition-colors line-clamp-2">
          {product.name}
        </h3>
        {product.category && (
          <span className="text-xs text-boko-muted">{product.category}</span>
        )}
        {product.rating != null && (
          <div className="flex items-center gap-1 mt-0.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#F5A623" stroke="none">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span className="text-xs font-semibold text-boko-dark">{product.rating}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
