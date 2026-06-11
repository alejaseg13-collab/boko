-- ============================================================
-- BOKO — Schema completo
-- Pega esto en Supabase → SQL Editor → New query → Run
-- ============================================================

-- 1. Perfiles de usuario (extiende auth.users de Supabase)
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID        REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nombre      TEXT,
  apellidos   TEXT,
  email       TEXT,
  telefono    TEXT,
  avatar_url  TEXT,
  role        TEXT        NOT NULL DEFAULT 'customer' CHECK (role IN ('customer','admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger: crea perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 2. Direcciones
CREATE TABLE IF NOT EXISTS addresses (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID        REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  nombre        TEXT,
  apellidos     TEXT,
  direccion     TEXT,
  departamento  TEXT,
  ciudad        TEXT,
  codigo_postal TEXT,
  correo        TEXT,
  telefono      TEXT,
  is_default    BOOLEAN     DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Categorías
CREATE TABLE IF NOT EXISTS categories (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre     TEXT        NOT NULL,
  slug       TEXT        UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Productos
CREATE TABLE IF NOT EXISTS products (
  id                  UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre              TEXT        NOT NULL,
  slug                TEXT        UNIQUE NOT NULL,
  descripcion         TEXT,
  precio              INTEGER     NOT NULL,
  precio_anterior     INTEGER,
  categoria_id        UUID        REFERENCES categories(id),
  stock               INTEGER     NOT NULL DEFAULT 0,
  tiempo_entrega_dias INTEGER     NOT NULL DEFAULT 5,
  imagenes            TEXT[]      DEFAULT '{}',
  is_personalizable   BOOLEAN     DEFAULT FALSE,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Materiales (hilos, rellenos, accesorios)
CREATE TABLE IF NOT EXISTS materials (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre      TEXT        NOT NULL,
  tipo        TEXT        NOT NULL,
  color       TEXT,
  stock       NUMERIC     NOT NULL DEFAULT 0,
  unidad      TEXT        NOT NULL DEFAULT 'metros',
  precio_unit NUMERIC     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Recetas de productos (qué materiales usa cada producto)
CREATE TABLE IF NOT EXISTS product_recipes (
  id          UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id  UUID    REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  material_id UUID    REFERENCES materials(id) ON DELETE CASCADE NOT NULL,
  cantidad    NUMERIC NOT NULL,
  UNIQUE (product_id, material_id)
);

-- 7. Pedidos
CREATE TABLE IF NOT EXISTS orders (
  id                  UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             UUID        REFERENCES profiles(id),
  status              TEXT        NOT NULL DEFAULT 'Procesando'
                                  CHECK (status IN ('Procesando','En camino','Entregado','Cancelado')),
  subtotal            INTEGER     NOT NULL,
  descuento           INTEGER     NOT NULL DEFAULT 0,
  envio               INTEGER     NOT NULL DEFAULT 0,
  total               INTEGER     NOT NULL,
  metodo_pago         TEXT,
  tiempo_entrega_dias INTEGER     NOT NULL DEFAULT 5,
  nota_interna        TEXT,
  billing_address     JSONB,
  shipping_address    JSONB,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Ítems de pedido
CREATE TABLE IF NOT EXISTS order_items (
  id          UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id    UUID    REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id  UUID    REFERENCES products(id),
  nombre      TEXT    NOT NULL,
  precio      INTEGER NOT NULL,
  cantidad    INTEGER NOT NULL,
  subtotal    INTEGER NOT NULL,
  imagen_url  TEXT
);

-- 9. Lista de deseados
CREATE TABLE IF NOT EXISTS wishlist (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID        REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

-- 10. Carrito
CREATE TABLE IF NOT EXISTS cart_items (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID        REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  cantidad   INTEGER     NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses     ENABLE ROW LEVEL SECURITY;
ALTER TABLE products      ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials     ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders        ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist      ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items    ENABLE ROW LEVEL SECURITY;

-- Perfiles: cada usuario ve/edita solo el suyo; admins ven todo
CREATE POLICY "profiles_self"  ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "profiles_admin" ON profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Direcciones: solo el dueño
CREATE POLICY "addresses_owner" ON addresses FOR ALL USING (auth.uid() = user_id);

-- Productos y categorías: lectura pública, escritura solo admin
CREATE POLICY "products_read"  ON products  FOR SELECT USING (true);
CREATE POLICY "products_admin" ON products  FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "categories_read"  ON categories FOR SELECT USING (true);
CREATE POLICY "categories_admin" ON categories FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Materiales y recetas: solo admin
CREATE POLICY "materials_admin" ON materials FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "recipes_admin" ON product_recipes FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Pedidos: cliente ve los suyos; admin ve todos
CREATE POLICY "orders_owner" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "orders_insert" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orders_admin" ON orders FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "order_items_owner" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid())
);
CREATE POLICY "order_items_admin" ON order_items FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Wishlist y carrito: solo el dueño
CREATE POLICY "wishlist_owner"    ON wishlist    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "cart_items_owner"  ON cart_items  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- DATOS DE EJEMPLO
-- ============================================================

INSERT INTO categories (nombre, slug) VALUES
  ('Amigurumi', 'amigurumi'),
  ('Peluche',   'peluche'),
  ('Hogar',     'hogar')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO materials (nombre, tipo, color, stock, unidad, precio_unit) VALUES
  ('Hilo algodón peinado', 'Hilo',      'Verde',   500,  'metros',   80),
  ('Hilo algodón peinado', 'Hilo',      'Beige',   300,  'metros',   80),
  ('Hilo algodón peinado', 'Hilo',      'Naranja', 200,  'metros',   80),
  ('Fibra siliconada',     'Relleno',   'Blanco',  2000, 'gramos',   15),
  ('Ojos de seguridad 8mm','Accesorio', 'Negro',   150,  'unidades', 500),
  ('Ojos de seguridad 6mm','Accesorio', 'Negro',   100,  'unidades', 400),
  ('Hilo metálico dorado', 'Hilo',      'Dorado',  80,   'metros',   200),
  ('Alambre estructura',   'Accesorio', 'Gris',    50,   'metros',   600);
