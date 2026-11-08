import { createClient } from "@supabase/supabase-js";
import { validateProjectEnvironment } from "@/lib/project-environment";

const { url, key } = validateProjectEnvironment(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);
const isOperatorPage = /^\/painel-promocoes(?:\.html)?\/?$/.test(window.location.pathname);
export const promotionUsesHostedAuth = new URL(url).protocol === "https:";

export const promotionClient = createClient(url, key, {
  auth: {
    storageKey: "aqui-guaira-promocoes-auth",
    persistSession: isOperatorPage,
    autoRefreshToken: isOperatorPage,
    detectSessionInUrl: isOperatorPage,
  },
});
