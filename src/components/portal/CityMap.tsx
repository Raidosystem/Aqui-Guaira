import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import type { PortalCompany } from '@/lib/portal';

const pin = L.icon({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] });

export default function CityMap({ companies, selectedId, onSelect }: {
  companies: PortalCompany[]; selectedId: string | null; onSelect: (id: string) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!container.current) return;
    const instance = L.map(container.current, { scrollWheelZoom: false }).setView([-20.3197, -48.3118], 13);
    map.current = instance;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>', maxZoom: 19,
    }).addTo(instance);
    const resize = new ResizeObserver(() => instance.invalidateSize());
    resize.observe(container.current);
    return () => { resize.disconnect(); instance.remove(); map.current = null; };
  }, []);

  useEffect(() => {
    const instance = map.current;
    if (!instance) return;
    const group = L.layerGroup().addTo(instance);
    companies.forEach(company => {
      const { latitude, longitude } = company;
      if (latitude == null || longitude == null || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
      const label = document.createElement('span');
      label.textContent = company.nome;
      L.marker([latitude, longitude], { icon: pin, title: company.nome, alt: company.nome })
        .bindTooltip(label).on('click', () => onSelect(company.id)).addTo(group);
      if (company.id === selectedId) instance.setView([latitude, longitude], 14, { animate: false });
    });
    return () => { group.remove(); };
  }, [companies, selectedId, onSelect]);

  return <div ref={container} className="portal-city-map" aria-label="Mapa de empresas em Guaíra" />;
}
