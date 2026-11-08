import { createWorker, OEM, PSM, type Worker } from "tesseract.js";
import { cityToday, emptyOffer, MAX_OFFER_ITEMS, parsePrice, type ImportedOffer, type OfferFields } from "./offer-fields";

import { darkProductText, dateBanner, mergeTextLines, normalizeQuantities, priceSheet, promotionalTags, spatialOffers, tagPrices, type TextLine } from "./offer-ocr-layout";

import { decodeOfferPhoto } from "./offer-photo";
const maxImageSide = 2400;
const pricePattern = /(?:R\s*[$S]\s*)?(?<![\d.,])(?:\d{1,3}(?:\.\d{3})+|\d{1,6})[,.]\d{2}(?![\d.,])/gi;

export function suggestOffers(blocks: string[]): OfferFields[] {
  const suggestions: OfferFields[] = [];
  for (const block of blocks) {
    let previousLabel = "";
    for (const rawLine of block.split("\n")) {
      const line = rawLine.trim();
      if (!line) continue;
      const prices = [...line.matchAll(pricePattern)];
      if (prices.length === 0) {
        previousLabel = /\p{L}/u.test(line) ? line : "";
        continue;
      }
      const first = prices[0];
      const before = line.slice(0, first.index).replace(/[\s:–-]+$/, "");
      const after = line.slice((first.index ?? 0) + first[0].length).trim();
      const candidate = first[0].replace(/^R\s*[$S]\s*/i, "").replace(/\.(?=\d{2}$)/, ",");
      const unit = /^(?:\/\s*)?(kg|un(?:idade)?s?|lt|litros?|l|pacote|pct|caixa|cx|bandeja)\b/i.exec(after);
      const label = (/\p{L}{2}/u.test(before) ? before : previousLabel).trim();
      if (label.length >= 4 && !/\b(?:validade|válidas?|descontos?|ofertas?|economize)\b/i.test(label) &&
          prices.length === 1 && parsePrice(candidate) !== null) {
        suggestions.push({
          ...emptyOffer(),
          produto: label.slice(0, 120),
          preco: candidate,
          unidade: unit?.[1].toLowerCase() ?? "unidade",
        });
      }
      previousLabel = "";
      if (suggestions.length === MAX_OFFER_ITEMS) return suggestions;
    }
  }
  return suggestions;
}

const dateToken = /\b(\d{1,2})\s*[/.-]\s*(\d{1,2})(?:\s*[/.-]\s*(\d{4}|\d{2}))?(?![\d/])/g;
const validity = /\b(?:validade|valid[oa]s?|vigencia|termina|encerramento|ate)\b/;
const months = ["janeiro", "fevereiro", "marco", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const writtenDate = new RegExp(`\\b(\\d{1,2}) de (${months.join("|")})(?: de (\\d{4}))?\\b`, "g");
const todayOnly = /\b(?:so|somente|apenas)\s+(?:hoje|hj)\b/;

export function offerExpiry(text: string, today = cityToday()): string | null {
  const dates = new Set<string>();
  let declaredToday = false;
  let hasPrintedDate = false;
  const normalized = text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase()
    .replace(/(\b(?:validade|ate|de|a)[ \t]*:?)\s*\n[ \t]*(?=\d{1,2}\s*[/.-])/g, "$1 ");
  for (const rawLine of normalized.split("\n")) {
    const line = rawLine.trim().replace(writtenDate, (_, day: string, month: string, year?: string) =>
      `${day}/${months.indexOf(month) + 1}${year ? "/" + year : ""}`);
    const onlyToday = todayOnly.test(line);
    declaredToday ||= onlyToday;
    if (!onlyToday && !validity.test(line)) continue;
    const matches = [...line.matchAll(dateToken)];
    if (matches.length === 0) continue;
    hasPrintedDate = true;
    const last = matches.at(-1)!;
    if (matches.length === 1 && !onlyToday && /\bde\s*$/.test(line.slice(0, last.index))) continue;
    if (matches.length > 1) {
      const previous = matches.at(-2)!;
      const between = line.slice((previous.index ?? 0) + previous[0].length, last.index).trim();
      if (!/^(?:a|ate|[-–—])$/.test(between)) continue;
    }
    const [, day, month, printedYear] = last;
    const year = printedYear?.length === 2 ? "20" + printedYear : printedYear ?? today.slice(0, 4);
    if (Number(year) < 1900 || Number(year) > 2199) continue;
    const iso = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    const date = new Date(iso + "T00:00:00Z");
    if (!Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === iso) dates.add(iso);
  }
  if (dates.size === 1) return [...dates][0];
  return dates.size === 0 && declaredToday && !hasPrintedDate ? today : null;
}

function distinctOffers(offers: ImportedOffer[]) {
  const seen = new Set<string>();
  return offers.filter(({ produto, preco }) => {
    const key = produto.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "") + ":" + preco;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, MAX_OFFER_ITEMS);
}

async function photoCanvas(file: File) {
  const bitmap = await decodeOfferPhoto(file);
  try {
    const scale = Math.min(1, maxImageSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("O navegador não conseguiu preparar a imagem.");
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return canvas;
  } finally {
    bitmap.close();
  }
}

export async function readOfferPhoto(file: File, onProgress: (percent: number) => void, signal: AbortSignal) {
  const image = await photoCanvas(file);
  signal.throwIfAborted();
  let worker: Worker | undefined;
  let finished = false;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let stop: () => void = () => undefined;
  const stopped = new Promise<never>((_, reject) => {
    stop = () => reject(new Error("A leitura demorou demais ou foi interrompida. Tente uma foto mais nítida."));
    signal.addEventListener("abort", stop, { once: true });
    timeout = setTimeout(stop, 90000);
  });

  const recognize = async () => {
    const started = await createWorker("por", OEM.LSTM_ONLY, {
      workerPath: "/ocr/promotion-worker.js",
      corePath: "/ocr/tesseract-core-lstm.wasm.js",
      langPath: "/ocr",
      workerBlobURL: false,
      logger: (message) => {
        if (!finished && message.status === "recognizing text") onProgress(Math.round(message.progress * 100));
      },
      errorHandler: stop,
    });
    if (finished) {
      await started.terminate();
      throw new Error("Leitura interrompida.");
    }
    worker = started;
    const read = async (canvas: HTMLCanvasElement, mode: PSM, whitelist = "") => {
      signal.throwIfAborted();
      await started.setParameters({ tessedit_pageseg_mode: mode, tessedit_char_whitelist: whitelist });
      const { data } = await started.recognize(canvas, {}, { text: true, blocks: true });
      const paragraphs = data.blocks?.flatMap(block => block.paragraphs) ?? [];
      const lines: TextLine[] = paragraphs.flatMap(paragraph => paragraph.lines);
      return { text: data.text.trim(), confidence: data.confidence, lines, paragraphs: paragraphs.map(paragraph => paragraph.text) };
    };

    const tags = priceSheet(image);
    const page = await read(image, tags ? PSM.SPARSE_TEXT : PSM.AUTO);
    const suggestions = suggestOffers(page.paragraphs.length ? page.paragraphs : [page.text]);
    const banner = dateBanner(image);
    const bannerText = banner ? (await read(banner, PSM.SPARSE_TEXT)).text : "";
    const text = [bannerText, page.text].filter(Boolean).join("\n\n");
    let taggedOffers: ImportedOffer[] = [];
    if (tags) {
      const labels = await read(darkProductText(image), PSM.SPARSE_TEXT);
      const prices = tagPrices(tags.tags, (await read(tags.sheet, PSM.SPARSE_TEXT, "0123456789")).lines);
      const markers = await promotionalTags(image, tags.tags, prices, async crop =>
        (await read(crop, PSM.SINGLE_LINE, "DePor:")).text);
      taggedOffers = await spatialOffers(image, mergeTextLines(page.lines, labels.lines), prices, markers,
        tags, (crop, whitelist, singleWord) => read(crop, singleWord ? PSM.SINGLE_WORD : PSM.SINGLE_LINE, whitelist));
    }
    return {
      text,
      expires: offerExpiry(text),
      suggestions: distinctOffers([...taggedOffers, ...suggestions.map(offer => ({
        ...offer, produto: normalizeQuantities(offer.produto), reviewNotes: [],
      }))]),
    };
  };

  try {
    return await Promise.race([recognize(), stopped]);
  } finally {
    finished = true;
    clearTimeout(timeout);
    signal.removeEventListener("abort", stop);
    await worker?.terminate();
  }
}
