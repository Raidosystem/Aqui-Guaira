export const MAX_OFFER_ITEMS = 60;
export const OFFERS_PER_PAGE = 24;

export interface OfferFields {
  produto: string;
  preco: string;
  unidade: string;
  condicoes: string;
}

export interface ImportedOffer extends OfferFields {
  reviewNotes: string[];
}

export interface StoredOffer extends Omit<OfferFields, "preco"> {
  preco_centavos: number | null;
}

export function emptyOffer(): OfferFields {
  return { produto: "", preco: "", unidade: "", condicoes: "" };
}

export function parsePrice(value: string): number | null {
  const normalized = value.trim();
  if (!/^(?:\d{1,6}|\d{1,3}\.\d{3})(?:,\d{1,2})?$/.test(normalized)) return null;

  const [reais, cents = ""] = normalized.replace(/\./g, "").split(",");
  const valueInCents = Number(reais) * 100 + Number(cents.padEnd(2, "0"));
  return valueInCents > 0 && valueInCents <= 99999999 ? valueInCents : null;
}

export function offerFromStorage({ preco_centavos, ...fields }: StoredOffer): OfferFields {
  return {
    ...fields,
    preco: preco_centavos === null ? "" : (preco_centavos / 100).toFixed(2).replace(".", ","),
  };
}

export function serializeOffer(fields: OfferFields): StoredOffer {
  const precoCentavos = parsePrice(fields.preco);
  if (fields.preco.trim() && precoCentavos === null) throw new Error("Confira os preços no formato 12,90.");
  return {
    produto: fields.produto.trim(),
    unidade: fields.unidade.trim(),
    condicoes: fields.condicoes.trim(),
    preco_centavos: precoCentavos,
  };
}

const cityDateFormatter = new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Sao_Paulo" });

export function cityToday(): string {
  return cityDateFormatter.format(new Date());
}

export const formatOfferPrice = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

export const formatOfferDate = (date: string) => date.split("-").reverse().join("/");
