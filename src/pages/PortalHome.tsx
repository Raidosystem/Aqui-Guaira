import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Store, Newspaper, Heart, ArrowRight, User, ArrowUpRight, Building2, Image as ImageIcon, Loader2 } from 'lucide-react';
import Header from '@/components/portal/PortalHeader';
import { cityShortcuts } from '@/components/portal/navigation';
import CityMap from '@/components/portal/CityMap';
import FeaturedPartners from '@/components/portal/FeaturedPartners';
import CityOverviewCard from '@/components/CityOverviewCard';
import { LoginDialog } from '@/components/LoginDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { BAIRROS_GUAIRA } from '@/data/bairros';
import { loadPortalCompanies, loadPortalListings, loadPortalPosts, type PortalListing } from '@/lib/portal';
import '@/styles/maquette-home.css';

const A = '/maquete/';
const pictures = { lake: A+'lago-maraca.jpg' };

function DataState({ loading, error, empty, retry, children }: {
  loading: boolean; error: boolean; empty: string | false; retry: () => void; children: ReactNode;
}) {
  if (loading) return <div className="portal-data-state" role="status"><Loader2 className="animate-spin" size={22}/><p>Carregando...</p></div>;
  if (error) return <div className="portal-data-state" role="alert"><p>Não foi possível carregar agora.</p><button onClick={retry}>Tentar novamente</button></div>;
  if (empty) return <div className="portal-data-state" role="status"><p>{empty}</p></div>;
  return <>{children}</>;
}

function ListingImage({ listing }: { listing: PortalListing }) {
  return listing.images?.[0] ? <img src={listing.images[0]} alt={listing.title} loading="lazy"/> : <div className="portal-no-photo"><ImageIcon size={24}/><span>Sem foto</span></div>;
}

const priceLabel = (price: number | null) => price == null ? 'Consulte o anunciante' : Number(price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function PortalHome() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [listingCategory, setListingCategory] = useState('Todos');
  const [sort, setSort] = useState('recent');
  const [detail, setDetail] = useState<PortalListing | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const companies = useQuery({ queryKey: ['portal-companies'], queryFn: ({signal}) => loadPortalCompanies(signal), staleTime: 60000, retry: 1 });
  const listings = useQuery({ queryKey: ['portal-listings'], queryFn: ({signal}) => loadPortalListings(signal), staleTime: 60000, retry: 1 });
  const posts = useQuery({ queryKey: ['portal-posts'], queryFn: ({signal}) => loadPortalPosts(signal), staleTime: 60000, retry: 1 });
  const selected = companies.data?.find(company => company.id === selectedId) ?? companies.data?.[0];
  const marketCategories = ['Todos', ...new Set(listings.data?.map(listing => listing.category).filter(Boolean) ?? [])];
  const products = useMemo(() => {
    const result = (listings.data ?? []).filter(listing => listingCategory === 'Todos' || listing.category === listingCategory);
    if (sort !== 'recent') result.sort((a,b) => a.price == null ? (b.price == null ? 0 : 1) : b.price == null ? -1 : sort === 'low' ? a.price-b.price : b.price-a.price);
    return result;
  }, [listings.data, listingCategory, sort]);

  useEffect(() => {
    if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
  }, [location.hash]);

  const openAuth = (tab: 'login' | 'register') => { setAuthTab(tab); setLoginOpen(true); };
  const searchCompanies = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (neighborhood) params.set('bairro', neighborhood);
    navigate('/empresas' + (params.size ? '?'+params.toString() : ''));
  };

  return <div className="portal-home" id="top">
    <div className="photo-backdrop"/>
    <div className="site-inner">
      <Header/>
      <div className="page-grid">
        <main className="left-col">
          <section className="hero">
            <div className="eyebrow">BEM-VINDO A GUAÍRA · SP</div>
            <h1>Tudo de <em>Guaíra</em><br/>em um só lugar.</h1>
            <p>Empresas, serviços, produtos, eventos, notícias e muito mais.<br/>Conectando você com o que é da nossa cidade.</p>
            <form className="searchbar" onSubmit={searchCompanies}>
              <Search size={20}/>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="O que você está procurando?" aria-label="Buscar empresas"/>
              <label className="location"><MapPin size={17}/><select aria-label="Bairro" value={neighborhood} onChange={e => setNeighborhood(e.target.value)}><option value="">Em toda a cidade</option>{BAIRROS_GUAIRA.map(bairro => <option key={bairro}>{bairro}</option>)}</select></label>
              <button className="search-submit" aria-label="Pesquisar"><Search size={20}/></button>
            </form>
            <nav className="shortcut-grid" aria-label="Acessos da cidade">{cityShortcuts.map(({name,text,to,icon:Icon}) => <Link to={to} key={to}><Icon size={27} strokeWidth={1.2} aria-hidden="true"/><strong>{name}</strong><span>{text}</span></Link>)}</nav>
          </section>
          <div className="feature-row">
            <FeaturedPartners/>
          </div>
          <div className="bottom-grid">
            <section className="panel nearby" aria-labelledby="companies-title">
              <div className="section-heading"><h2 id="companies-title">Empresas da cidade</h2><Link to="/empresas">Ver todas <ArrowRight size={13}/></Link></div>
              <div className="nearby-content">
                <div className="places-list"><div className="mini-tabs"><span>Explore Guaíra</span></div><DataState loading={companies.isPending} error={companies.isError} empty={!companies.data?.length && 'Nenhuma empresa disponível.'} retry={() => companies.refetch()}><div className="places-scroll">{companies.data?.map(company => <button key={company.id} className={'place '+(selected?.id === company.id ? 'chosen' : '')} onClick={() => setSelectedId(company.id)}><span className="company-photo">{company.logo || company.imagens?.[0] ? <img src={company.logo || company.imagens?.[0]} alt=""/> : <Building2 size={22}/>}</span><span><strong>{company.nome}</strong><small>{company.categorias?.nome}</small><small>{company.bairro || 'Guaíra · SP'}</small></span><ArrowRight size={14}/></button>)}</div></DataState></div>
                <div className="map-area"><CityMap companies={companies.data ?? []} selectedId={selected?.id ?? null} onSelect={setSelectedId}/>{selected && <Link className="map-detail" to={'/perfil-de-empresa?id='+encodeURIComponent(selected.id)}>Ver {selected.nome}<ArrowRight size={12}/></Link>}</div>
              </div>
            </section>
            <section className="panel events" aria-labelledby="mural-title"><div className="section-heading"><div><h2 id="mural-title">Mural da cidade</h2><p>O que a comunidade está compartilhando.</p></div></div><DataState loading={posts.isPending} error={posts.isError} empty={!posts.data?.length && 'Ainda não há publicações.'} retry={() => posts.refetch()}><div className="event-list">{posts.data?.map(post => <Link className="event" to="/mural" key={post.id}>{post.imagens?.[0] ? <img src={post.imagens[0]} alt="" loading="lazy"/> : <Newspaper size={26}/>}<span><strong>{post.conteudo}</strong><small>{new Date(post.data_criacao).toLocaleDateString('pt-BR')}</small></span><ArrowRight size={14}/></Link>)}</div></DataState><Link className="text-link" to="/mural">Abrir mural <ArrowRight size={14}/></Link></section>
          </div>
          <section className="profile-preview"><nav className="profile-sidebar" aria-label="Seu espaço"><img src={A+'logo-aqui-guaira.png'} alt="Aqui Guaíra"/><Link to="/meus-locais">Meus Locais</Link><Link to="/mural/meus-posts">Meus Posts</Link><Link to="/sua-empresa">Sua Empresa</Link></nav><div className="profile-card"><div className="avatar"><User size={30}/></div><div><strong>{user?.nome ? `Olá, ${user.nome}` : 'Seu espaço em Guaíra'}</strong><small>Guarde seus lugares e participe da comunidade.</small>{user ? <Link to="/meus-locais">Acessar favoritos <ArrowRight size={12}/></Link> : <button onClick={() => openAuth('login')}>Acessar minha conta <ArrowRight size={12}/></button>}</div></div></section>
        </main>
        <aside className="right-col">
          <section className="market-panel panel" aria-labelledby="market-title"><div className="market-head"><div><h2 id="market-title">Marketplace</h2><p>Compre de quem é da nossa cidade.</p></div><Link to="/marketplace" aria-label="Abrir marketplace"><ArrowUpRight size={18}/></Link></div>
            <div className="market-controls"><div className="market-tabs">{marketCategories.map(category => <button key={category} className={listingCategory === category ? 'selected' : ''} onClick={() => setListingCategory(category)}>{category}</button>)}</div><label className="sort-label"><select aria-label="Ordenar anúncios" value={sort} onChange={e => setSort(e.target.value)}><option value="recent">Mais recentes</option><option value="low">Menor preço</option><option value="high">Maior preço</option></select></label></div>
            <DataState loading={listings.isPending} error={listings.isError} empty={!products.length && 'Ainda não há anúncios nesta seleção.'} retry={() => listings.refetch()}><div className="product-grid">{products.map(listing => <button className="product" key={listing.id} onClick={() => setDetail(listing)}><div className="product-image"><ListingImage listing={listing}/></div><div className="product-info"><strong>{listing.title}</strong><b>{priceLabel(listing.price)}</b><small>{listing.category}</small><small><MapPin size={11}/>{listing.city || 'Local não informado'}{listing.state ? ' · '+listing.state : ''}</small></div></button>)}</div></DataState>
            {!listings.isPending && !listings.isError && !products.length && <img className="market-empty-photo" src={pictures.lake} alt="Lago Maracá, em Guaíra"/>}
            <Link to="/marketplace" className="text-link market-link">Explorar marketplace <ArrowRight size={14}/></Link>
          </section>
          <div className="side-bottom">
            <a href="#sobre-guaira" className="city-story sidebar-city-story"><img src={pictures.lake} alt="Lago Maracá"/><span className="story-content"><strong><em>Guaíra</em><br/>é a nossa casa</strong><small>Conheça nossa história, nossa gente e tudo o que torna Guaíra única.</small><span>Saiba mais <ArrowRight size={14}/></span></span></a>
            <section className="login-panel"><img className="login-logo" src={A+'logo-aqui-guaira.png'} alt="Aqui Guaíra"/><h2>{user ? 'Sua comunidade, por perto' : 'Entre na sua conta'}</h2><p>Favorite empresas, acompanhe suas publicações e faça parte da cidade.</p><div className="account-benefits"><span><Heart size={16}/>Seus locais favoritos</span><span><Newspaper size={16}/>Suas publicações</span><span><Store size={16}/>Seu negócio na cidade</span></div>{user ? <Link className="gold-btn login-submit" to="/meus-locais">Meus Locais</Link> : <><button className="gold-btn login-submit" onClick={() => openAuth('login')}>Entrar</button><p className="signup">Não tem uma conta?<br/><button onClick={() => openAuth('register')}>Cadastre-se</button></p></>}</section>
          </div>
        </aside>
      </div>
      <div className="portal-city-story"><CityOverviewCard/></div>
      <footer className="portal-footer">
        <div className="footer-brand"><img src={A+'logo-aqui-guaira.png'} alt="Aqui Guaíra"/><p>Conectando você com<br/>o que é da nossa cidade.</p></div>
        <section className="footer-emergencies" aria-labelledby="footer-emergencies-title">
          <h2 id="footer-emergencies-title">Emergências</h2>
          <div className="footer-emergency-grid">
            <div><h3>Guarda Civil Municipal</h3><ul><li>199</li><li>3331 2273</li><li>3331 6064</li></ul></div>
            <div><h3>Polícia Civil</h3><ul><li>3331 2360</li><li>3331 2500</li></ul></div>
            <div><h3>Polícia Militar</h3><ul><li>190</li><li>3331 3881</li><li>3332 4362</li></ul></div>
          </div>
        </section>
        <nav className="footer-portal" aria-labelledby="footer-portal-title">
          <h2 id="footer-portal-title">Portal</h2>
          <ul><li><Link to="/servicos-por-bairro#">Termos de Uso</Link></li><li><Link to="/servicos-por-bairro#">Política de Privacidade</Link></li><li><Link to="/servicos-por-bairro#">Contato</Link></li></ul>
        </nav>
        <div className="footer-join"><h2>Faça parte</h2><p>Seu negócio também<br/>tem lugar aqui.</p><Link className="footer-cta" to="/sua-empresa">Cadastre sua empresa <ArrowRight size={14}/></Link></div>
        <div className="footer-bottom">© {new Date().getFullYear()} Aqui Guaíra · Portal comunitário · Fotos: Turismo do Município de Guaíra (SP)</div>
      </footer>
    </div>
    <LoginDialog key={authTab} open={loginOpen} onOpenChange={setLoginOpen} initialTab={authTab}/>
    <Dialog open={!!detail} onOpenChange={open => { if (!open) setDetail(null); }}><DialogContent>{detail && <><DialogHeader><DialogTitle>{detail.title}</DialogTitle><DialogDescription>{[detail.category, detail.city, detail.state].filter(Boolean).join(' · ')}</DialogDescription></DialogHeader><div className="portal-listing-detail"><ListingImage listing={detail}/><strong>{priceLabel(detail.price)}</strong></div><Link to="/marketplace">Ver marketplace <ArrowRight className="inline" size={14}/></Link></>}</DialogContent></Dialog>
  </div>;
}
