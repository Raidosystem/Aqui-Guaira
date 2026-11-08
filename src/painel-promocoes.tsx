import { useEffect, useState, type FormEvent } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { AuthCaptcha } from "@/components/AuthCaptcha";
import { consumeCaptcha, isCaptchaFailure, type CaptchaTicket } from "@/lib/auth-captcha";
import PromotionPanel from "@/features/promotions/PromotionPanel";
import { promotionClient, promotionUsesHostedAuth } from "@/features/promotions/promotion-client";
import "@/index.css";

const requireCaptcha = promotionUsesHostedAuth;
const client = new QueryClient();

function OperatorLogin() {
  const [email, setEmail] = useState("");
  const [ticket, setTicket] = useState<CaptchaTicket | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  async function requestLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    setSending(true);
    try {
      const captchaToken = requireCaptcha ? consumeCaptcha(ticket) : undefined;
      const { error } = await promotionClient.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          shouldCreateUser: false,
          captchaToken,
          emailRedirectTo: window.location.origin + "/painel-promocoes",
        },
      });
      setMessage(isCaptchaFailure(error) ? "Conclua uma nova verificação de segurança." :
        "Se o endereço estiver habilitado, o link de acesso chegará na caixa de entrada.");
    } catch {
      setMessage("Não foi possível solicitar o link. Verifique a conexão e tente novamente.");
    } finally {
      setSending(false);
      setTicket(null);
      setAttempt(value => value + 1);
    }
  }

  return (
    <form className="max-w-sm space-y-3" onSubmit={requestLink}>
      <Label htmlFor="promotion-operator-email">E-mail autorizado</Label>
      <Input id="promotion-operator-email" type="email" required autoComplete="email"
        value={email} onChange={event => setEmail(event.target.value)} />
      {requireCaptcha && <AuthCaptcha key={attempt} onToken={setTicket} />}
      <Button type="submit" disabled={sending || (requireCaptcha && !ticket)}>
        {sending ? "Enviando…" : "Enviar link de acesso"}
      </Button>
      {message && <p role="status" className="text-sm">{message}</p>}
    </form>
  );
}

function OperatorPanel() {
  const [generation, setGeneration] = useState(0);
  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState(false);
  const queryClient = useQueryClient();
  useEffect(() => {
    const { data: { subscription } } = promotionClient.auth.onAuthStateChange(() => {
      setGeneration(current => current + 1);
    });
    return () => subscription.unsubscribe();
  }, []);
  const operator = useQuery({
    queryKey: ["promotion-operator", generation],
    gcTime: 0,
    retry: false,
    queryFn: async () => {
      const { data: { user } } = await promotionClient.auth.getUser();
      if (!user?.email_confirmed_at) return null;
      const { data, error } = await promotionClient.rpc("minha_empresa_de_promocoes");
      if (error) throw error;
      return { userId: user.id, companyId: typeof data === "string" ? data : null };
    },
  });
  async function signOut() {
    setSigningOut(true);
    setLogoutError(false);
    const { error } = await promotionClient.auth.signOut({ scope: "local" });
    queryClient.clear();
    setGeneration(value => value + 1);
    setSigningOut(false);
    setLogoutError(!!error);
  }
  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4 sm:p-8">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <div>
          <p className="text-sm font-medium text-primary">Aqui Guaíra</p>
          <h1 className="text-2xl font-bold">Painel de promoções</h1>
        </div>
        {operator.data && <Button type="button" variant="outline" disabled={signingOut} onClick={() => void signOut()}>Sair</Button>}
      </header>
      {logoutError && <p role="alert">Não foi possível confirmar o encerramento da sessão.</p>}
      {signingOut || operator.isPending ? <p role="status">Conferindo a sessão…</p> : operator.isError ? (
        <p role="alert">Não foi possível conferir a permissão de promoções.</p>
      ) : !operator.data ? <OperatorLogin /> : !operator.data.companyId ? (
        <p>Esta conta não tem um mercado vinculado às promoções.</p>
      ) : (
        <PromotionPanel key={operator.data.userId} userId={operator.data.userId} companyId={operator.data.companyId} />
      )}
      <Toaster />
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={client}>
    <OperatorPanel />
  </QueryClientProvider>,
);
