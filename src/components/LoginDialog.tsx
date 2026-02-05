import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { criarOuLogarUsuario, getUsuarioLogado, logout, reenviarEmailConfirmacao } from '@/lib/supabase'
import { toast } from 'sonner'
import { Loader2, LogIn, LogOut, User as UserIcon, UserPlus, Search } from 'lucide-react'
import { getBuscaCepUrl } from '@/lib/ferramentas'

interface LoginDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLoginSuccess?: () => void
}

export function LoginDialog({ open, onOpenChange, onLoginSuccess }: LoginDialogProps) {
  // Estado do formulário de Login
  const [loginEmail, setLoginEmail] = useState('')
  const [loginSenha, setLoginSenha] = useState('')
  const [loadingLogin, setLoadingLogin] = useState(false)

  // Estado do formulário de Registro
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerNome, setRegisterNome] = useState('')
  const [registerCpf, setRegisterCpf] = useState('')
  const [registerTelefone, setRegisterTelefone] = useState('')
  const [registerEndereco, setRegisterEndereco] = useState('')
  const [registerNumero, setRegisterNumero] = useState('')
  const [registerBairro, setRegisterBairro] = useState('')
  const [registerCidade, setRegisterCidade] = useState('Guaíra')
  const [registerEstado, setRegisterEstado] = useState('SP')
  const [registerCep, setRegisterCep] = useState('')
  const [registerSenha, setRegisterSenha] = useState('')
  const [registerConfirmarSenha, setRegisterConfirmarSenha] = useState('')
  const [loadingRegister, setLoadingRegister] = useState(false)

  // Estado Confirmação de Email
  const [showEmailConfirm, setShowEmailConfirm] = useState(false)
  const [emailConfirmacao, setEmailConfirmacao] = useState('')
  const [reenviandoEmail, setReenviandoEmail] = useState(false)

  // Estado para carregamento de CEP
  const [loadingCep, setLoadingCep] = useState(false)

  // Função para buscar CEP
  const buscarCep = async (cep: string) => {
    // ... manter lógica existente (omitrada aqui para brevidade se não mudar)
    const cepLimpo = cep.replace(/\D/g, '')
    if (cepLimpo.length !== 8) return

    setLoadingCep(true)
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      const data = await response.json()

      if (data.erro) {
        toast.error('CEP não encontrado')
        return
      }

      setRegisterEndereco(data.logradouro || '')
      setRegisterBairro(data.bairro || '')
      setRegisterCidade(data.localidade || 'Guaíra')
      setRegisterEstado(data.uf || 'SP')

      toast.success('Logradouro preenchido automaticamente!')
    } catch (error) {
      toast.error('Erro ao buscar CEP')
    } finally {
      setLoadingCep(false)
    }
  }

  const handleReenviarEmail = async () => {
    if (!emailConfirmacao) return;
    setReenviandoEmail(true);
    try {
      await reenviarEmailConfirmacao(emailConfirmacao);
      toast.success("Email de confirmação reenviado! Verifique sua caixa de entrada.");
    } catch (error) {
      toast.error("Erro ao reenviar email. Tente novamente mais tarde.");
    } finally {
      setReenviandoEmail(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!loginEmail.trim() || !loginSenha.trim()) {
      toast.error('Preencha email e senha')
      return
    }

    setLoadingLogin(true)
    try {
      const user = await criarOuLogarUsuario(loginEmail, undefined, loginSenha)

      if (!user) {
        // Se retornar null por algum motivo
        toast.error('Email ou senha incorretos')
        return
      }

      toast.success('Login realizado!', {
        description: `Bem-vindo de volta, ${user.nome || user.email}!`
      })

      setLoginEmail('')
      setLoginSenha('')
      onOpenChange(false)
      onLoginSuccess?.()
    } catch (error: any) {
      if (error.message === 'VERIFICACAO_EMAIL_NECESSARIA' || error.message === 'EMAIL_NAO_CONFIRMADO') {
        setEmailConfirmacao(loginEmail);
        setShowEmailConfirm(true);
        return;
      }
      toast.error('Erro ao fazer login', {
        description: error.message || 'Verifique suas credenciais'
      })
    } finally {
      setLoadingLogin(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validações
    if (!registerEmail.trim()) {
      toast.error('Digite seu email')
      return
    }
    // ... manter validações existentes
    if (!registerNome.trim()) {
      toast.error('Digite seu nome completo')
      return
    }
    if (!registerCpf.trim()) {
      toast.error('Digite seu CPF')
      return
    }
    const cpfLimpo = registerCpf.replace(/\D/g, '')
    if (cpfLimpo.length !== 11) {
      toast.error('CPF inválido. Digite 11 dígitos')
      return
    }
    if (!registerTelefone.trim()) {
      toast.error('Digite seu telefone')
      return
    }
    if (!registerEndereco.trim()) {
      toast.error('Digite o logradouro')
      return
    }
    if (!registerNumero.trim()) {
      toast.error('Digite o número')
      return
    }
    if (!registerBairro.trim()) {
      toast.error('Digite seu bairro')
      return
    }
    if (!registerCep.trim()) {
      toast.error('Digite seu CEP')
      return
    }
    if (!registerSenha.trim()) {
      toast.error('Digite uma senha')
      return
    }
    if (registerSenha.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres')
      return
    }
    if (registerSenha !== registerConfirmarSenha) {
      toast.error('As senhas não coincidem')
      return
    }

    setLoadingRegister(true)
    try {
      const enderecoCompleto = `${registerEndereco}, ${registerNumero}`.trim()

      await criarOuLogarUsuario(
        registerEmail,
        registerNome,
        registerSenha,
        true,
        registerCpf.replace(/\D/g, ''),
        registerTelefone,
        enderecoCompleto,
        registerBairro,
        registerCidade,
        registerEstado,
        registerCep.replace(/\D/g, '')
      )

      toast.success('Conta criada com sucesso!', {
        description: 'Você já está logado e pode usar o sistema.'
      })

      // Limpar todos os campos
      setRegisterEmail('')
      setRegisterNome('')
      setRegisterCpf('')
      setRegisterTelefone('')
      setRegisterEndereco('')
      setRegisterNumero('')
      setRegisterBairro('')
      setRegisterCep('')
      setRegisterSenha('')
      setRegisterConfirmarSenha('')
      onOpenChange(false)
      onLoginSuccess?.()
    } catch (error: any) {
      if (error.message === 'VERIFICACAO_EMAIL_NECESSARIA') {
        setEmailConfirmacao(registerEmail);
        setShowEmailConfirm(true);
        toast.info("Confirme seu email para continuar!");
        return;
      }
      toast.error('Erro ao criar conta', {
        description: error.message || 'Tente novamente'
      })
    } finally {
      setLoadingRegister(false)
    }
  }

  if (showEmailConfirm) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md z-[9999]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogIn className="w-5 h-5 text-primary" />
              Verifique seu Email
            </DialogTitle>
            <DialogDescription>
              Enviamos um link de confirmação para: <br />
              <span className="font-semibold text-foreground">{emailConfirmacao}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-md border border-amber-200 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-200">
              <p>Por favor, acesse seu email e clique no link para ativar sua conta. Verifique também a pasta de SPAM.</p>
            </div>

            <Button onClick={handleReenviarEmail} disabled={reenviandoEmail} className="w-full" variant="secondary">
              {reenviandoEmail ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Reenviar Email de Confirmação
            </Button>

            <Button onClick={() => setShowEmailConfirm(false)} className="w-full" variant="outline">
              Voltar para Login
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md z-[9999]">
        <DialogHeader>
          <DialogTitle>Entrar ou Criar Conta</DialogTitle>
          <DialogDescription>
            Faça login ou crie uma conta para salvar favoritos e postar no mural
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Criar Conta</TabsTrigger>
          </TabsList>

          {/* Tab de Login */}
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-senha">Senha</Label>
                <Input
                  id="login-senha"
                  type="password"
                  placeholder="••••••••"
                  value={loginSenha}
                  onChange={(e) => setLoginSenha(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loadingLogin}>
                {loadingLogin ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Entrar
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          {/* Tab de Registro */}
          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4 pt-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="space-y-2">
                <Label htmlFor="register-nome">Nome Completo</Label>
                <Input
                  id="register-nome"
                  type="text"
                  placeholder="Seu nome completo"
                  value={registerNome}
                  onChange={(e) => setRegisterNome(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-cpf">CPF</Label>
                <Input
                  id="register-cpf"
                  type="text"
                  placeholder="000.000.000-00"
                  value={registerCpf}
                  onChange={(e) => {
                    let valor = e.target.value.replace(/\D/g, '')
                    if (valor.length <= 11) {
                      valor = valor.replace(/(\d{3})(\d)/, '$1.$2')
                      valor = valor.replace(/(\d{3})(\d)/, '$1.$2')
                      valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
                      setRegisterCpf(valor)
                    }
                  }}
                  required
                  maxLength={14}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-telefone">Telefone/WhatsApp</Label>
                <Input
                  id="register-telefone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={registerTelefone}
                  onChange={(e) => {
                    let valor = e.target.value.replace(/\D/g, '')
                    if (valor.length <= 11) {
                      valor = valor.replace(/^(\d{2})(\d)/, '($1) $2')
                      valor = valor.replace(/(\d{5})(\d)/, '$1-$2')
                      setRegisterTelefone(valor)
                    }
                  }}
                  required
                  maxLength={15}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="register-cep">CEP</Label>
                  <a
                    href={getBuscaCepUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
                  >
                    <Search className="w-3 h-3" />
                    Busque seu CEP
                  </a>
                </div>
                <div className="relative">
                  <Input
                    id="register-cep"
                    type="text"
                    placeholder="00000-000"
                    value={registerCep}
                    onChange={(e) => {
                      let valor = e.target.value.replace(/\D/g, '')
                      if (valor.length <= 8) {
                        valor = valor.replace(/(\d{5})(\d)/, '$1-$2')
                        setRegisterCep(valor)
                        // Buscar CEP automaticamente quando completar 8 dígitos
                        if (valor.replace(/\D/g, '').length === 8) {
                          buscarCep(valor)
                        }
                      }
                    }}
                    required
                    maxLength={9}
                    disabled={loadingCep}
                  />
                  {loadingCep && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="register-endereco">Logradouro</Label>
                  <Input
                    id="register-endereco"
                    type="text"
                    placeholder="Rua, Avenida..."
                    value={registerEndereco}
                    onChange={(e) => setRegisterEndereco(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-numero">Número</Label>
                  <Input
                    id="register-numero"
                    type="text"
                    placeholder="123"
                    value={registerNumero}
                    onChange={(e) => setRegisterNumero(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-bairro">Bairro</Label>
                <Input
                  id="register-bairro"
                  type="text"
                  placeholder="Seu bairro"
                  value={registerBairro}
                  onChange={(e) => setRegisterBairro(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="register-cidade">Cidade</Label>
                  <Input
                    id="register-cidade"
                    type="text"
                    value={registerCidade}
                    onChange={(e) => setRegisterCidade(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-estado">Estado</Label>
                  <Input
                    id="register-estado"
                    type="text"
                    value={registerEstado}
                    onChange={(e) => setRegisterEstado(e.target.value)}
                    required
                    maxLength={2}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-senha">Senha</Label>
                <Input
                  id="register-senha"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={registerSenha}
                  onChange={(e) => setRegisterSenha(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-confirmar">Confirmar Senha</Label>
                <Input
                  id="register-confirmar"
                  type="password"
                  placeholder="Digite a senha novamente"
                  value={registerConfirmarSenha}
                  onChange={(e) => setRegisterConfirmarSenha(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loadingRegister}>
                {loadingRegister ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Criar Conta
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

interface UserButtonProps {
  onLoginRequired?: () => void
}

export function UserButton({ onLoginRequired }: UserButtonProps) {
  const [showLogin, setShowLogin] = useState(false)
  const user = getUsuarioLogado()

  const handleLogout = () => {
    logout()
    toast.success('Logout realizado')
    window.location.reload()
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <UserIcon className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">{user.nome || user.email}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="h-8"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowLogin(true)}
        className="gap-2"
      >
        <LogIn className="h-4 w-4" />
        <span className="hidden sm:inline">Login</span>
      </Button>

      <LoginDialog
        open={showLogin}
        onOpenChange={setShowLogin}
        onLoginSuccess={onLoginRequired}
      />
    </>
  )
}
