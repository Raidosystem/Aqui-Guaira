import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, ChevronDown, User, Sun, Moon, Monitor, LogOut, Heart, Building2, ClipboardList, Store, Wrench, MapPin, FileText, ArrowUpRight } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/AuthContext';
import { logout } from '@/lib/supabase';
import { getBuscaCepUrl, getGeradorCurriculoUrl } from '@/lib/ferramentas';
import { cityShortcuts } from './navigation';
import { LoginDialog } from '@/components/LoginDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const navigation = [
  ['Início', '/'], ['Empresas', '/empresas'], ['Painel da Cidade', '/painel-cidade'],
  ['Marketplace', '/marketplace'], ['Meus Locais', '/meus-locais'],
];
const services = [
  ['Serviços', '/servicos-por-bairro'],
  ['Achados e Perdidos', '/achados-perdidos'], ['Farmácia de Plantão', '/farmacia-plantao'],
  ['Escolas e Creches', '/escolas-creches'], ['Sua Empresa', '/sua-empresa'],
  ['Sobre Guaíra', '/#sobre-guaira'],
];

export default function PortalHeader() {
  const { user, logout: clearUser } = useAuth();
  const { setTheme } = useTheme();
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [loginOpen, setLoginOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const openAuth = (tab: 'login' | 'register') => { setAuthTab(tab); setLoginOpen(true); };
  const handleLogout = () => { logout(); clearUser(); window.location.reload(); };

  return <>
    <header className="portal-header">
      <Link to="/" className="portal-brand" aria-label="Aqui Guaíra — início"><img src="/maquete/logo-aqui-guaira.png" alt="Aqui Guaíra" /></Link>
      <nav className="portal-nav" aria-label="Navegação principal">
        {navigation.map(([label, to]) => <NavLink key={to} to={to} end={to === '/'} className={({isActive}) => [to === '/empresas' ? 'portal-companies-link' : '', isActive ? 'active' : ''].filter(Boolean).join(' ')}>{to === '/empresas' && <Store size={16} aria-hidden="true"/>}{label}</NavLink>)}
        <DropdownMenu>
          <DropdownMenuTrigger className="portal-menu-trigger portal-tools-trigger"><Wrench size={15} aria-hidden="true"/>Ferramentas <ChevronDown size={13} aria-hidden="true"/></DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="portal-menu-content portal-tools-content">
            <DropdownMenuItem asChild><a href={getBuscaCepUrl()} target="_blank" rel="noreferrer"><MapPin size={19} aria-hidden="true"/><span><strong>Busca CEP</strong><small>Encontre CEPs e endereços</small></span><ArrowUpRight size={15} aria-hidden="true"/></a></DropdownMenuItem>
            <DropdownMenuItem asChild><a href={getGeradorCurriculoUrl()} target="_blank" rel="noreferrer"><FileText size={19} aria-hidden="true"/><span><strong>Currículo</strong><small>Monte seu currículo</small></span><ArrowUpRight size={15} aria-hidden="true"/></a></DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger className="portal-menu-trigger">Mais <ChevronDown size={13} /></DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="portal-menu-content">
            {services.map(([label, to]) => <DropdownMenuItem asChild key={to}><Link to={to}>{label}</Link></DropdownMenuItem>)}
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
      <div className="portal-header-actions">
        {user ? <DropdownMenu>
          <DropdownMenuTrigger className="portal-account" aria-label="Minha conta"><User size={16}/><span>{user.nome || 'Minha conta'}</span></DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="portal-menu-content">
            <div className="px-2 py-2 text-sm font-semibold">{user.nome || 'Minha conta'}</div>
            <DropdownMenuItem asChild><Link to="/meus-locais"><Heart className="mr-2 h-4 w-4"/>Meus Locais</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link to="/mural/meus-posts"><ClipboardList className="mr-2 h-4 w-4"/>Meus Posts</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link to="/dashboard"><Building2 className="mr-2 h-4 w-4"/>Minha Empresa</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleLogout}><LogOut className="mr-2 h-4 w-4"/>Sair</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> : <>
          <button className="portal-enter" onClick={() => openAuth('login')}>Entrar</button>
          <button className="portal-register" onClick={() => openAuth('register')}>Cadastrar</button>
        </>}
        <DropdownMenu>
          <DropdownMenuTrigger className="portal-theme" aria-label="Escolher tema"><Sun size={16}/></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setTheme('light')}><Sun className="mr-2 h-4 w-4"/>Claro</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setTheme('dark')}><Moon className="mr-2 h-4 w-4"/>Escuro</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setTheme('system')}><Monitor className="mr-2 h-4 w-4"/>Sistema</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild><button className="portal-mobile-toggle" aria-label="Abrir menu"><Menu size={21}/></button></SheetTrigger>
          <SheetContent className="overflow-y-auto">
            <SheetHeader><SheetTitle>Aqui Guaíra</SheetTitle></SheetHeader>
            <nav className="portal-mobile-nav" aria-label="Navegação móvel">
              {navigation.map(([label, to]) => <Link key={to} to={to} className={to === '/empresas' ? 'portal-mobile-companies' : undefined} onClick={() => setMenuOpen(false)}>{label}</Link>)}
              <div className="portal-mobile-tools"><h3><Wrench size={16} aria-hidden="true"/>Ferramentas</h3><a href={getBuscaCepUrl()} target="_blank" rel="noreferrer">Busca CEP <ArrowUpRight size={14} aria-hidden="true"/></a><a href={getGeradorCurriculoUrl()} target="_blank" rel="noreferrer">Currículo <ArrowUpRight size={14} aria-hidden="true"/></a></div>
              <div className="portal-mobile-section-title">Acessos da cidade</div>
              {cityShortcuts.map(({name, to}) => <Link key={to} to={to} onClick={() => setMenuOpen(false)}>{name}</Link>)}
              <div className="portal-mobile-section-title">Mais da cidade</div>
              {services.map(([label, to]) => <Link key={to} to={to} onClick={() => setMenuOpen(false)}>{label}</Link>)}
              {!user && <button onClick={() => {setMenuOpen(false); openAuth('register');}}>Criar conta</button>}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
    <LoginDialog key={authTab} open={loginOpen} onOpenChange={setLoginOpen} initialTab={authTab}/>
  </>;
}
