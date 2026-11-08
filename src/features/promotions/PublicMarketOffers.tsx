import { useEffect, useState } from "react";
import { Content as DialogContent } from "@radix-ui/react-dialog";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogClose, DialogDescription, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { listPublicMarketPromotions, loadPublicMarketFlyer, MARKET_PROMOTIONS_PER_PAGE, type PublicMarketPromotion } from "./offer-api";
import { formatOfferDate, formatOfferPrice } from "./offer-fields";
import { useCityToday } from "./use-city-today";
import PromotionPhotoViewer from "./PromotionPhotoViewer";

const extensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function PublicMarketFlyerPreview({ companyId, promotionId, fullscreen = false }: {
  companyId: string;
  promotionId: string;
  fullscreen?: boolean;
}) {
  const [photoUrl, setPhotoUrl] = useState("");
  const photo = useQuery({
    queryKey: ["public-market-flyer-preview", companyId, promotionId],
    queryFn: ({ signal }) => loadPublicMarketFlyer(companyId, promotionId, signal),
    retry: false,
    gcTime: 0,
    staleTime: 60000,
  });

  useEffect(() => {
    if (!photo.data) return;
    const url = URL.createObjectURL(photo.data);
    setPhotoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photo.data]);

  if (photo.isError) {
    return (
      <div className="space-y-2">
        <p role="alert" className="text-sm">Não foi possível abrir o panfleto.</p>
        <Button type="button" variant="outline" size="sm" onClick={() => void photo.refetch()}>Tentar novamente</Button>
      </div>
    );
  }
  if (photo.isSuccess && !photo.data) return <p role="status" className="text-sm">Este panfleto não está mais disponível.</p>;
  if (!photoUrl) return <p role="status" className="text-sm">Carregando panfleto…</p>;

  return <PromotionPhotoViewer photoUrl={photoUrl} sticky={false} fullscreen={fullscreen} />;
}

export default function PublicMarketOffers({ companyId }: { companyId: string }) {
  const isMobile = useIsMobile();
  const today = useCityToday();
  const [downloading, setDownloading] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const query = useInfiniteQuery({
    queryKey: ["public-market-promotions", companyId, today],
    queryFn: ({ pageParam, signal }) => listPublicMarketPromotions(companyId, pageParam, signal),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _pages, offset) => lastPage.length > MARKET_PROMOTIONS_PER_PAGE
      ? offset + MARKET_PROMOTIONS_PER_PAGE : undefined,
    retry: false,
    refetchInterval: 60000,
  });
  const promotions = query.data?.pages
    .flatMap(page => page.slice(0, MARKET_PROMOTIONS_PER_PAGE))
    .filter(promotion => promotion.validade >= today) ?? [];

  async function download(promotion: PublicMarketPromotion) {
    if (downloading) return;
    setDownloading(promotion.id);
    try {
      const photo = await loadPublicMarketFlyer(companyId, promotion.id);
      if (!photo) {
        toast.error("Este panfleto não está mais disponível.");
        void query.refetch();
        return;
      }
      const url = URL.createObjectURL(photo);
      const link = document.createElement("a");
      link.href = url;
      link.download = `panfleto-${promotion.validade}-${promotion.id.slice(0, 8)}.${extensions[photo.type]}`;
      document.body.append(link);
      try {
        link.click();
      } finally {
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch {
      toast.error("Não foi possível baixar o panfleto. Tente novamente.");
    } finally {
      setDownloading(null);
    }
  }

  if (!promotions.length) return null;

  return (
    <Card className="max-w-4xl rounded-3xl">
      <CardHeader>
        <h2 className="text-2xl font-semibold tracking-tight">Ofertas vigentes</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="divide-y">
          {promotions.map(promotion => {
            const previewOpen = promotion.tem_encarte && previewId === promotion.id;
            const previewRegion = `market-flyer-preview-${promotion.id}`;
            const downloadButton = (
              <Button type="button" variant="outline" disabled={downloading !== null}
                onClick={() => void download(promotion)} aria-label={`Baixar panfleto: ${promotion.titulo}`}>
                <Download aria-hidden="true" />
                {downloading === promotion.id ? "Baixando…" : "Baixar panfleto"}
              </Button>
            );
            const previewLabel = !isMobile && previewOpen ? "Fechar panfleto" : "Ver panfleto";
            const previewButton = (
              <Button type="button" variant="outline" aria-expanded={isMobile ? undefined : previewOpen}
                aria-controls={!isMobile && previewOpen ? previewRegion : undefined}
                aria-label={`${previewLabel}: ${promotion.titulo}`}
                onClick={isMobile ? undefined : () => setPreviewId(previewOpen ? null : promotion.id)}>
                <Eye aria-hidden="true" />
                {previewLabel}
              </Button>
            );

            return (
              <li key={promotion.id} className="space-y-3 py-5 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="min-w-0 break-words font-semibold">{promotion.titulo}</h3>
                  {promotion.tem_encarte && (
                    <div className="flex flex-wrap gap-2">
                      {isMobile ? (
                        <Dialog open={previewOpen} onOpenChange={open => setPreviewId(open ? promotion.id : null)}>
                          <DialogTrigger asChild>{previewButton}</DialogTrigger>
                          <DialogPortal>
                            <DialogOverlay />
                            <DialogContent className="fixed inset-x-0 top-0 z-[9999] flex h-[100dvh] flex-col gap-2 overflow-hidden bg-background p-3">
                              <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
                                <DialogTitle className="min-w-0 flex-1 break-words">{promotion.titulo}</DialogTitle>
                                <DialogClose asChild>
                                  <Button type="button" variant="outline" className="h-11">Fechar</Button>
                                </DialogClose>
                              </div>
                              <DialogDescription className="sr-only">Amplie a foto com dois dedos ou com os botões de zoom.</DialogDescription>
                              <PublicMarketFlyerPreview companyId={companyId} promotionId={promotion.id} fullscreen />
                              <div className="shrink-0">{downloadButton}</div>
                            </DialogContent>
                          </DialogPortal>
                        </Dialog>
                      ) : previewButton}
                      {downloadButton}
                    </div>
                  )}
                </div>
                {!isMobile && previewOpen && (
                  <div id={previewRegion}>
                    <PublicMarketFlyerPreview companyId={companyId} promotionId={promotion.id} />
                  </div>
                )}
                <ul className="grid gap-3 sm:grid-cols-2">
                  {promotion.itens.map((item, index) => (
                    <li key={index} className="min-w-0 space-y-1 rounded-xl border bg-background/50 p-3">
                      <p className="break-words font-medium">{item.produto}</p>
                      <p className="font-semibold text-primary">
                        {formatOfferPrice(item.preco_centavos)}
                        <span className="ml-2 text-sm font-normal text-muted-foreground">/ {item.unidade}</span>
                      </p>
                      {item.condicoes && <p className="break-words text-sm">{item.condicoes}</p>}
                      <p className="text-sm text-muted-foreground">Válida até {formatOfferDate(promotion.validade)}</p>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
        {query.hasNextPage && (
          <Button type="button" variant="outline" disabled={query.isFetching}
            onClick={() => void query.fetchNextPage()}>
            {query.isFetchingNextPage ? "Carregando ofertas…" : "Carregar mais ofertas"}
          </Button>
        )}
        {query.isFetchNextPageError && <p role="alert" className="text-sm">Não foi possível carregar mais ofertas.</p>}
      </CardContent>
    </Card>
  );
}
