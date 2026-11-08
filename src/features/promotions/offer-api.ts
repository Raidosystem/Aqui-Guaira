import { promotionClient as supabase } from "./promotion-client";
import type { StoredOffer } from "./offer-fields";

export type PromotionStatus = "rascunho" | "publicada" | "arquivada";
export type PromotionExpiryAction = "arquivar" | "retirar";

const promotionColumns = "id,revisao,titulo,itens,validade,status,acao_ao_vencer,revisao_ocr,encarte:promocoes_mercado_encartes(hash)";

export interface PromotionInput {
  titulo: string;
  itens: StoredOffer[];
  revisao_ocr: string[][];
  validade: string | null;
  acao_ao_vencer: PromotionExpiryAction | null;
  status: PromotionStatus;
}

export interface MarketPromotion extends PromotionInput {
  id: string;
  revisao: string;
  encarte: { hash: string } | null;
}

type PublicOfferItem = Omit<StoredOffer, "preco_centavos"> & { preco_centavos: number };

export interface PublicOffer extends PublicOfferItem {
  promocao_id: string;
  ordem: number;
  empresa_id: string;
  mercado: string;
  validade: string;
}

export async function canManagePromotions(companyId: string) {
  const { data, error } = await supabase.rpc("pode_gerenciar_promocoes", { p_empresa_id: companyId });
  if (error) throw error;
  return data === true;
}

export async function loadMarketPromotions(companyId: string) {
  const { data, error } = await supabase
    .from("promocoes_mercado")
    .select(promotionColumns)
    .eq("empresa_id", companyId)
    .order("atualizado_em", { ascending: false })
    .overrideTypes<MarketPromotion[], { merge: false }>();
  if (error) throw error;
  return data;
}

export interface PublicMarketPromotion {
  id: string;
  titulo: string;
  validade: string;
  itens: PublicOfferItem[];
  tem_encarte: boolean;
}

export const MARKET_PROMOTIONS_PER_PAGE = 10;

type PromotionPhoto = { mime: string; base64: string };

function decodePromotionPhoto(photo: PromotionPhoto) {
  const contents = atob(photo.base64);
  const bytes = new Uint8Array(contents.length);
  for (let index = 0; index < bytes.length; index++) bytes[index] = contents.charCodeAt(index);
  return new Blob([bytes], { type: photo.mime });
}

export async function listPublicMarketPromotions(companyId: string, offset: number, signal: AbortSignal): Promise<PublicMarketPromotion[]> {
  const { data, error } = await supabase.rpc("listar_promocoes_publicas_mercado", { p_empresa_id: companyId })
    .order("validade").order("titulo").order("id")
    .range(offset, offset + MARKET_PROMOTIONS_PER_PAGE)
    .abortSignal(signal);
  if (error) throw error;
  if (!Array.isArray(data)) throw new Error("Não foi possível carregar as ofertas do mercado.");
  return data;
}

export async function loadPublicMarketFlyer(companyId: string, id: string, signal?: AbortSignal) {
  const request = supabase.rpc("baixar_encarte_publico", { p_empresa_id: companyId, p_id: id });
  if (signal) request.abortSignal(signal);
  const { data, error } = await request.maybeSingle().overrideTypes<PromotionPhoto, { merge: false }>();
  if (error) throw error;
  return data ? decodePromotionPhoto(data) : null;
}

export async function loadPromotionPhoto(id: string, signal: AbortSignal) {
  const { data, error } = await supabase.rpc("ler_encarte_promocao", { p_id: id }).abortSignal(signal).maybeSingle();
  const result = data as PromotionPhoto | null;
  if (error || !result) throw new Error("Não foi possível abrir a foto salva.");
  return decodePromotionPhoto(result);
}

async function encodePromotionPhoto(file: File) {
  const [dataUrl, digest] = await Promise.all([
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reader.onabort = () => reject(new Error("Não foi possível preparar a foto para salvar."));
      reader.readAsDataURL(file);
    }),
    file.arrayBuffer().then(bytes => crypto.subtle.digest("SHA-256", bytes)),
  ]);
  return {
    base64: dataUrl.slice(dataUrl.indexOf(",") + 1),
    hash: Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join(""),
  };
}

function samePromotion(current: MarketPromotion, attempted: PromotionInput) {
  return current.titulo === attempted.titulo && current.validade === attempted.validade
    && current.acao_ao_vencer === attempted.acao_ao_vencer
    && current.status === attempted.status && current.itens.length === attempted.itens.length
    && JSON.stringify(current.revisao_ocr) === JSON.stringify(attempted.revisao_ocr)
    && current.itens.every((item, index) => {
      const other = attempted.itens[index];
      return item.produto === other.produto && item.unidade === other.unidade
        && item.preco_centavos === other.preco_centavos && item.condicoes === other.condicoes;
    });
}

export async function saveMarketPromotion(
  companyId: string,
  id: string,
  revision: string | null,
  input: PromotionInput,
  photo?: File,
) {
  const table = supabase.from("promocoes_mercado");
  const attachment = photo ? await encodePromotionPhoto(photo) : null;
  const write = photo && attachment
    ? supabase.rpc("salvar_promocao_com_encarte", {
        p_empresa_id: companyId, p_id: id, p_revisao: revision, p_dados: input,
        p_mime: photo.type, p_foto: attachment.base64,
      })
    : revision
      ? table.update(input).eq("empresa_id", companyId).eq("id", id).eq("revisao", revision)
      : table.insert({ ...input, id, empresa_id: companyId });
  // The attachment's primary key makes the embedded relation a single row.
  const { data: saved, error } = await write.select(promotionColumns).maybeSingle()
    .overrideTypes<MarketPromotion, { merge: false }>();
  if (!error && saved && (!attachment || saved.encarte?.hash === attachment.hash)) return saved;

  // A request that lost its response can be retried without creating a second campaign.
  const { data: latest } = await table.select(promotionColumns)
    .eq("empresa_id", companyId).eq("id", id).maybeSingle()
    .overrideTypes<MarketPromotion, { merge: false }>();
  if (latest && samePromotion(latest, input) && (!attachment || latest.encarte?.hash === attachment.hash)) return latest;
  if (latest && (revision === null || latest.revisao !== revision)) {
    throw new Error("Esta promoção mudou em outra aba. Copie seus ajustes e reabra a versão salva antes de tentar novamente.");
  }
  throw new Error(photo ? "Não foi possível salvar a promoção com a foto. Tente novamente."
    : "Não foi possível salvar a promoção. Confira a conexão e se a empresa ainda tem acesso.");
}

export async function searchPublicOffers(product: string, market: string, offset: number) {
  const { data, error } = await supabase.rpc("buscar_ofertas_mercado", {
    p_produto: product,
    p_mercado: market,
    p_offset: offset,
  });
  if (error) throw error;
  return data as PublicOffer[];
}
