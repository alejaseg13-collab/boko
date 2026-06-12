import { supabase } from "./supabase";

export async function signUp(email: string, password: string, nombre: string, apellidos: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;

  if (data.user) {
    await supabase.from("profiles").upsert({
      id: data.user.id,
      email,
      nombre,
      apellidos,
    });
  }
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (typeof window !== "undefined") sessionStorage.removeItem("boko_no_persist");
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getProfile() {
  const session = await getSession();
  if (!session) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  return data;
}

export async function updateProfile(updates: Partial<{ nombre: string; apellidos: string; telefono: string; avatar_url: string }>) {
  const session = await getSession();
  if (!session) throw new Error("No hay sesión activa");
  const { error } = await supabase.from("profiles").update(updates).eq("id", session.user.id);
  if (error) throw new Error(error.message);
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}
