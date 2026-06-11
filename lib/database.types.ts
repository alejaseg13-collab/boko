export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          nombre: string | null;
          apellidos: string | null;
          email: string | null;
          telefono: string | null;
          avatar_url: string | null;
          role: "customer" | "admin";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          nombre: string | null;
          apellidos: string | null;
          direccion: string | null;
          departamento: string | null;
          ciudad: string | null;
          codigo_postal: string | null;
          correo: string | null;
          telefono: string | null;
          is_default: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["addresses"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["addresses"]["Insert"]>;
      };
      categories: {
        Row: { id: string; nombre: string; slug: string; created_at: string };
        Insert: Omit<Database["public"]["Tables"]["categories"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
      };
      products: {
        Row: {
          id: string;
          nombre: string;
          slug: string;
          descripcion: string | null;
          precio: number;
          precio_anterior: number | null;
          categoria_id: string | null;
          stock: number;
          tiempo_entrega_dias: number;
          imagenes: string[];
          is_personalizable: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["products"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
      };
      materials: {
        Row: {
          id: string;
          nombre: string;
          tipo: string;
          color: string | null;
          stock: number;
          unidad: string;
          precio_unit: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["materials"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["materials"]["Insert"]>;
      };
      product_recipes: {
        Row: { id: string; product_id: string; material_id: string; cantidad: number };
        Insert: Omit<Database["public"]["Tables"]["product_recipes"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["product_recipes"]["Insert"]>;
      };
      orders: {
        Row: {
          id: string;
          user_id: string | null;
          status: string;
          subtotal: number;
          descuento: number;
          envio: number;
          total: number;
          metodo_pago: string | null;
          tiempo_entrega_dias: number;
          nota_interna: string | null;
          billing_address: Json | null;
          shipping_address: Json | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["orders"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          nombre: string;
          precio: number;
          cantidad: number;
          subtotal: number;
          imagen_url: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["order_items"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["order_items"]["Insert"]>;
      };
      wishlist: {
        Row: { id: string; user_id: string; product_id: string; created_at: string };
        Insert: Omit<Database["public"]["Tables"]["wishlist"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["wishlist"]["Insert"]>;
      };
      cart_items: {
        Row: { id: string; user_id: string; product_id: string; cantidad: number; created_at: string };
        Insert: Omit<Database["public"]["Tables"]["cart_items"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["cart_items"]["Insert"]>;
      };
    };
  };
}
