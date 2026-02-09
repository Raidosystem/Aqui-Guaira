import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getUsuarioLogado } from '@/lib/supabase';

interface User {
  id: string;
  email: string;
  nome?: string;
  telefone?: string;
  cpf?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
  status?: string;
  motivo_bloqueio?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refreshUser: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(() => {
    const usuarioLogado = getUsuarioLogado();
    setUser(usuarioLogado);
    setLoading(false);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('aqui_guaira_user');
    setUser(null);
  }, []);

  // Carrega o usuário no mount
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Escuta mudanças no localStorage (outras abas ou componentes)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'aqui_guaira_user') {
        refreshUser();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [refreshUser]);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
