export const PROJECT_SUPABASE_URL = 'https://kdyjebtzuniisxecaslm.supabase.co';

/** Reject cross-project configuration before creating any network client. */
export function validateProjectEnvironment(url?: string, key?: string) {
  if (url?.replace(/\/$/, '') !== PROJECT_SUPABASE_URL || !key?.trim()) {
    throw new Error('Configuração do Aqui Guaíra inválida. Confira AMBIENTE-DO-PROJETO.md.');
  }
  if (!key.startsWith('sb_publishable_')) {
    try {
      const payload = JSON.parse(atob(key.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (payload.ref !== 'kdyjebtzuniisxecaslm' || payload.role !== 'anon') throw new Error();
    } catch {
      throw new Error('O Aqui Guaíra exige uma chave pública do Supabase autorizado.');
    }
  }
  return { url: PROJECT_SUPABASE_URL, key };
}
