// Text translations for Brazilian Portuguese (pt-BR)
export const ptBR = {
  // Authentication
  auth: {
    loginPrefix: "Entrar no ",
    loginBrand: "ObrasAI",
    loginAction: "Fazer login",
    logout: "Sair",
    register: "Registrar",
    email: "E-mail",
    password: "Senha",
    confirmPassword: "Confirmar Senha",
    forgotPassword: "Esqueceu a senha?",
    googleLogin: "Entrar com Google",
    firstName: "Nome",
    lastName: "Sobrenome",
    alreadyHaveAccount: "Já tem uma conta?",
    dontHaveAccount: "Não tem uma conta?",
    createAccountPrefix: "Criar Conta no ",
    createAccountBrand: "ObrasAI",
    createAccountAction: "Criar conta",
    loginError: "Erro ao fazer login",
    registerError: "Erro ao registrar",
    passwordMismatch: "As senhas não conferem",
    enterEmail: "Digite seu e-mail",
    enterPassword: "Digite sua senha",
    enterFirstName: "Digite seu nome",
    enterLastName: "Digite seu sobrenome",
  },
  
  // Dashboard
  dashboard: {
    welcome: "Bem-vindo",
    overview: "Visão Geral",
    recentProjects: "Projetos Recentes",
    pendingTasks: "Tarefas Pendentes",
    statistics: "Estatísticas",
    notifications: "Notificações",
  },
  
  // Navigation
  nav: {
    dashboard: "Dashboard",
    obras: "Obras",
    despesas: "Despesas",
    fornecedores: "Fornecedores",
    fornecedoresPJ: "Pessoa Jurídica",
    fornecedoresPF: "Pessoa Física",
    notasFiscais: "Notas Fiscais",
    profile: "Perfil",
    subscription: "Assinatura",
    chat: "Chat",
    settings: "Configurações",
    help: "Ajuda",
    admin: "Administração",
  },

  // Common actions
  actions: {
    title: "Ações",
    add: "Adicionar",
    edit: "Editar",
    delete: "Excluir",
    save: "Salvar",
    cancel: "Cancelar",
    confirm: "Confirmar",
    search: "Buscar",
    filter: "Filtrar",
    view: "Visualizar",
    download: "Baixar",
    upload: "Enviar",
    send: "Enviar",
    create: "Criar",
    update: "Atualizar",
    loading: "Carregando...",
    previous: "Anterior",
    next: "Próximo",
    pickDate: "Selecionar data",
  },

  // Obras (Projects)
  obras: {
    title: "Obras",
    newObra: "Nova Obra",
    editObra: "Editar Obra",
    viewObra: "Visualizar Obra",
    name: "Nome da Obra",
    address: "Endereço",
    city: "Cidade",
    state: "Estado",
    zipCode: "CEP",
    budget: "Orçamento",
    startDate: "Data de Início",
    endDate: "Data Prevista de Término",
    status: "Status",
    details: "Detalhes",
    noObras: "Nenhuma obra encontrada",
  },

  // Despesas (Expenses)
  despesas: {
    title: "Despesas",
    newDespesa: "Nova Despesa",
    editDespesa: "Editar Despesa",
    obra: "Obra",
    fornecedor: "Fornecedor",
    date: "Data",
    description: "Descrição",
    amount: "Valor",
    category: "Categoria",
    insumo: "Insumo",
    etapa: "Etapa",
    quantity: "Quantidade",
    unitPrice: "Valor Unitário",
    total: "Total",
    paid: "Pago",
    paymentDate: "Data de Pagamento",
    observations: "Observações",
    noDespesas: "Nenhuma despesa encontrada",
    invoiceNumber: "Número da Nota Fiscal",
    unit: "Unidade",
  },

  // Fornecedores (Suppliers)
  fornecedores: {
    title: "Fornecedores",
    pj: {
      title: "Fornecedores - Pessoa Jurídica",
      new: "Novo Fornecedor PJ",
      edit: "Editar Fornecedor PJ",
      cnpj: "CNPJ",
      razaoSocial: "Razão Social",
      nomeFantasia: "Nome Fantasia",
      inscricaoEstadual: "Inscrição Estadual",
      inscricaoMunicipal: "Inscrição Municipal",
    },
    pf: {
      title: "Fornecedores - Pessoa Física",
      new: "Novo Fornecedor PF",
      edit: "Editar Fornecedor PF",
      cpf: "CPF",
      nome: "Nome",
      rg: "RG",
      dataNascimento: "Data de Nascimento",
    },
    common: {
      email: "E-mail",
      phone: "Telefone",
      secondaryPhone: "Telefone Secundário",
      address: "Endereço",
      number: "Número",
      complement: "Complemento",
      neighborhood: "Bairro",
      city: "Cidade",
      state: "Estado",
      zipCode: "CEP",
      observations: "Observações",
      website: "Website",
      noFornecedores: "Nenhum fornecedor encontrado",
    },
  },

  // Notas Fiscais (Invoices)
  notasFiscais: {
    title: "Notas Fiscais",
    new: "Nova Nota Fiscal",
    edit: "Editar Nota Fiscal",
    upload: "Enviar Nota Fiscal",
    number: "Número",
    obra: "Obra",
    fornecedor: "Fornecedor",
    issueDate: "Data de Emissão",
    totalValue: "Valor Total",
    description: "Descrição",
    noNotasFiscais: "Nenhuma nota fiscal encontrada",
    accessKey: "Chave de Acesso",
    file: "Arquivo",
  },

  // Profile
  profile: {
    title: "Perfil",
    personalInfo: "Informações Pessoais",
    name: "Nome",
    email: "E-mail",
    phone: "Telefone",
    cpf: "CPF",
    dateOfBirth: "Data de Nascimento",
    updateProfile: "Atualizar Perfil",
  },

  // Subscription
  subscription: {
    title: "Assinatura",
    currentPlan: "Plano Atual",
    status: {
      active: "Ativo",
      inactive: "Inativo",
      canceled: "Cancelado",
      past_due: "Pagamento Atrasado",
      trialing: "Período de Teste",
    },
    expiresOn: "Expira em",
    billingCycle: "Ciclo de Cobrança",
    upgrade: "Fazer Upgrade",
    cancel: "Cancelar Assinatura",
    manage: "Gerenciar Assinatura",
    goToPortal: "Ir para Portal de Pagamento",
  },

  // Chat
  chat: {
    title: "Chat",
    newMessage: "Nova Mensagem",
    send: "Enviar",
    typeMessage: "Digite sua mensagem...",
    noMessages: "Nenhuma mensagem encontrada",
  },

  // Admin
  admin: {
    title: "Administração",
    users: "Usuários",
    systemOverview: "Visão Geral do Sistema",
    plans: "Planos",
    newUser: "Novo Usuário",
    userDetails: "Detalhes do Usuário",
    role: "Função",
    status: "Status",
    lastLogin: "Último Login",
    noUsers: "Nenhum usuário encontrado",
  },

  // Errors and Notifications
  messages: {
    success: "Sucesso!",
    error: "Erro",
    saveSuccess: "Salvo com sucesso!",
    deleteSuccess: "Excluído com sucesso!",
    updateSuccess: "Atualizado com sucesso!",
    uploadSuccess: "Enviado com sucesso!",
    loginSuccess: "Login realizado com sucesso!",
    logoutSuccess: "Logout realizado com sucesso!",
    registerSuccess: "Registro realizado com sucesso!",
    requiredField: "Este campo é obrigatório",
    invalidEmail: "E-mail inválido",
    invalidCPF: "CPF inválido",
    invalidCNPJ: "CNPJ inválido",
    invalidDate: "Data inválida",
    invalidNumber: "Número inválido",
    invalidFormat: "Formato inválido",
    minimumLength: "Mínimo de {0} caracteres",
    maximumLength: "Máximo de {0} caracteres",
    passwordTooShort: "A senha deve ter pelo menos 8 caracteres",
    generalError: "Ocorreu um erro. Por favor, tente novamente.",
    sessionExpired: "Sua sessão expirou. Por favor, faça login novamente.",
    unauthorized: "Não autorizado",
    notFound: "Não encontrado",
    noResults: "Nenhum resultado encontrado",
    totalItems: "itens no total",
    confirmDelete: "Tem certeza que deseja excluir?",
  },
};

// Function to get translation
export const t = (key: string): string => {
  const keys = key.split('.');
  let value: typeof ptBR | string = ptBR;
  
  for (const k of keys) {
    if (typeof value === 'string' || value[k as keyof typeof value] === undefined) return key;
    value = value[k as keyof typeof value];
  }
  
  return typeof value === 'string' ? value : key;
};

// Format date to Brazilian format (DD/MM/YYYY)
export const formatDateBR = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

// Format currency to Brazilian format (R$ X.XXX,XX)
export const formatCurrencyBR = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Brazilian states
export const brazilianStates = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
];
