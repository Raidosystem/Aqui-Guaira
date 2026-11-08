import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, ShoppingBasket, Store } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatOfferDate, formatOfferPrice, OFFERS_PER_PAGE } from "@/features/promotions/offer-fields";
import { useCityToday } from "@/features/promotions/use-city-today";
import { searchPublicOffers } from "@/features/promotions/offer-api";

export default function Ofertas() {
  const today = useCityToday();
  const [product, setProduct] = useState("");
  const [market, setMarket] = useState("");
  const [search, setSearch] = useState({ product: "", market: "", page: 0 });
  const query = useQuery({
    queryKey: ["public-market-offers", today, search],
    queryFn: () => searchPublicOffers(search.product, search.market, search.page * OFFERS_PER_PAGE),
    retry: false,
    refetchInterval: 60000,
  });

  const validOffers = query.data?.filter(offer => offer.validade >= today) ?? [];

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearch({ product: product.trim(), market: market.trim(), page: 0 });
  }

  function clear() {
    setProduct("");
    setMarket("");
    setSearch({ product: "", market: "", page: 0 });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="container mx-auto flex-1 px-4 py-10 sm:py-14">
        <div className="mb-8 max-w-3xl space-y-3">
          <p className="flex items-center gap-2 font-semibold text-primary">
            <ShoppingBasket aria-hidden="true" className="h-5 w-5" /> Compras em Guaíra
          </p>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Ofertas dos mercados</h1>
          <p className="text-muted-foreground">Encontre promoções vigentes por produto ou pelo nome do mercado.</p>
          <Button variant="outline" asChild><a href="/painel-promocoes">Acesso do mercado</a></Button>
        </div>

        <form onSubmit={submit} className="mb-8 grid gap-4 rounded-2xl border bg-card p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:p-6">
          <div className="space-y-2">
            <Label htmlFor="offer-product">Produto</Label>
            <Input id="offer-product" type="search" value={product} maxLength={100}
              onChange={event => setProduct(event.target.value)} placeholder="Ex.: arroz" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="offer-market">Mercado</Label>
            <Input id="offer-market" type="search" value={market} maxLength={100}
              onChange={event => setMarket(event.target.value)} placeholder="Nome do mercado" />
          </div>
          <div className="flex gap-2">
            <Button type="submit"><Search aria-hidden="true" />Buscar</Button>
            {(product || market || search.product || search.market) &&
              <Button type="button" variant="outline" onClick={clear}>Limpar</Button>}
          </div>
        </form>

        {query.isPending && <p role="status">Carregando ofertas…</p>}
        {query.isError && (
          <div className="space-y-3 rounded-2xl border p-6">
            <p role="alert">Não foi possível carregar as ofertas agora.</p>
            <Button variant="outline" onClick={() => void query.refetch()}>Tentar novamente</Button>
          </div>
        )}
        {query.isSuccess && (
          <>
            <p className="mb-4 text-sm text-muted-foreground" role="status">
              {validOffers.length ? `Página ${search.page + 1} de ofertas` :
                "Nenhuma oferta vigente encontrada para esta busca."}
            </p>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {validOffers.slice(0, OFFERS_PER_PAGE).map(offer => (
                <li key={`${offer.promocao_id}-${offer.ordem}`}>
                  <Card className="h-full rounded-2xl">
                    <CardContent className="space-y-3 p-5">
                      <p className="flex items-center gap-2 text-sm font-medium text-primary">
                        <Store aria-hidden="true" className="h-4 w-4 shrink-0" />{offer.mercado}
                      </p>
                      <h2 className="break-words text-xl font-bold">{offer.produto}</h2>
                      <p className="text-2xl font-bold text-primary">
                        {formatOfferPrice(offer.preco_centavos)}
                        <span className="ml-2 text-sm font-normal text-muted-foreground">/ {offer.unidade}</span>
                      </p>
                      {offer.condicoes && <p className="break-words text-sm">{offer.condicoes}</p>}
                      <p className="text-sm text-muted-foreground">Válida até {formatOfferDate(offer.validade)}</p>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/perfil-de-empresa?id=${offer.empresa_id}`}>Ver página do mercado</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
            {(search.page > 0 || validOffers.length > OFFERS_PER_PAGE) && (
              <nav className="mt-6 flex gap-3" aria-label="Páginas de ofertas">
                <Button variant="outline" disabled={search.page === 0}
                  onClick={() => setSearch(current => ({ ...current, page: current.page - 1 }))}>Anterior</Button>
                <Button variant="outline" disabled={validOffers.length <= OFFERS_PER_PAGE}
                  onClick={() => setSearch(current => ({ ...current, page: current.page + 1 }))}>Próxima</Button>
              </nav>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
