/**
 * URLs das ferramentas externas do sistema
 * Centralizadas para fácil manutenção e atualização
 */

export const FERRAMENTAS_URLS = {
  BUSCA_CEP: 'https://busca-cep-raval.vercel.app/',
  GERADOR_CURRICULO: 'https://cria-curriculo-raval.vercel.app/',
} as const

/**
 * Obter URL da ferramenta de busca CEP
 * Use esta função em vez de hardcoded URL
 */
export const getBuscaCepUrl = () => FERRAMENTAS_URLS.BUSCA_CEP

/**
 * Obter URL do gerador de currículo
 */
export const getGeradorCurriculoUrl = () => FERRAMENTAS_URLS.GERADOR_CURRICULO
