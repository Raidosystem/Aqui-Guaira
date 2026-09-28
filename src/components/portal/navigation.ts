import { Briefcase, HandHelping, Newspaper, HeartPulse, Siren, PawPrint } from 'lucide-react';

export const cityShortcuts = [
  { name: 'Vagas de Empregos', text: 'Oportunidades em Guaíra', to: '/vagas-emprego', icon: Briefcase },
  { name: 'Aqui Resolve', text: 'Sua voz faz a diferença', to: '/aqui-resolve', icon: HandHelping },
  { name: 'Mural', text: 'A comunidade se encontra', to: '/mural', icon: Newspaper },
  { name: 'Saúde na Prática', text: 'Informações para se cuidar', to: '/saude-na-pratica', icon: HeartPulse },
  { name: 'Ocorrências', text: 'Acompanhe os relatos', to: '/ocorrencias', icon: Siren },
  { name: 'Pets e Adoção', text: 'Ajude um novo amigo', to: '/pets-perdidos', icon: PawPrint },
];
