import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Handshake, Pause, Play } from 'lucide-react';

const partners = [
  { name: 'ACIG', headline: 'Juntos pelo comércio local.', description: 'Quem empreende fortalece Guaíra.', logo: '/partners/acig.png', website: 'https://www.acigguaira.com.br/home', style: 'acig', action: 'Conheça a ACIG' },
  { name: 'All Import', headline: 'Seu aparelho em boas mãos.', description: 'Celulares, notebooks e consoles.', logo: '/partners/allimport.png', website: 'https://www.assistenciaallimport.com.br/#servicos', style: 'allimport', action: 'Conheça os serviços' },
  { name: 'Grupo RaVal', headline: 'Sua marca. Novas possibilidades.', description: 'Tecnologia, design e personalização.', logo: '/partners/grupo-raval.png?v=1', website: 'https://www.gruporaval.com.br/', style: 'raval', action: 'Conheça o Grupo RaVal' },
];

export default function FeaturedPartners() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => setActive(index => (index + 1) % partners.length), 5000);
    return () => window.clearInterval(timer);
  }, [paused]);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const respectPreference = (event: MediaQueryListEvent) => { if (event.matches) setPaused(true); };
    preference.addEventListener('change', respectPreference);
    return () => preference.removeEventListener('change', respectPreference);
  }, []);

  const selectPartner = (index: number) => {
    setActive((index + partners.length) % partners.length);
    setPaused(true);
  };

  return <section className="panel highlights featured-partners" aria-labelledby="featured-partners-title" aria-roledescription="carrossel" onFocusCapture={event => { if (!(event.target instanceof Element && event.target.closest('[data-rotation-toggle]'))) setPaused(true); }}>
    <div className="section-heading"><h2 id="featured-partners-title">Empresas em destaque</h2><Link to="/empresas">Ver todas <ArrowRight size={14}/></Link></div>
    <div className="partner-slides" aria-live={paused ? 'polite' : 'off'} aria-atomic="true">
      {partners.map((partner, index) => <div className={`partner-slide partner-slide--${partner.style}`} key={partner.name} hidden={index !== active} role="group" aria-roledescription="slide" aria-label={`${index + 1} de ${partners.length}: ${partner.name}`}>
        <div className="partner-logo"><img src={partner.logo} alt={`Logo ${partner.name}`} width="200" height="160"/>{partner.style === 'acig' && <span className="partner-acig-name">ACIG</span>}</div>
        <div className="partner-copy"><span className="partner-badge"><Handshake size={13} aria-hidden="true"/>Parceira do Aqui Guaíra</span><h3>{partner.headline}</h3><p>{partner.description}</p><a href={partner.website} target="_blank" rel="noopener noreferrer" aria-label={`Conhecer ${partner.name} (abre em nova aba)`}>{partner.action}<ArrowUpRight size={14} aria-hidden="true"/></a></div>
      </div>)}
    </div>
    <div className="partner-controls">
      <div className="partner-tabs" aria-label="Selecionar empresa">{partners.map((partner, index) => <button type="button" key={partner.name} aria-label={`Mostrar ${partner.name}`} aria-current={index === active ? 'true' : undefined} onClick={() => selectPartner(index)}>{partner.name}</button>)}</div>
      <div className="partner-arrows"><span className="partner-count" aria-hidden="true">{active + 1} / {partners.length}</span><button type="button" aria-label="Empresa anterior" onClick={() => selectPartner(active - 1)}><ChevronLeft size={16}/></button><button type="button" data-rotation-toggle aria-label={paused ? 'Iniciar alternância automática' : 'Pausar alternância automática'} onClick={() => setPaused(value => !value)}>{paused ? <Play size={13}/> : <Pause size={13}/>}</button><button type="button" aria-label="Próxima empresa" onClick={() => selectPartner(active + 1)}><ChevronRight size={16}/></button></div>
    </div>
  </section>;
}
