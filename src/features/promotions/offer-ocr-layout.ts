import { parsePrice, type ImportedOffer } from "./offer-fields";

export type TextLine = { text: string; confidence: number; bbox: Box };
type Box = { x0: number; y0: number; x1: number; y1: number };
type Component = Box & { area: number };
const width = (box: Box) => box.x1 - box.x0;
const height = (box: Box) => box.y1 - box.y0;
const overlap = (a: Box, b: Box) => Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0);
const centerY = (box: Box) => (box.y0 + box.y1) / 2;

function bounds(boxes: Box[]): Box {
  return {
    x0: Math.min(...boxes.map(box => box.x0)),
    y0: Math.min(...boxes.map(box => box.y0)),
    x1: Math.max(...boxes.map(box => box.x1)),
    y1: Math.max(...boxes.map(box => box.y1)),
  };
}

function pixels(image: HTMLCanvasElement) {
  return image.getContext("2d")!.getImageData(0, 0, image.width, image.height);
}

function canvas(w: number, h: number) {
  const image = document.createElement("canvas");
  image.width = w;
  image.height = h;
  const context = image.getContext("2d")!;
  context.fillStyle = "white";
  context.fillRect(0, 0, w, h);
  return { image, context };
}

function maskFor(image: ImageData, matches: (r: number, g: number, b: number) => boolean) {
  const mask = new Uint8Array(image.width * image.height);
  for (let i = 0, p = 0; i < mask.length; i++, p += 4) {
    mask[i] = Number(matches(image.data[p], image.data[p + 1], image.data[p + 2]));
  }
  return mask;
}

function components(mask: Uint8Array, w: number, minArea: number): Component[] {
  const found: Component[] = [];
  const queue = new Int32Array(mask.length);
  for (let i = 0; i < mask.length; i++) {
    if (!mask[i]) continue;
    let end = 1;
    queue[0] = i;
    mask[i] = 0;
    let x0 = i % w;
    let x1 = x0;
    let y0 = Math.floor(i / w);
    let y1 = y0;
    function visit(index: number) {
      if (!mask[index]) return;
      mask[index] = 0;
      queue[end++] = index;
    }
    for (let start = 0; start < end; start++) {
      const point = queue[start];
      const x = point % w;
      const y = Math.floor(point / w);
      x0 = Math.min(x0, x);
      x1 = Math.max(x1, x);
      y0 = Math.min(y0, y);
      y1 = Math.max(y1, y);
      if (x > 0) visit(point - 1);
      if (x < w - 1) visit(point + 1);
      visit(point - w);
      visit(point + w);
    }
    if (end >= minArea) found.push({ x0, y0, x1: x1 + 1, y1: y1 + 1, area: end });
  }
  return found;
}

const redInk = (r: number, g: number, b: number) => r > 100 && r - g > 60 && g < 135 && r - b > 45;
const yellowPaper = (r: number, g: number, b: number) => r > 205 && g > 175 && b < 115 && g - b > 85;

function monochrome(data: ImageData, ink: (r: number, g: number, b: number) => boolean) {
  const { image, context } = canvas(data.width, data.height);
  for (let p = 0; p < data.data.length; p += 4) {
    const value = ink(data.data[p], data.data[p + 1], data.data[p + 2]) ? 0 : 255;
    data.data[p] = data.data[p + 1] = data.data[p + 2] = value;
  }
  context.putImageData(data, 0, 0);
  return image;
}

export function darkProductText(image: HTMLCanvasElement) {
  return monochrome(pixels(image), (r, g, b) => Math.max(r, g, b) <= 130);
}

export function mergeTextLines(original: TextLine[], contrasted: TextLine[]) {
  const result = [...original];
  for (const line of contrasted) {
    const box = line.bbox;
    const duplicate = result.findIndex(({ bbox: other }) => {
      const sharedHeight = Math.min(box.y1, other.y1) - Math.max(box.y0, other.y0);
      return sharedHeight >= Math.min(height(box), height(other)) * 0.7 &&
        overlap(box, other) >= Math.min(width(box), width(other)) * 0.6;
    });
    const score = ({ confidence, text }: TextLine) =>
      confidence + Math.min(text.trim().length, 40) + (/\d\s*(?:kg|g|litros?|ml|cm)\b/i.test(text) ? 7 : 0);
    if (duplicate === -1) result.push(line);
    else if (score(line) >= score(result[duplicate])) result[duplicate] = line;
  }
  return result;
}

export function dateBanner(image: HTMLCanvasElement) {
  const data = pixels(image);
  const bands: Box[] = [];
  let start = -1;
  for (let y = 0; y <= data.height; y++) {
    let red = 0;
    for (let x = 0; y < data.height && x < data.width; x += 4) {
      const p = (y * data.width + x) * 4;
      if (redInk(data.data[p], data.data[p + 1], data.data[p + 2])) red += 4;
    }
    if (red > data.width * 0.61) {
      if (start < 0) start = y;
    } else if (start >= 0) {
      if (y - start >= 9) {
        const band = bands.at(-1);
        if (band && start - band.y1 < 22) band.y1 = y;
        else bands.push({ x0: 0, x1: data.width, y0: start, y1: y });
      }
      start = -1;
    }
  }
  const wideBands = bands.filter(band => height(band) >= 22).slice(0, 6);
  if (wideBands.length === 0) return null;
  const { image: sheet, context } = canvas(image.width, wideBands.reduce((h, band) => h + height(band) + 30, 10));
  let top = 10;
  for (const band of wideBands) {
    const crop = image.getContext("2d")!.getImageData(0, band.y0, image.width, height(band));
    context.drawImage(monochrome(crop, (r, g, b) => Math.min(r, g, b) > 175), 0, top);
    top += height(band) + 30;
  }
  return sheet;
}

type Tag = { box: Box; whole: Box; cents: Box; digits: number };
const priceRowHeight = 82;

export function priceSheet(image: HTMLCanvasElement) {
  const source = pixels(image);
  const scale = Math.max(0.6, image.width / 1200);
  const tags: Tag[] = [];
  const badges: Box[] = [];
  const context = image.getContext("2d")!;
  for (const box of components(maskFor(source, yellowPaper), image.width, 420 * scale ** 2)) {
    if (width(box) < 25 * scale || height(box) < 20 * scale ||
        width(box) > 240 * scale || height(box) > 140 * scale) continue;
    const crop = context.getImageData(box.x0, box.y0, width(box), height(box));
    const ink = components(maskFor(crop, redInk), crop.width, 10 * scale ** 2);
    const tallest = Math.max(0, ...ink.filter(part => width(part) > 7 * scale).map(height));
    if (tallest < 15 * scale) continue;
    if (tallest < height(box) * 0.36) {
      if (tallest >= height(box) * 0.27) badges.push(box);
      continue;
    }
    const whole = ink.filter(part => height(part) >= tallest * 0.8 && part.area >= tallest ** 2 * 0.12);
    if (whole.length === 0 || whole.length > 4) continue;
    const base = bounds(whole);
    const cents = ink.filter(part => part.x0 >= base.x1 - 1 &&
      Math.abs(part.y0 - base.y0) < tallest * 0.15 &&
      height(part) >= tallest * 0.48 && height(part) <= tallest * 0.72 &&
      width(part) >= tallest * 0.23 && part.area >= tallest ** 2 * 0.06);
    if (cents.length !== 2) {
      badges.push(box);
      continue;
    }
    tags.push({ box, whole: base, cents: bounds(cents), digits: whole.length + 2 });
    if (tags.length >= 80) break;
  }
  if (tags.length === 0) return null;
  const { image: sheet, context: target } = canvas(300, tags.length * priceRowHeight);
  for (const [index, tag] of tags.entries()) {
    let left = 16;
    for (const part of [tag.whole, tag.cents]) {
      const crop = context.getImageData(tag.box.x0 + part.x0, tag.box.y0 + part.y0, width(part), height(part));
      const scaledWidth = Math.round(crop.width * 42 / crop.height);
      target.drawImage(monochrome(crop, redInk), left, index * priceRowHeight + 14, scaledWidth, 42);
      left += scaledWidth + 8;
    }
  }
  return { sheet, tags, badges };
}

export function tagPrices(tags: Tag[], priceLines: TextLine[]) {
  const prices = new Map<Tag, string>();
  for (const line of priceLines) {
    const tag = tags[Math.floor(centerY(line.bbox) / priceRowHeight)];
    const digits = line.text.replace(/\s/g, "");
    if (!tag || line.confidence < 55 || digits.length !== tag.digits || !/^\d+$/.test(digits)) continue;
    const price = digits.slice(0, -2) + "," + digits.slice(-2);
    if (parsePrice(price) !== null) prices.set(tag, price);
  }
  return prices;
}

export async function promotionalTags(
  image: HTMLCanvasElement,
  tags: Tag[],
  prices: Map<Tag, string>,
  readCaption: (crop: HTMLCanvasElement) => Promise<string>,
) {
  const previous = new Set<Tag>();
  const current = new Set<Tag>();
  const unresolved = new Set<Tag>();
  for (const upper of tags) {
    if (unresolved.has(upper) || current.has(upper) || upper.whole.y0 < height(upper.box) * 0.2) continue;
    const lower = tags.find(candidate => {
      const gap = candidate.box.y0 - upper.box.y1;
      return gap >= 0 && gap <= height(upper.box) * 0.2 &&
        Math.abs(candidate.box.x0 - upper.box.x0) < width(upper.box) * 0.1 &&
        Math.abs(candidate.box.x1 - upper.box.x1) < width(upper.box) * 0.1 &&
        candidate.whole.y0 >= height(candidate.box) * 0.2;
    });
    if (!lower) continue;

    async function caption(tag: Tag) {
      const digitHeight = height(tag.whole);
      const h = Math.round(digitHeight * 0.28);
      const left = tag.box.x0 + Math.round(digitHeight * 0.06);
      const top = tag.box.y0 + tag.whole.y0 - Math.round(digitHeight * 0.31);
      for (const widthRatio of [0.5, 0.57, 0.72]) {
        const w = Math.round(digitHeight * widthRatio);
        const { image: crop, context } = canvas(w * 7 + 40, h * 7 + 28);
        context.imageSmoothingQuality = "high";
        context.drawImage(image, left, top, w, h, 20, 14, w * 7, h * 7);
        const label = (await readCaption(crop)).trim().toLowerCase().replace(/[^a-z]/g, "");
        if (label === "de" || label === "por") return label;
      }
      return null;
    }
    const before = await caption(upper);
    const after = before === "de" ? await caption(lower) : null;
    const oldPrice = parsePrice(prices.get(upper) ?? "");
    const newPrice = parsePrice(prices.get(lower) ?? "");
    // The old price is explicit. A cheaper amount in its paired tag can still
    // be read when the smaller "Por" caption is blurred.
    const cheaper = oldPrice !== null && newPrice !== null && newPrice < oldPrice;
    if (before === "de" && (after === "por" || (after === null && cheaper))) {
      previous.add(upper);
      current.add(lower);
    } else {
      unresolved.add(upper);
      unresolved.add(lower);
    }
  }
  return { previous, current, unresolved };
}

type Label = { box: Box; lastLine: Box; text: string; confidence: number };

function productLabels(image: HTMLCanvasElement, lines: TextLine[]): Label[] {
  const source = pixels(image);
  const labels: Label[] = [];
  for (const line of [...lines].sort((a, b) => a.bbox.y0 - b.bbox.y0)) {
    const box = line.bbox;
    const text = line.text.trim().replace(/^(?:[^\p{L}\p{N}]+|[aàeío]\s+(?=\p{Lu}))/u, "");
    if ((line.confidence < 33 && !/^\d+\s*(?:l|litros?|kg|g)\b/i.test(text)) || text.length < 3 || !/\p{L}{2}/u.test(text) ||
        /\b(?:desconto|válidas?|ofertas?|estoques?)\b/i.test(text) || /\d+[,.]\d{2}\b/.test(text) ||
        height(box) > image.height * 0.045) continue;
    let white = 0;
    let dark = 0;
    let neutral = 0;
    let total = 0;
    for (let y = Math.max(0, box.y0); y < Math.min(source.height, box.y1); y += 2) {
      for (let x = Math.max(0, box.x0); x < Math.min(source.width, box.x1); x += 2) {
        const p = (y * source.width + x) * 4;
        const hi = Math.max(source.data[p], source.data[p + 1], source.data[p + 2]);
        const lo = Math.min(source.data[p], source.data[p + 1], source.data[p + 2]);
        white += Number(lo >= 205);
        dark += Number(hi <= 100);
        neutral += Number(hi - lo <= 30);
        total++;
      }
    }
    if (!total || white / total < 0.30 || dark / total < 0.08 || neutral / total < 0.73) continue;

    let nearest: Label | undefined;
    let closest = Infinity;
    for (const candidate of labels) {
      const previous = candidate.lastLine;
      const gap = box.y0 - previous.y1;
      const edge = Math.min(Math.abs(box.x0 - previous.x0), Math.abs(box.x1 - previous.x1));
      const shared = overlap(previous, box);
      if (gap >= -2 && gap <= height(box) * 0.9 && shared > 0 &&
          (edge <= height(box) * 1.05 || shared >= Math.min(width(previous), width(box)) * 0.66) &&
          gap + edge < closest) {
        nearest = candidate;
        closest = gap + edge;
      }
    }
    if (nearest) {
      nearest.text += " " + text;
      nearest.box = bounds([nearest.box, box]);
      nearest.lastLine = box;
      nearest.confidence = Math.min(nearest.confidence, line.confidence);
    } else {
      labels.push({ box, lastLine: box, text, confidence: line.confidence });
    }
  }
  return labels;
}

type Reading = { text: string; confidence: number };
type ReadLine = (image: HTMLCanvasElement, whitelist?: string, singleWord?: boolean) => Promise<Reading>;

const quantity = /(?<![\d,.])(\d+(?:[,.]\d+)?)\s*(litros?|mililitros?|unidades?|kg|mg|ml|cm|mm|g|l|m)\b/gi;

export function normalizeQuantities(text: string) {
  return text
    .replace(/(\d)(cm|mm|m)\s*[x×]\s*(?=\d)/gi, "$1 $2 x ")
    .replace(quantity, "$1 $2")
    .replace(/(\b(?:mm|cm|m))\s*[x×]\s*(?=\d)/gi, "$1 x ")
    .replace(/(\b(?:kg|g|ml|l))\s*\/\s*(?=\d)/gi, "$1 / ");
}

const captionInk = (r: number, g: number, b: number) => r > 100 && r - g > 40 && g < 175 && r - b > 45;

function enlargedCrop(source: HTMLCanvasElement, box: Box, scale: number, highContrast = false) {
  const w = width(box);
  const h = height(box);
  const { image, context } = canvas(w * scale + 32, h * scale + 32);
  context.imageSmoothingQuality = "high";
  if (highContrast) {
    const pixels = source.getContext("2d")!.getImageData(box.x0, box.y0, w, h);
    context.drawImage(monochrome(pixels, captionInk), 16, 16, w * scale, h * scale);
  } else {
    context.drawImage(source, box.x0, box.y0, w, h, 16, 16, w * scale, h * scale);
  }
  return image;
}

function captionLines(image: HTMLCanvasElement, box: Box) {
  const { data, width: w, height: h } = image.getContext("2d")!.getImageData(box.x0, box.y0, width(box), height(box));
  const lines: Box[] = [];
  let start = -1;
  let left = w;
  let right = 0;
  for (let y = 0; y <= h; y++) {
    let count = 0;
    for (let x = 0; y < h && x < w; x++) {
      const p = (y * w + x) * 4;
      if (captionInk(data[p], data[p + 1], data[p + 2])) {
        count++;
        left = Math.min(left, x);
        right = Math.max(right, x + 1);
      }
    }
    if (count > w * 0.025) {
      if (start === -1) start = y;
    } else {
      if (start !== -1 && y - start >= 4) {
        lines.push({
          x0: box.x0 + Math.max(0, left - 2), x1: box.x0 + Math.min(w, right + 2),
          y0: box.y0 + start, y1: box.y0 + y,
        });
      }
      start = -1;
      left = w;
      right = 0;
    }
  }
  return lines;
}

async function secondUnitDiscount(image: HTMLCanvasElement, tag: Tag, badges: Box[], readLine: ReadLine) {
  const candidates = badges.filter(box => {
    const gap = tag.box.y0 - box.y1;
    return gap >= 0 && gap <= height(tag.box) * 1.4 && overlap(tag.box, box) >= -width(box) * 0.95;
  }).sort((a, b) => (tag.box.y0 - a.y1 - Math.min(0, overlap(tag.box, a))) -
    (tag.box.y0 - b.y1 - Math.min(0, overlap(tag.box, b))));
  const badge = candidates[0];
  if (!badge) return null;
  const lines = captionLines(image, badge);
  const main = lines.reduce<Box | undefined>((tallest, line) => !tallest || height(line) > height(tallest) ? line : tallest, undefined);
  if (!main || height(main) < height(badge) * 0.25) return null;
  const headline = await readLine(enlargedCrop(image, main, 4), "0123456789%", true);
  const percent = /^(\d{1,2})\s*%?$/.exec(headline.text.trim());
  if (!percent || Number(percent[1]) === 0) return null;

  const terms = [];
  for (const line of lines.filter(box => box.y0 >= main.y1)) {
    const crop = {
      ...line, y0: Math.max(badge.y0, line.y0 - 1), y1: Math.min(badge.y1, line.y1 + 1),
    };
    const original = await readLine(enlargedCrop(image, crop, 7));
    const contrast = await readLine(enlargedCrop(image, crop, 7, true));
    const alternate = await readLine(enlargedCrop(image, { ...crop, x0: badge.x0, x1: badge.x1 }, 4));
    terms.push([original, contrast, alternate].map(option =>
      option.text.normalize("NFD").replace(/\p{M}/gu, "").toUpperCase().trim()));
  }
  const copy = terms.flat().join(" ");
  const second = /(?:\b2\s*[ªº°OA.?]?|\bSEGUNDA)\s+UNIDA\s*[DO]E\b/.test(copy);
  const lowest = /MENOR\s+VALOR/.test(copy);
  const possibleLowest = /\bME[NM][OD0]\p{L}{1,2}\s*VA[L1I]O[RQ]\b/u.test(copy);
  const unitMention = /(?:NA\s*\S{0,4}\s*UNIDA\s*[DO]E|SEGUNDA\s+UNIDADE)\b/.test(copy);
  const uncertain = !second || !/%/.test(headline.text) || headline.confidence < 75 ||
    terms.some(term => term.every(value => !value)) || possibleLowest !== lowest ||
    (/PRODUTO|MENOR|VALOR/.test(copy) && !lowest);
  return {
    percent: Number(percent[1]), second, lowest: lowest || possibleLowest, unitMention, uncertain,
    hasOtherTerms: terms.length > 2,
  };
}

function sidePrice(base: Tag, other: Tag) {
  const gap = other.box.x0 - base.box.x1;
  const h = height(other.box);
  const edge = Math.min(Math.abs(other.box.y0 - base.box.y0), Math.abs(other.box.y1 - base.box.y1));
  return gap >= 0 && gap <= h * 0.2 && edge <= h * 0.13 && other.whole.y0 >= h * 0.28;
}

async function recoverQuantity(image: HTMLCanvasElement, label: Label, tag: Tag, readLine: ReadLine) {
  const notes: string[] = [];
  let product = normalizeQuantities(label.text);
  const typo = /\b(\d+)\s*(?:[i1]itro|itro)\b/i.exec(product);
  if (typo) {
    product = product.replace(typo[0], typo[1] + " litro");
    notes.push("Confira a medida do produto.");
  }
  const last = label.lastLine;
  const gap = tag.box.y0 - last.y1;
  if (gap >= height(last) * 0.55 && gap <= height(last) * 1.85 && Math.abs(label.box.x0 - tag.box.x0) <= height(last)) {
    const box = {
      x0: Math.max(0, label.box.x0 - 2),
      y0: last.y1,
      x1: Math.min(image.width, Math.max(label.box.x1, tag.box.x1) + Math.round(height(last) * 1.4)),
      y1: tag.box.y0,
    };
    const reading = await readLine(enlargedCrop(image, box, 4));
    const line = normalizeQuantities(reading.text.trim());
    if (/^\d+(?:[.,]\d+)? (?:kg|g|mg|ml|l|litros?|cm|mm)(?:\s*(?:\/|ou|x)\s*\d+(?:[.,]\d+)? (?:kg|g|mg|ml|l|litros?|cm|mm))*$/i.test(line)) {
      product += " " + line;
      if (reading.confidence < 75) notes.push("Confira o peso ou a medida lida.");
    } else {
      // A small lowercase g can be read as 9. The two separated values
      // next to the product label suggest variant weights that need review.
      const grams = /^(\d{2,3})\s+9\s*\/\s*(\d{2,3})\s*9g?$/i.exec(reading.text.trim());
      if (grams) {
        product += ` ${grams[1]} g / ${grams[2]} g`;
        notes.push("Confira os dois pesos sugeridos.");
      } else if (/\d+\s*(?:[g9]|kg|cm|ml|l)\b/i.test(line)) {
        notes.push("A leitura encontrou uma possível medida. Compare com a foto.");
      }
    }
  }
  if (label.confidence < 55 && notes.length === 0) notes.push("Confira o nome e a apresentação do produto.");
  return { product, notes };
}

export async function spatialOffers(
  image: HTMLCanvasElement,
  textLines: TextLine[],
  prices: Map<Tag, string>,
  markers: Awaited<ReturnType<typeof promotionalTags>>,
  layout: NonNullable<ReturnType<typeof priceSheet>>,
  readLine: ReadLine,
): Promise<ImportedOffer[]> {
  const { tags, badges, sheet } = layout;
  const labels = productLabels(image, textLines);
  const grouped = new Map<Label, { tag: Tag; price: string }[]>();
  const pairs = new Map<Tag, Tag>();
  const conditional = new Set<Tag>();
  for (const base of tags) {
    if (!prices.has(base) || base.whole.y0 > height(base.box) * 0.24) continue;
    const sides = tags.filter(tag => sidePrice(base, tag));
    if (sides.length !== 1) continue;
    const [tag] = sides;
    pairs.set(base, tag);
    conditional.add(tag);
  }
  for (const [tag, price] of prices) {
    if (markers.previous.has(tag) || markers.unresolved.has(tag) || conditional.has(tag)) continue;
    let best: Label | undefined;
    let bestScore = Infinity;
    for (const label of labels) {
      const horizontal = Math.max(0, -overlap(tag.box, label.box));
      const vertical = Math.max(0, tag.box.y0 - label.box.y1);
      const maxVertical = markers.current.has(tag) ? 2.4 : 1.65;
      if (horizontal > height(tag.box) * 0.9 || vertical > height(tag.box) * maxVertical ||
          label.box.y0 > tag.box.y0 + height(tag.box) * 0.45) continue;
      const score = horizontal * 1.7 + vertical + Math.abs(tag.box.x0 - label.box.x0) * 0.15;
      if (score < bestScore) {
        best = label;
        bestScore = score;
      }
    }
    if (best) grouped.set(best, [...(grouped.get(best) ?? []), { tag, price }]);
  }

  const offers: ImportedOffer[] = [];
  for (const [label, amounts] of grouped) {
    const [selected] = amounts;
    const { product, notes } = await recoverQuantity(image, label, selected.tag, readLine);
    const ambiguousPrice = new Set(amounts.map(entry => entry.price)).size > 1;
    if (ambiguousPrice) notes.push("Há mais de um preço perto deste produto. Confira qual se aplica.");
    const extra = pairs.get(selected.tag);
    let conditions = "";
    if (extra && !ambiguousPrice) {
      const discount = await secondUnitDiscount(image, extra, badges, readLine);
      let effectivePrice = prices.get(extra);
      if (!effectivePrice && discount) {
        const y = tags.indexOf(extra) * priceRowHeight;
        const right = 42 + [extra.whole, extra.cents].reduce((sum, part) => sum + Math.round(width(part) * 42 / height(part)), 0);
        const crop = enlargedCrop(sheet, {
          x0: 4, x1: Math.min(sheet.width, right - 11), y0: y + 8, y1: y + priceRowHeight - 15,
        }, 4);
        const retry = await readLine(crop, "0123456789,.", true);
        const printed = /^(\d+)[,.]?(\d{2})$/.exec(retry.text.replace(/\s/g, ""));
        if (printed && retry.confidence >= 55 && printed[1].length + 2 === extra.digits) {
          effectivePrice = printed[1] + "," + printed[2];
        }
      }
      const regular = parsePrice(selected.price);
      const effective = parsePrice(effectivePrice ?? "");
      const matchesDiscount = discount && regular !== null && effective !== null &&
        Math.abs(effective - regular * (1 - discount.percent / 200)) <= 1;
      if (discount && (discount.second || (discount.unitMention && matchesDiscount))) {
        conditions = `${discount.percent}% de desconto na 2ª unidade${discount.lowest ? ", no produto de menor valor" : ""}.`;
        if (matchesDiscount) conditions += ` Nesta oferta, a unidade sai por R$ ${effectivePrice}.`;
        else notes.push("Confira o valor por unidade anunciado na oferta.");
        if (discount.uncertain) notes.push("Confira o desconto e as regras em letras pequenas no encarte.");
        if (discount.hasOtherTerms && !discount.lowest) notes.push("Confira se o desconto vale para o produto de menor valor.");
      } else {
        notes.push("Há um preço adicional na foto. Confira o desconto e as condições.");
      }
    }
    offers.push({
      produto: product.slice(0, 120),
      preco: ambiguousPrice ? "" : selected.price,
      unidade: "unidade",
      condicoes: conditions,
      reviewNotes: [...new Set(notes)],
    });
  }
  return offers;
}
