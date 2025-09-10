import { useKV } from '@github/spark/hooks'
import { useEffect } from 'react'
import { useBusinessFavorites } from '@/hooks/useBusinessFavorites'

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
  email?: string
  address: string
  neighborhood: string
  categories: string[]
  hours: string
  logoUrl?: string
  website?: string
  instagram?: string
  facebook?: string
  images?: string[]
  logo?: string
  cep?: string
  ownerId?: string
  ownerEmail?: string
  status: 'approved' | 'pending' | 'rejected'
  rejectionReason?: string
  createdAt: string
  updatedAt?: string
  coordinates?: { lat: number; lng: number }
}

interface Category {
  id: string
  name: string
  color: string
  icon: string
}

export function useInitializeData() {
  const [posts, setPosts] = useKV<Post[]>('community-posts', [])
  const [companies, setCompanies] = useKV<Company[]>('companies', [])
  const [categories, setCategories] = useKV<Category[]>('categories', [])
  const { addToFavorites, favorites } = useBusinessFavorites()

  useEffect(() => {
    // Initialize categories if empty
    if (categories.length === 0) {
      const initialCategories: Category[] = [
        { id: 'restaurantes', name: 'Restaurantes', color: '#EF4444', icon: '🍽️' },
        { id: 'farmacias', name: 'Farmácias', color: '#10B981', icon: '💊' },
        { id: 'mecanicas', name: 'Mecânicas', color: '#3B82F6', icon: '🔧' },
        { id: 'saloes', name: 'Salões de Beleza', color: '#EC4899', icon: '💄' },
        { id: 'supermercados', name: 'Supermercados', color: '#F59E0B', icon: '🛒' },
        { id: 'servicos', name: 'Serviços', color: '#8B5CF6', icon: '🛠️' },
        { id: 'comercio', name: 'Comércio Geral', color: '#06B6D4', icon: '🏪' },
        { id: 'saude', name: 'Saúde', color: '#84CC16', icon: '🏥' }
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
          email: 'contato@farmaciapopular.com.br',
          address: 'Rua Principal, 123',
          neighborhood: 'Centro',
          categories: ['farmacias'],
          hours: '24 horas',
          website: 'https://farmacia-popular.com.br',
          cep: '14790-000',
          ownerEmail: 'farmacia@exemplo.com',
          logo: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=200&h=200&fit=crop',
          images: [
            'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1563213126-a4273aed2016?w=400&h=300&fit=crop'
          ],
          status: 'approved',
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          coordinates: { lat: -20.3180, lng: -48.3100 }
        },
        {
          id: '2',
          name: 'Restaurante Sabor da Casa',
          description: 'Comida caseira, almoço executivo e marmitex. Especialidade em comida mineira.',
          phone: '(17) 3331-5678',
          whatsapp: '17988776655',
          email: 'contato@sabordacasa.com.br',
          address: 'Avenida Brasil, 456',
          neighborhood: 'Centro',
          categories: ['restaurantes'],
          hours: '11:00 às 14:00',
          cep: '14790-001',
          ownerEmail: 'restaurante@exemplo.com',
          logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&h=200&fit=crop',
          images: [
            'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop'
          ],
          status: 'approved',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          coordinates: { lat: -20.3190, lng: -48.3110 }
        },
        {
          id: '3',
          name: 'Auto Mecânica Silva',
          description: 'Serviços automotivos completos: mecânica geral, elétrica, pintura e funilaria.',
          phone: '(17) 3331-9999',
          email: 'silva@automecanica.com.br',
          address: 'Rua das Oficinas, 789',
          neighborhood: 'Vila Industrial',
          categories: ['mecanicas', 'servicos'],
          hours: '08:00 às 18:00',
          cep: '14790-010',
          ownerEmail: 'mecanica@exemplo.com',
          logo: 'https://images.unsplash.com/photo-1486754735734-325b5831c3ad?w=200&h=200&fit=crop',
          images: [
            'https://images.unsplash.com/photo-1486754735734-325b5831c3ad?w=400&h=300&fit=crop'
          ],
          status: 'approved',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          coordinates: { lat: -20.3200, lng: -48.3120 }
        },
        {
          id: '4',
          name: 'Salão Beleza & Estilo',
          description: 'Cortes, escova, manicure, pedicure e tratamentos estéticos. Agende pelo WhatsApp.',
          phone: '(17) 3331-7777',
          whatsapp: '17987654321',
          email: 'agendamento@belezaestilo.com.br',
          address: 'Rua das Flores, 321',
          neighborhood: 'Centro',
          categories: ['saloes'],
          hours: '09:00 às 18:00',
          cep: '14790-005',
          ownerEmail: 'salao@exemplo.com',
          logo: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&h=200&fit=crop',
          images: [
            'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=300&fit=crop'
          ],
          status: 'approved',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          coordinates: { lat: -20.3175, lng: -48.3095 }
        },
        {
          id: '5',
          name: 'Supermercado Guaíra',
          description: 'Supermercado completo com produtos frescos, padaria, açougue e hortifrúti.',
          phone: '(17) 3331-6666',
          email: 'atendimento@supermercadoguaira.com.br',
          address: 'Avenida Central, 100',
          neighborhood: 'Centro',
          categories: ['supermercados'],
          hours: '07:00 às 22:00',
          cep: '14790-002',
          ownerEmail: 'supermercado@exemplo.com',
          logo: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop',
          images: [
            'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'
          ],
          status: 'approved',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          coordinates: { lat: -20.3185, lng: -48.3105 }
        },
        {
          id: '6',
          name: 'Empresa Suspeita LTDA',
          description: 'Esta empresa tem informações suspeitas e deve ser rejeitada.',
          phone: '(11) 0000-0000',
          email: 'suspeita@fake.com',
          address: 'Endereço Inexistente',
          neighborhood: 'Lugar Nenhum',
          categories: ['comercio'],
          hours: 'Nunca abre',
          cep: '00000-000',
          ownerEmail: 'suspeita@exemplo.com',
          status: 'pending',
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          coordinates: { lat: -20.3170, lng: -48.3090 }
        },
        {
          id: '7',
          name: 'Clínica Saúde Total',
          description: 'Clínica médica com especialidades em cardiologia, dermatologia e clínica geral. Consultas e exames.',
          phone: '(17) 3331-2222',
          whatsapp: '17999112233',
          email: 'agendamento@saudetotal.com.br',
          address: 'Rua da Saúde, 555',
          neighborhood: 'Centro',
          categories: ['saude'],
          hours: '07:00 às 17:00',
          cep: '14790-008',
          ownerEmail: 'clinica@exemplo.com',
          logo: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=200&h=200&fit=crop',
          images: [
            'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400&h=300&fit=crop'
          ],
          status: 'approved',
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          coordinates: { lat: -20.3165, lng: -48.3085 }
        },
        {
          id: '8',
          name: 'TechInfo Informática',
          description: 'Assistência técnica em computadores, notebooks e celulares. Vendas de equipamentos e acessórios.',
          phone: '(17) 3331-8888',
          whatsapp: '17987765544',
          email: 'suporte@techinfo.com.br',
          address: 'Rua da Tecnologia, 99',
          neighborhood: 'Vila Nova',
          categories: ['servicos'],
          hours: '08:00 às 18:00',
          cep: '14790-015',
          ownerEmail: 'tech@exemplo.com',
          logo: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=200&h=200&fit=crop',
          images: [
            'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=300&fit=crop'
          ],
          status: 'approved',
          createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          coordinates: { lat: -20.3195, lng: -48.3115 }
        }
      ]
      setCompanies(sampleCompanies)
    }

    // Initialize some sample favorite businesses if empty
    if (favorites.length === 0 && companies.length > 0) {
      // Add approved companies as favorites to show examples
      const approvedCompanies = companies.filter(c => c.status === 'approved')
      if (approvedCompanies.length > 0) {
        // Add the restaurant as favorite (Restaurantes category)
        const restaurant = approvedCompanies.find(c => c.categories.includes('restaurantes'))
        if (restaurant) {
          addToFavorites({
            id: restaurant.id,
            name: restaurant.name,
            address: restaurant.address,
            neighborhood: restaurant.neighborhood,
            phone: restaurant.phone,
            whatsapp: restaurant.whatsapp,
            categories: restaurant.categories,
            coordinates: restaurant.coordinates
          })
        }

        // Add the pharmacy as favorite (Farmácias category)
        const pharmacy = approvedCompanies.find(c => c.categories.includes('farmacias'))
        if (pharmacy) {
          addToFavorites({
            id: pharmacy.id,
            name: pharmacy.name,
            address: pharmacy.address,
            neighborhood: pharmacy.neighborhood,
            phone: pharmacy.phone,
            whatsapp: pharmacy.whatsapp,
            categories: pharmacy.categories,
            coordinates: pharmacy.coordinates
          })
        }

        // Add the salon as favorite (Salões category)
        const salon = approvedCompanies.find(c => c.categories.includes('saloes'))
        if (salon) {
          addToFavorites({
            id: salon.id,
            name: salon.name,
            address: salon.address,
            neighborhood: salon.neighborhood,
            phone: salon.phone,
            whatsapp: salon.whatsapp,
            categories: salon.categories,
            coordinates: salon.coordinates
          })
        }
      }
    }
  }, [categories.length, posts.length, companies.length, favorites.length, setCategories, setPosts, setCompanies, addToFavorites, companies])
}