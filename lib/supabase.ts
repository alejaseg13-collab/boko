import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// When boko_no_persist is set in sessionStorage, use sessionStorage for auth
// so the session is lost when the browser/tab closes (Recordarme = off).
const customStorage = {
  getItem: (k: string) => {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem("boko_no_persist") === "1"
      ? sessionStorage.getItem(k)
      : localStorage.getItem(k);
  },
  setItem: (k: string, v: string) => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("boko_no_persist") === "1") {
      sessionStorage.setItem(k, v);
    } else {
      localStorage.setItem(k, v);
    }
  },
  removeItem: (k: string) => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(k);
    sessionStorage.removeItem(k);
  },
};

export const supabase = createClient<Database>(url, key, {
  auth: { storage: customStorage },
});
