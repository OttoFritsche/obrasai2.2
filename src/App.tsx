import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Outlet, Route, Routes, useLocation } from "react-router-dom";

import { AIHelpWidget } from "@/components/ai/AIHelpWidget";
import PatternsShowcase from "@/components/showcase/PatternsShowcase";
import { Toaster } from "@/components/ui/sonner";
import { AIWidgetProvider } from "@/contexts/AIWidgetContext";
import { AuthProvider } from "@/contexts/auth/AuthContext";
import { useAuth } from "@/contexts/auth/hooks";
import { ProtectedRoute } from "@/contexts/auth/ProtectedRoutes";
import { LoadingProvider } from "@/contexts/LoadingContext";
// Admin - Dashboard de Métricas (apenas para administradores do sistema)
// SINAPI
import Dashboard from "@/pages/Dashboard";
// IA
import AlertasAvancados from "@/pages/dashboard/AlertasAvancados";
// Chat AI
import ChatAIPage from "@/pages/dashboard/ai/Chat";
// Controle Orçamentário
import ControleOrcamentario from "@/pages/dashboard/ControleOrcamentario";
// Plantas IA
import { PlantasIA } from "@/pages/dashboard/PlantasIA";
// Notas Fiscais
import EditarNota from "@/pages/dashboard/notas/EditarNota";
import EnviarNota from "@/pages/dashboard/notas/EnviarNota";
import NotasLista from "@/pages/dashboard/notas/NotasLista";
// Settings
import Settings from "@/pages/Settings";
// Construtoras/Autônomos
import ConstrutorasLista from "@/pages/dashboard/construtoras/ConstrutorasLista";
import EditarConstrutora from "@/pages/dashboard/construtoras/EditarConstrutora";
import NovaConstrutora from "@/pages/dashboard/construtoras/NovaConstrutora";
import ContratoComIARefactored from "@/pages/dashboard/contratos/ContratoComIARefactored";
import ContratoDetalhe from "@/pages/dashboard/contratos/ContratoDetalhe";
// Contratos
import ContratosLista from "@/pages/dashboard/contratos/ContratosLista";
// Despesas
import DespesasLista from "@/pages/dashboard/despesas/DespesasLista";
import EditarDespesa from "@/pages/dashboard/despesas/EditarDespesa";
import NovaDespesa from "@/pages/dashboard/despesas/NovaDespesa";
// Fornecedores
// Notas Fiscais
import EditarObra from "@/pages/dashboard/obras/EditarObra";
import NovaObraRefactored from "@/pages/dashboard/obras/NovaObraRefactored";
import ObraDetalhe from "@/pages/dashboard/obras/ObraDetalhe";
// Obras
import ObrasLista from "@/pages/dashboard/obras/ObrasLista";
// Orçamento Paramétrico
import { NovoOrcamento } from "@/pages/dashboard/orcamento/NovoOrcamento";
import OrcamentoDetalhe from "@/pages/dashboard/orcamento/OrcamentoDetalhe";
import OrcamentosLista from "@/pages/dashboard/orcamento/OrcamentosLista";
import ForgotPassword from "@/pages/ForgotPassword";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import Register from "@/pages/Register";
import { ThemeProvider } from "@/providers/theme-provider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutos - dados não são considerados stale por 5 min
      gcTime: 10 * 60 * 1000, // 10 minutos - cache mantido por 10 min
      refetchOnReconnect: 'always',
      refetchOnMount: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

function AppContent() {
  const { pathname } = useLocation();
  const { user } = useAuth(); // Usar o hook de autenticação

  // Determina se o widget deve ser exibido.
  // Não mostrar em páginas de autenticação ou na landing page.
  const showWidget = !['/login', '/register', '/forgot-password', '/'].includes(pathname) && user;

  return (
    <>
      <Outlet />
      {showWidget && <AIHelpWidget />}
    </>
  );
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <LoadingProvider>
          <AuthProvider>
            <AIWidgetProvider>
              <Routes>
                <Route element={<AppContent />}>
                  {/* Rotas Públicas */}
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/landing" element={<Index />} />
                  <Route path="/showcase" element={<PatternsShowcase />} />

                  {/* Rotas Protegidas */}
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/dashboard/obras" element={<ProtectedRoute><ObrasLista /></ProtectedRoute>} />
                  <Route path="/dashboard/obras/nova" element={<ProtectedRoute><NovaObraRefactored /></ProtectedRoute>} />
                  <Route path="/dashboard/obras/:id" element={<ProtectedRoute><ObraDetalhe /></ProtectedRoute>} />
                  <Route path="/dashboard/obras/:id/editar" element={<ProtectedRoute><EditarObra /></ProtectedRoute>} />
                  
                  <Route path="/dashboard/despesas" element={<ProtectedRoute><DespesasLista /></ProtectedRoute>} />
                  <Route path="/dashboard/despesas/nova" element={<ProtectedRoute><NovaDespesa /></ProtectedRoute>} />
                  <Route path="/dashboard/despesas/:id/editar" element={<ProtectedRoute><EditarDespesa /></ProtectedRoute>} />
                  
                  <Route path="/dashboard/construtoras" element={<ProtectedRoute><ConstrutorasLista /></ProtectedRoute>} />
                  <Route path="/dashboard/construtoras/nova" element={<ProtectedRoute><NovaConstrutora /></ProtectedRoute>} />
                  <Route path="/dashboard/construtoras/:id/editar" element={<ProtectedRoute><EditarConstrutora /></ProtectedRoute>} />
                  
                  <Route path="/dashboard/orcamentos" element={<ProtectedRoute><OrcamentosLista /></ProtectedRoute>} />
                  <Route path="/dashboard/orcamentos/novo" element={<ProtectedRoute><NovoOrcamento /></ProtectedRoute>} />
                  <Route path="/dashboard/orcamentos/:id" element={<ProtectedRoute><OrcamentoDetalhe /></ProtectedRoute>} />

                  <Route path="/dashboard/contratos" element={<ProtectedRoute><ContratosLista/></ProtectedRoute>} />
                  <Route path="/dashboard/contratos/novo" element={<ProtectedRoute><ContratoComIARefactored/></ProtectedRoute>} />
                  <Route path="/dashboard/contratos/:id" element={<ProtectedRoute><ContratoDetalhe/></ProtectedRoute>} />

                  <Route path="/dashboard/alertas" element={<ProtectedRoute><AlertasAvancados/></ProtectedRoute>} />
                  <Route path="/dashboard/chat" element={<ProtectedRoute><ChatAIPage/></ProtectedRoute>} />
                  <Route path="/dashboard/controle-orcamentario" element={<ProtectedRoute><ControleOrcamentario/></ProtectedRoute>} />
                  <Route path="/dashboard/plantas" element={<ProtectedRoute><PlantasIA/></ProtectedRoute>} />
                  
                  <Route path="/dashboard/notas" element={<ProtectedRoute><NotasLista/></ProtectedRoute>} />
                  <Route path="/dashboard/notas/:id/editar" element={<ProtectedRoute><EditarNota/></ProtectedRoute>} />
                  <Route path="/dashboard/notas/enviar" element={<ProtectedRoute><EnviarNota/></ProtectedRoute>} />
                  
                  <Route path="/settings" element={<ProtectedRoute><Settings/></ProtectedRoute>} />

                  {/* Rota de fallback */}
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
              <Toaster position="top-center" />
              <ReactQueryDevtools initialIsOpen={false} />
            </AIWidgetProvider>
          </AuthProvider>
        </LoadingProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
