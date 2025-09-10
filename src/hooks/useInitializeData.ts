import { useKV } from '@github/spark/hooks'
import { useEffect } from 'react'

interface Post {
  id: string
  author: string
  authorAvatar?: string
  neighborhood: string
  content: string
  images: string[]
  videos: string[]
  createdAt: string
  likes: number
  status: 'approved' | 'pending' | 'rejected'
  isIssue: boolean
}

interface Company {
  id: string
  name: string
  description: string
  phone: string
  whatsapp?: string
  address: string
  neighborhood: string
  categories: string[]
  hours: string
  logoUrl?: string
  website?: string
  status: 'approved' | 'pending' | 'rejected'
  createdAt: string
}

interface Category {
  id: string
  name: string
  color: string
}

export function useInitializeData() {
  const [posts, setPosts] = useKV<Post[]>('community-posts', [])
  const [companies, setCompanies] = useKV<Company[]>('companies', [])
  const [categories, setCategories] = useKV<Category[]>('categories', [])

  useEffect(() => {
    // Initialize categories if empty
    if (categories.length === 0) {
      const initialCategories: Category[] = [
        { id: 'restaurantes', name: 'Restaurantes', color: '#EF4444' },
        { id: 'farmacias', name: 'Farmácias', color: '#10B981' },
        { id: 'mecanicas', name: 'Mecânicas', color: '#3B82F6' },
        { id: 'saloes', name: 'Salões de Beleza', color: '#EC4899' },
        { id: 'supermercados', name: 'Supermercados', color: '#F59E0B' },
        { id: 'servicos', name: 'Serviços', color: '#8B5CF6' },
        { id: 'comercio', name: 'Comércio Geral', color: '#06B6D4' },
        { id: 'saude', name: 'Saúde', color: '#84CC16' }
      ]
      setCategories(initialCategories)
    }

    // Initialize some sample posts if empty
    if (posts.length === 0) {
      const samplePosts: Post[] = [
        {
          id: '1',
          author: 'Maria Silva',
          neighborhood: 'Centro',
          content: 'Alguém sabe se a farmácia do centro abre no domingo? Preciso comprar um remédio urgente.',
          images: [],
          videos: [],
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          likes: 3,
          status: 'pending',
          isIssue: false
        },
        {
          id: '2',
          author: 'João Santos',
          neighborhood: 'Vila Nova',
          content: 'Encontrei este gatinho perdido na rua das Flores. Alguém conhece o dono? Está bem cuidado aqui em casa.',
          images: [],
          videos: [],
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
          likes: 8,
          status: 'approved',
          isIssue: false
        },
        {
          id: '3',
          author: 'Ana Costa',
          neighborhood: 'Jardim América',
          content: 'Atenção pessoal! Semana que vem teremos a festa junina na praça central. Quem quiser ajudar na organização, entre em contato!',
          images: [],
          videos: [],
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          likes: 15,
          status: 'approved',
          isIssue: false
        },
        {
          id: '4',
          author: 'Pedro Oliveira',
          neighborhood: 'Centro',
          content: 'Este post contém linguagem inapropriada e deve ser rejeitado pelos moderadores.',
          images: [],
          videos: [],
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
          likes: 0,
          status: 'pending',
          isIssue: false
        }
      ]
      setPosts(samplePosts)
    }

    // Initialize some sample companies if empty
    if (companies.length === 0) {
      const sampleCompanies: Company[] = [
        {
          id: '1',
          name: 'Farmácia Popular',
          description: 'Farmácia completa com medicamentos, perfumaria e conveniência. Atendimento 24 horas.',
          phone: '(17) 3331-1234',
          whatsapp: '17999887766',
          address: 'Rua Principal, 123',
          neighborhood: 'Centro',
          categories: ['farmacias'],
          hours: '24 horas',
          website: 'https://farmacia-popular.com.br',
          status: 'pending',
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() // 3 hours ago
        },
        {
          id: '2',
          name: 'Restaurante Sabor da Casa',
          description: 'Comida caseira, almoço executivo e marmitex. Especialidade em comida mineira.',
          phone: '(17) 3331-5678',
          whatsapp: '17988776655',
          address: 'Avenida Brasil, 456',
          neighborhood: 'Centro',
          categories: ['restaurantes'],
          hours: '11:00 às 14:00',
          status: 'approved',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
        },
        {
          id: '3',
          name: 'Auto Mecânica Silva',
          description: 'Serviços automotivos completos: mecânica geral, elétrica, pintura e funilaria.',
          phone: '(17) 3331-9999',
          address: 'Rua das Oficinas, 789',
          neighborhood: 'Vila Industrial',
          categories: ['mecanicas', 'servicos'],
          hours: '08:00 às 18:00',
          status: 'approved',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
        },
        {
          id: '4',
          name: 'Empresa Suspeita LTDA',
          description: 'Esta empresa tem informações suspeitas e deve ser rejeitada.',
          phone: '(11) 0000-0000',
          address: 'Endereço Inexistente',
          neighborhood: 'Lugar Nenhum',
          categories: ['comercio'],
          hours: 'Nunca abre',
          status: 'pending',
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() // 1 hour ago
        }
      ]
      setCompanies(sampleCompanies)
    }
  }, [categories.length, posts.length, companies.length, setCategories, setPosts, setCompanies])
}