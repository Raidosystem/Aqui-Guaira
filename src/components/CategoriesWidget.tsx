import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building, Search } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'

interface Category {
  id: string
  name: string
  color: string
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
  coordinates?: { lat: number; lng: number }
}

interface CategoriesWidgetProps {
  maxItems?: number
  onCategorySelect?: (categoryId: string) => void
  onNavigateToDirectory?: () => void
  className?: string
}

export function CategoriesWidget({ 
  maxItems = 6, 
  onCategorySelect,
  onNavigateToDirectory,
  className 
}: CategoriesWidgetProps) {
  const [categories] = useKV<Category[]>('categories', [])
  const [companies] = useKV<Company[]>('companies', [])

  // Get only approved companies
  const approvedCompanies = companies.filter(company => company.status === 'approved')
  
  // Get categories that have at least one approved company
  const categoriesWithCompanies = categories.filter(category => {
    return approvedCompanies.some(company => company.categories.includes(category.id))
  }).map(category => {
    const companyCount = approvedCompanies.filter(company => 
      company.categories.includes(category.id)
    ).length
    
    return {
      ...category,
      companyCount
    }
  }).sort((a, b) => b.companyCount - a.companyCount) // Sort by company count (most to least)

  const displayedCategories = categoriesWithCompanies.slice(0, maxItems)

  const handleCategoryClick = (categoryId: string) => {
    if (onCategorySelect) {
      onCategorySelect(categoryId)
    } else if (onNavigateToDirectory) {
      // Navigate to directory with category filter
      onNavigateToDirectory()
      // Note: The actual filtering would need to be implemented in the parent component
    }
  }

  if (categoriesWithCompanies.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building className="w-5 h-5" />
            Categorias de Empresas
          </CardTitle>
          <CardDescription>
            As categorias com empresas cadastradas aparecerão aqui
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="text-center space-y-2 py-4">
            <Search className="w-8 h-8 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">
              Nenhuma categoria com empresas ainda
            </p>
            <p className="text-xs text-muted-foreground">
              Empresas cadastradas e aprovadas aparecerão organizadas por categoria
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Building className="w-5 h-5" />
          Categorias de Empresas
        </CardTitle>
        <CardDescription>
          Encontre empresas locais por categoria
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {displayedCategories.map((category) => (
            <Button
              key={category.id}
              variant="outline"
              onClick={() => handleCategoryClick(category.id)}
              className="h-auto p-3 flex flex-col items-start gap-2 text-left hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-2 w-full">
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: category.color }}
                />
                <span className="font-medium text-sm flex-1 truncate">
                  {category.name}
                </span>
              </div>
              <div className="flex items-center justify-between w-full">
                <Badge variant="secondary" className="text-xs">
                  {category.companyCount} empresa{category.companyCount !== 1 ? 's' : ''}
                </Badge>
                <Search className="w-3 h-3 text-muted-foreground" />
              </div>
            </Button>
          ))}
        </div>
        
        {categoriesWithCompanies.length > maxItems && (
          <div className="text-center pt-2 border-t">
            <Button 
              variant="link" 
              size="sm"
              onClick={onNavigateToDirectory}
              className="text-xs"
            >
              Ver todas as categorias (+{categoriesWithCompanies.length - maxItems})
            </Button>
          </div>
        )}

        {onNavigateToDirectory && (
          <div className="pt-2 border-t">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onNavigateToDirectory}
              className="w-full gap-2"
            >
              <Search className="w-4 h-4" />
              Ver todas as empresas
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}