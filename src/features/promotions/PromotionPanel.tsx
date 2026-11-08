import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, Camera, PencilLine, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { canManagePromotions, loadMarketPromotions, loadPromotionPhoto, saveMarketPromotion } from "./offer-api";
import type { MarketPromotion, PromotionExpiryAction, PromotionInput, PromotionStatus } from "./offer-api";
import { cityToday, emptyOffer, formatOfferDate, MAX_OFFER_ITEMS, offerFromStorage, serializeOffer } from "./offer-fields";
import type { ImportedOffer, OfferFields } from "./offer-fields";
import { decodeOfferPhoto, OFFER_PHOTO_TYPES } from "./offer-photo";
import { useCityToday } from "./use-city-today";
import PromotionPhotoViewer from "./PromotionPhotoViewer";

type EditorRow = ImportedOffer & { key: string };

function editorRow(offer: OfferFields & Partial<Pick<ImportedOffer, "reviewNotes">> = emptyOffer()): EditorRow {
  return { ...offer, reviewNotes: offer.reviewNotes ?? [], key: crypto.randomUUID() };
}

function hasEnded(promotion: MarketPromotion, today: string) {
  return promotion.status === "publicada" && !!promotion.validade && promotion.validade < today;
}

function editorFor(saved?: MarketPromotion) {
  return {
    id: saved?.id ?? crypto.randomUUID(),
    revision: saved?.revisao ?? null,
    status: saved && hasEnded(saved, cityToday()) ? "arquivada" : saved?.status ?? "rascunho",
    title: saved?.titulo ?? "",
    expires: saved?.validade ?? "",
    expiryAction: saved?.acao_ao_vencer ?? null,
    photoHash: saved?.encarte?.hash ?? null,
    rows: saved?.itens.map((item, index) => editorRow({
      ...offerFromStorage(item),
      reviewNotes: saved.revisao_ocr[index],
    })) ?? [editorRow()],
  };
}

const labels: Record<PromotionStatus, string> = {
  rascunho: "Rascunho", publicada: "Publicada", arquivada: "Arquivada",
};

const offerFields = [
  { key: "produto", label: "Produto", placeholder: "Ex.: Arroz tipo 1, 5 kg", maxLength: 120 },
  { key: "preco", label: "Preço (R$)", placeholder: "24,90", maxLength: 12 },
  { key: "unidade", label: "Preço por", placeholder: "Ex.: unidade ou kg", maxLength: 35 },
  { key: "condicoes", label: "Condições (opcional)", placeholder: "Ex.: limite de 2 por cliente", maxLength: 160 },
] as const;

export default function PromotionPanel({ companyId, userId }: { companyId: string; userId: string }) {
  const queryClient = useQueryClient();
  const today = useCityToday();
  const queryKey = ["market-promotions", userId, companyId];
  const access = useQuery({
    queryKey: ["market-promotion-access", userId, companyId],
    queryFn: () => canManagePromotions(companyId),
    retry: false,
    gcTime: 0,
  });
  const saved = useQuery({
    queryKey,
    queryFn: () => loadMarketPromotions(companyId),
    enabled: access.data === true,
    retry: false,
    gcTime: 0,
  });
  const [editor, setEditor] = useState(() => editorFor());
  const [dirty, setDirty] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [recognizedText, setRecognizedText] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const savedPhoto = useQuery({
    queryKey: ["market-promotion-photo", userId, companyId, editor.id, editor.photoHash],
    queryFn: ({ signal }) => loadPromotionPhoto(editor.id, signal),
    enabled: access.data === true && !!editor.photoHash && !photo,
    retry: false,
    gcTime: 0,
  });
  const visiblePhoto = photo ?? savedPhoto.data;
  const hasPhotoPreview = !!visiblePhoto && !!photoUrl;
  const photoJob = useRef<AbortController | null>(null);
  const canEdit = !busy && progress === null;
  const pendingReview = editor.rows.filter(row => row.reviewNotes.length > 0).length;

  useEffect(() => () => photoJob.current?.abort(), []);
  useEffect(() => {
    if (!visiblePhoto) {
      setPhotoUrl("");
      return;
    }
    const url = URL.createObjectURL(visiblePhoto);
    setPhotoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [visiblePhoto]);

  function changed() {
    setDirty(true);
    setReviewed(false);
    setError("");
  }

  function openPromotion(promotion?: MarketPromotion) {
    if (dirty && !window.confirm("Descartar apenas as alterações ainda não salvas deste editor?")) return;
    setEditor(editorFor(promotion));
    setDirty(false);
    setReviewed(false);
    setError("");
    setNotice("");
    setRecognizedText("");
    setPhoto(null);
  }

  async function importPhoto(event: ChangeEvent<HTMLInputElement>, readItems = true) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !canEdit) return;
    const remaining = MAX_OFFER_ITEMS - editor.rows.filter(row => offerFields.some(field => row[field.key].trim())).length;
    if (readItems && remaining === 0) {
      setError("O editor já tem 60 itens. Remova um item ou abra outra promoção para importar.");
      return;
    }
    const job = new AbortController();
    photoJob.current = job;
    setProgress(0);
    setError("");
    setNotice("");
    try {
      if (!readItems) {
        const bitmap = await decodeOfferPhoto(file);
        bitmap.close();
        if (job.signal.aborted) return;
        changed();
        setPhoto(file);
        setRecognizedText("");
        setNotice("A foto será anexada ao salvar. Os itens do rascunho foram mantidos.");
        return;
      }
      const { readOfferPhoto } = await import("./offer-ocr");
      const result = await readOfferPhoto(file, setProgress, job.signal);
      if (job.signal.aborted) return;
      changed();
      setPhoto(file);
      setRecognizedText(result.text);
      const imported = result.suggestions.slice(0, remaining);
      const expires = editor.expires || result.expires || "";
      const expiryNote = result.expires && result.expires === expires
        ? ` Validade lida: ${formatOfferDate(expires)}${expires < cityToday() ? " (encarte vencido)" : ""}.`
        : "";
      if (imported.length === 0 && expires === editor.expires) {
        setNotice("Não consegui associar produtos e preços na foto. Tente uma imagem mais nítida ou um recorte do encarte." + expiryNote);
        return;
      }
      setEditor(current => ({
        ...current,
        expires: current.expires || expires,
        rows: imported.length ? [
          ...current.rows.filter(row => offerFields.some(field => row[field.key].trim())),
          ...imported.map(editorRow),
        ] : current.rows,
      }));
      const truncated = result.suggestions.length > imported.length ? " O editor aceita até 60 itens por promoção." : "";
      const message = imported.length
        ? `${imported.length} ${imported.length === 1 ? "produto preenchido" : "produtos preenchidos"}. Confira os valores com a foto.`
        : "A foto indicou a validade, mas não consegui associar produtos e preços.";
      setNotice(message + expiryNote + truncated);
    } catch (cause) {
      if (!job.signal.aborted) setError(cause instanceof Error ? cause.message : "A leitura da foto falhou. Tente outra imagem.");
    } finally {
      if (!job.signal.aborted) setProgress(null);
      photoJob.current = null;
    }
  }

  async function persist(status: PromotionStatus, archived?: MarketPromotion) {
    if (!canEdit) return;
    setError("");
    setNotice("");
    let input: PromotionInput;
    try {
      if (archived) {
        const { titulo, validade, itens, acao_ao_vencer, revisao_ocr } = archived;
        input = { titulo, validade, itens, acao_ao_vencer, revisao_ocr, status };
      } else {
        const titulo = editor.title.trim();
        if (!titulo) throw new Error("Dê um nome à promoção para encontrá-la no painel.");
        const itens = editor.rows.map(serializeOffer);
        const revisao_ocr = pendingReview ? editor.rows.map(row => row.reviewNotes) : [];
        if (status === "publicada") {
          if (pendingReview) throw new Error("Confira os itens marcados para revisão antes de publicar.");
          if (!reviewed) throw new Error("Confirme a revisão dos itens antes de publicar.");
          if (!editor.expires || editor.expires < cityToday()) throw new Error("Informe uma data de validade a partir de hoje.");
          if (!editor.expiryAction) throw new Error("Escolha o que fazer quando a promoção terminar.");
          const incomplete = itens.findIndex(item => !item.produto || !item.unidade || item.preco_centavos === null);
          if (incomplete >= 0) throw new Error(`Preencha produto, preço e unidade no item ${incomplete + 1}.`);
        }
        input = {
          titulo, validade: editor.expires || null, itens,
          acao_ao_vencer: editor.expiryAction, revisao_ocr, status,
        };
      }
      setBusy(true);
      const result = await saveMarketPromotion(
        companyId, archived?.id ?? editor.id, archived?.revisao ?? editor.revision, input, archived ? undefined : photo ?? undefined,
      );
      if (!archived || editor.id === result.id) {
        setEditor(editorFor(result));
        setPhoto(null);
        setDirty(false);
        setReviewed(false);
      }
      setNotice(status === "publicada" ? "Promoção publicada." :
        status === "arquivada" ? "Promoção retirada da página pública." : "Rascunho salvo.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey }),
        queryClient.invalidateQueries({ queryKey: ["public-market-offers"] }),
      ]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível salvar a promoção.");
    } finally {
      setBusy(false);
    }
  }

  if (access.isPending) return <p role="status">Conferindo o acesso às promoções…</p>;
  if (access.isError) return (
    <div className="space-y-3">
      <p role="alert">O painel de promoções está indisponível neste ambiente.</p>
      <Button variant="outline" onClick={() => void access.refetch()}>Tentar novamente</Button>
    </div>
  );
  if (!access.data) return <p>As promoções estão disponíveis para mercados ativos e aprovados vinculados à sua conta.</p>;

  const active: MarketPromotion[] = [];
  const archive: MarketPromotion[] = [];
  for (const item of saved.data ?? []) {
    const ended = hasEnded(item, today);
    if (ended && item.acao_ao_vencer === "retirar") continue;
    (ended || item.status === "arquivada" ? archive : active).push(item);
  }

  function renderPromotion(item: MarketPromotion, archived = false) {
    return (
      <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3">
        <div className="min-w-0">
          <p className="break-words font-medium">{item.titulo}</p>
          <p className="text-sm text-muted-foreground">
            {archived ? labels.arquivada : labels[item.status]}
            {item.validade && ` · Até ${formatOfferDate(item.validade)}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" disabled={!canEdit}
            onClick={() => openPromotion(item)} aria-label={`Editar ${item.titulo}`}>
            <PencilLine aria-hidden="true" />Editar
          </Button>
          {!archived && item.status === "publicada" && (
            <Button variant="outline" size="sm" disabled={!canEdit || (dirty && editor.id === item.id)}
              onClick={() => void persist("arquivada", item)} aria-label={`Arquivar ${item.titulo}`}>
              <Archive aria-hidden="true" />Arquivar
            </Button>
          )}
        </div>
      </li>
    );
  }

  return (
    <section className="space-y-5" aria-labelledby="promotion-editor-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="promotion-editor-title" className="text-2xl font-bold">Promoções do mercado</h2>
          <p className="text-sm text-muted-foreground">Digite as ofertas ou leia a foto de um encarte para começar.</p>
        </div>
        <Button asChild variant="outline"><a href="/ofertas">Ver ofertas públicas</a></Button>
      </div>
      <Card>
        <CardContent className="space-y-4 p-4 sm:p-6">
          <h3 className="font-semibold">Promoções salvas</h3>
          {saved.isPending && <p role="status">Carregando promoções…</p>}
          {saved.isError && <div className="space-y-2">
            <p role="alert">Não foi possível carregar as promoções salvas.</p>
            <Button variant="outline" onClick={() => void saved.refetch()}>Tentar novamente</Button>
          </div>}
          {saved.isSuccess && active.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma promoção ativa ou rascunho.</p>}
          {active.length > 0 && <ul className="space-y-3">{active.map(item => renderPromotion(item))}</ul>}
          {archive.length > 0 && (
            <details className="space-y-3 rounded-lg border p-3">
              <summary className="cursor-pointer font-medium">Arquivo ({archive.length})</summary>
              <ul className="space-y-3">{archive.map(item => renderPromotion(item, true))}</ul>
            </details>
          )}
          <Button variant="outline" disabled={!canEdit} onClick={() => openPromotion()}><Plus aria-hidden="true" />Nova promoção</Button>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-5 p-4 sm:p-6">
          <h3 className="text-lg font-semibold">{editor.revision ? "Editar promoção" : "Nova promoção"}</h3>
          <fieldset disabled={!canEdit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
              <div className="space-y-2">
                <Label htmlFor="promotion-title">Nome da promoção</Label>
                <Input id="promotion-title" maxLength={80} placeholder="Ex.: Encarte do fim de semana" value={editor.title}
                  onChange={event => { changed(); setEditor({ ...editor, title: event.target.value }); }} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promotion-expiry">Válida até</Label>
                <Input id="promotion-expiry" type="date" value={editor.expires}
                  onChange={event => { changed(); setEditor({ ...editor, expires: event.target.value }); }} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="promotion-expiry-action">Quando a promoção terminar</Label>
              <select id="promotion-expiry-action" required value={editor.expiryAction ?? ""}
                aria-describedby="promotion-expiry-action-hint"
                className="flex h-10 w-full max-w-md rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                onChange={event => {
                  const value = event.target.value as PromotionExpiryAction | "";
                  changed();
                  setEditor(current => ({ ...current, expiryAction: value || null }));
                }}>
                <option value="" disabled>Escolha uma ação</option>
                <option value="arquivar">Arquivar no painel</option>
                <option value="retirar">Remover da lista do painel</option>
              </select>
              <p id="promotion-expiry-action-hint" className="text-sm text-muted-foreground">
                Escolha obrigatória para publicar. A oferta sai da busca após o último dia de validade.
              </p>
            </div>
            <div className="space-y-2 rounded-xl border p-4">
              <Label htmlFor="promotion-photo" className="flex items-center gap-2">
                <Camera aria-hidden="true" className="h-4 w-4" />Importar foto do encarte
              </Label>
              <Input id="promotion-photo" type="file" accept={OFFER_PHOTO_TYPES}
                aria-describedby="promotion-photo-hint" onChange={event => void importPhoto(event)} />
              <p id="promotion-photo-hint" className="text-sm text-muted-foreground">
                JPG, PNG ou WebP de até 12 MB. A foto fica disponível no painel do mercado depois de salvar.
              </p>
              {editor.revision && (
                <div className="space-y-2">
                  <Label htmlFor="promotion-reference-photo">Anexar foto sem importar itens</Label>
                  <Input id="promotion-reference-photo" type="file" accept={OFFER_PHOTO_TYPES}
                    aria-describedby="promotion-photo-hint" onChange={event => void importPhoto(event, false)} />
                </div>
              )}
              {!photo && editor.photoHash && savedPhoto.isFetching && <p role="status">Carregando foto salva…</p>}
              {!photo && savedPhoto.isError && (
                <Button type="button" variant="outline" onClick={() => void savedPhoto.refetch()}>
                  Tentar carregar a foto novamente
                </Button>
              )}
            </div>

            <div className={hasPhotoPreview ? "grid min-w-0 gap-4 lg:grid-cols-2 lg:items-start" : undefined}>
              {hasPhotoPreview && <PromotionPhotoViewer key={photoUrl} photoUrl={photoUrl} recognizedText={recognizedText} />}
              <div className="min-w-0 space-y-4">
                {editor.rows.map((row, index) => (
                  <fieldset key={row.key} className={`grid min-w-0 gap-3 rounded-xl border p-4 ${hasPhotoPreview
                    ? "sm:grid-cols-2"
                    : "md:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_2fr_auto] xl:items-end"}`}>
                    <legend className="px-2 text-sm font-medium">
                      Item {index + 1}{row.reviewNotes.length > 0 && " · Revisar leitura"}
                    </legend>
                    {row.reviewNotes.length > 0 && (
                      <div className="col-span-full space-y-2 text-sm">
                        <ul className="list-disc space-y-1 pl-5">
                          {row.reviewNotes.map(note => <li key={note}>{note}</li>)}
                        </ul>
                        <Button variant="outline" size="sm" type="button" onClick={() => {
                          changed();
                          setEditor(current => ({
                            ...current,
                            rows: current.rows.map(item => item.key === row.key ? { ...item, reviewNotes: [] } : item),
                          }));
                        }} aria-label={`Marcar item ${index + 1} como revisado`}>Marcar como revisado</Button>
                      </div>
                    )}
                    {offerFields.map(field => (
                      <div key={field.key} className="min-w-0 space-y-2">
                        <Label htmlFor={`offer-${row.key}-${field.key}`}>{field.label}</Label>
                        <Input id={`offer-${row.key}-${field.key}`} value={row[field.key]} maxLength={field.maxLength}
                          inputMode={field.key === "preco" ? "decimal" : undefined} placeholder={field.placeholder}
                          onChange={event => {
                            changed();
                            const value = event.target.value;
                            setEditor(current => ({
                              ...current,
                              rows: current.rows.map(item => item.key === row.key ? { ...item, [field.key]: value } : item),
                            }));
                          }} />
                      </div>
                    ))}
                    <Button variant="ghost" size="icon" type="button" aria-label={`Remover item ${index + 1}`}
                      disabled={editor.rows.length === 1} onClick={() => {
                        changed();
                        setEditor(current => ({ ...current, rows: current.rows.filter(item => item.key !== row.key) }));
                      }}><X aria-hidden="true" /></Button>
                  </fieldset>
                ))}
                <Button variant="outline" disabled={editor.rows.length >= MAX_OFFER_ITEMS} onClick={() => {
                  changed();
                  setEditor(current => ({ ...current, rows: [...current.rows, editorRow()] }));
                }}><Plus aria-hidden="true" />Adicionar item manualmente</Button>

                {pendingReview > 0 && (
                  <p role="status" className="text-sm font-medium">
                    {pendingReview === 1 ? "1 item precisa" : `${pendingReview} itens precisam`} de revisão antes de publicar.
                  </p>
                )}
                <label className="flex items-start gap-2 text-sm">
                  <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
                    checked={reviewed} onChange={event => setReviewed(event.target.checked)} />
                  Revisei os produtos, preços, unidades, condições e validade.
                </label>
              </div>
            </div>
          </fieldset>
          {progress !== null && <p role="status">Lendo foto do encarte… {progress}%</p>}
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          {notice && <p role="status" className="text-sm text-primary">{notice}</p>}
          <div className="flex flex-wrap gap-2">
            {editor.status !== "publicada" && (
              <Button variant="outline" disabled={!canEdit} onClick={() => void persist("rascunho")}>Salvar rascunho</Button>
            )}
            <Button disabled={!canEdit || !reviewed || pendingReview > 0} onClick={() => void persist("publicada")}>
              {busy ? "Salvando…" : editor.status === "publicada" ? "Publicar alterações" : "Publicar promoção"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
