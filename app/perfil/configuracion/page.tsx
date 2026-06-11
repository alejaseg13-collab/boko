"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { updateProfile, updatePassword } from "@/lib/auth";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-gray-500">{label}</label>
      {children}
    </div>
  );
}

const inputClass = "w-full px-4 py-2.5 rounded-xl bg-gray-100 text-sm text-boko-dark placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#796a73]/40";
const selectClass = `${inputClass} appearance-none`;

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-boko-border overflow-hidden">
      <div className="bg-[#796a73] px-6 py-4">
        <h2 className="text-white font-semibold text-sm">{title}</h2>
      </div>
      <div className="bg-white p-6">{children}</div>
    </div>
  );
}

function SaveBtn({ loading, saved }: { loading: boolean; saved: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={`px-6 py-2.5 rounded-xl text-white text-sm font-medium transition-all disabled:opacity-60 ${saved ? "bg-green-500" : "bg-boko-dark hover:opacity-80"}`}
    >
      {saved ? "¡Guardado!" : loading ? "Guardando..." : "Guardar cambios"}
    </button>
  );
}

export default function ConfiguracionPage() {
  const router = useRouter();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Profile state
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Password state
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passLoading, setPassLoading] = useState(false);
  const [passSaved, setPassSaved] = useState(false);
  const [passError, setPassError] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/iniciar-sesion"); return; }

      const { data } = await supabase
        .from("profiles")
        .select("nombre, apellidos, email, telefono, avatar_url")
        .eq("id", session.user.id)
        .single();

      if (data) {
        setNombre(data.nombre ?? "");
        setApellidos(data.apellidos ?? "");
        setEmail(data.email ?? session.user.email ?? "");
        setTelefono(data.telefono ?? "");
        setAvatarUrl(data.avatar_url ?? "");
      }
    }
    load();
  }, [router]);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setAvatarUploading(false); return; }
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${session.user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (!uploadError) {
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      await updateProfile({ avatar_url: data.publicUrl });
      setAvatarUrl(data.publicUrl);
    }
    setAvatarUploading(false);
    e.target.value = "";
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileError("");
    setProfileLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No hay sesión activa");

      // Si cambió el correo, actualizar en Auth y en profiles
      if (email && email !== session.user.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email });
        if (emailError) throw new Error(emailError.message);
        await supabase.from("profiles").update({ email }).eq("id", session.user.id);
      }

      await updateProfile({ nombre, apellidos, telefono });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setProfileLoading(false);
    }
  }

  async function handleSavePassword(e: React.FormEvent) {
    e.preventDefault();
    setPassError("");
    if (newPass !== confirmPass) { setPassError("Las contraseñas no coinciden"); return; }
    if (newPass.length < 6) { setPassError("La contraseña debe tener al menos 6 caracteres"); return; }
    setPassLoading(true);
    try {
      await updatePassword(newPass);
      setPassSaved(true);
      setCurrentPass(""); setNewPass(""); setConfirmPass("");
      setTimeout(() => setPassSaved(false), 2000);
    } catch (err: unknown) {
      setPassError(err instanceof Error ? err.message : "Error al cambiar contraseña");
    } finally {
      setPassLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Detalles de cuenta */}
      <SectionCard title="Detalles de cuenta">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8">
          <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
            {profileError && <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl">{profileError}</p>}
            <Field label="Nombres">
              <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Apellidos">
              <input type="text" value={apellidos} onChange={e => setApellidos(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Correo">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Teléfono">
              <input type="tel" value={telefono} onChange={e => setTelefono(e.target.value)} className={inputClass} />
            </Field>
            <div className="mt-2">
              <SaveBtn loading={profileLoading} saved={profileSaved} />
            </div>
          </form>

          {/* Avatar */}
          <div className="flex flex-col items-center gap-4 pt-2">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-28 h-28 rounded-full object-cover" />
            ) : (
              <div className="w-28 h-28 rounded-full bg-[#796a73]/20 flex items-center justify-center text-[#796a73] font-bold text-3xl">
                {nombre?.[0]?.toUpperCase() ?? "?"}
              </div>
            )}
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarUploading}
              className="px-5 py-2.5 rounded-xl bg-boko-dark text-white text-sm font-medium hover:opacity-80 transition-opacity whitespace-nowrap disabled:opacity-60"
            >
              {avatarUploading ? "Subiendo..." : "Escoger imagen"}
            </button>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
        </div>
      </SectionCard>

      {/* Cambiar contraseña */}
      <SectionCard title="Cambiar contraseña">
        <form onSubmit={handleSavePassword} className="flex flex-col gap-4">
          {passError && <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl">{passError}</p>}
          <Field label="Contraseña actual">
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                placeholder="••••••••••"
                value={currentPass}
                onChange={e => setCurrentPass(e.target.value)}
                className={`${inputClass} pr-11`}
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-boko-dark transition-colors">
                <EyeIcon open={showCurrent} />
              </button>
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nueva contraseña">
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  placeholder="••••••••••"
                  value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                  className={`${inputClass} pr-11`}
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-boko-dark transition-colors">
                  <EyeIcon open={showNew} />
                </button>
              </div>
            </Field>
            <Field label="Confirmar contraseña">
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••••"
                  value={confirmPass}
                  onChange={e => setConfirmPass(e.target.value)}
                  className={`${inputClass} pr-11`}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-boko-dark transition-colors">
                  <EyeIcon open={showConfirm} />
                </button>
              </div>
            </Field>
          </div>
          <div className="mt-2">
            <SaveBtn loading={passLoading} saved={passSaved} />
          </div>
        </form>
      </SectionCard>

    </div>
  );
}
