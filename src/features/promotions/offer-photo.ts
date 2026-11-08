const MAX_PHOTO_BYTES = 12 * 1024 * 1024;
export const OFFER_PHOTO_TYPES = "image/jpeg,image/png,image/webp";

export async function decodeOfferPhoto(file: File) {
  if (!OFFER_PHOTO_TYPES.split(",").includes(file.type) || file.size < 1 || file.size > MAX_PHOTO_BYTES) {
    throw new Error("Escolha uma foto JPG, PNG ou WebP de até 12 MB.");
  }
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error("Não foi possível abrir a imagem. Tente outra foto do encarte.");
  });
  if (bitmap.width * bitmap.height > 40_000_000) {
    bitmap.close();
    throw new Error("A imagem é muito grande. Use uma versão menor.");
  }
  return bitmap;
}
