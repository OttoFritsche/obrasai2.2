import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/contexts/auth/ProtectedRoutes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/providers/theme-provider";

import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NotFound from "@/pages/NotFound";
import Settings from "@/pages/Settings";
import Subscription from "@/pages/Subscription";

// Obras
import ObrasLista from "@/pages/dashboard/obras/ObrasLista";
import NovaObra from "@/pages/dashboard/obras/NovaObra";
import EditarObra from "@/pages/dashboard/obras/EditarObra";
import ObraDetalhe from "@/pages/dashboard/obras/ObraDetalhe";

// Despesas
import DespesasLista from "@/pages/dashboard/despesas/DespesasLista";
import NovaDespesa from "@/pages/dashboard/despesas/NovaDespesa";

// Fornecedores
import FornecedoresPJLista from "@/pages/dashboard/fornecedores/FornecedoresPJLista";
import FornecedoresPFLista from "@/pages/dashboard/fornecedores/FornecedoresPFLista";
import NovoFornecedor from "@/pages/dashboard/fornecedores/NovoFornecedor";

// Notas Fiscais
import NotasLista from "@/pages/dashboard/notas/NotasLista";
import EnviarNota from "@/pages/dashboard/notas/EnviarNota";

// IA
import ChatAIPage from "@/pages/dashboard/ai/Chat";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="obrasai-theme">
      <QueryClientProvider client={queryClient}>
        <Routes>
          {/* Rotas públicas */}
          <Route index element={<Index />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          
          {/* Rotas protegidas */}
          <Route path="dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="dashboard/obras" element={
            <ProtectedRoute>
              <ObrasLista />
            </ProtectedRoute>
          } />
          <Route path="dashboard/obras/nova" element={
            <ProtectedRoute>
              <NovaObra />
            </ProtectedRoute>
          } />
          <Route path="dashboard/obras/:id" element={
            <ProtectedRoute>
              <ObraDetalhe />
            </ProtectedRoute>
          } />
          <Route path="dashboard/obras/:id/editar" element={
            <ProtectedRoute>
              <EditarObra />
            </ProtectedRoute>
          } />
          
          <Route path="dashboard/despesas" element={
            <ProtectedRoute>
              <DespesasLista />
            </ProtectedRoute>
          } />
          <Route path="dashboard/despesas/nova" element={
            <ProtectedRoute>
              <NovaDespesa />
            </ProtectedRoute>
          } />
          
          <Route path="dashboard/fornecedores/pj" element={
            <ProtectedRoute>
              <FornecedoresPJLista />
            </ProtectedRoute>
          } />
          <Route path="dashboard/fornecedores/pf" element={
            <ProtectedRoute>
              <FornecedoresPFLista />
            </ProtectedRoute>
          } />
          <Route path="dashboard/fornecedores/novo" element={
            <ProtectedRoute>
              <NovoFornecedor />
            </ProtectedRoute>
          } />
          
          <Route path="dashboard/notas" element={
            <ProtectedRoute>
              <NotasLista />
            </ProtectedRoute>
          } />
          <Route path="dashboard/notas/enviar" element={
            <ProtectedRoute>
              <EnviarNota />
            </ProtectedRoute>
          } />

          {/* Novas rotas de IA */}
          <Route path="dashboard/chat" element={
            <ProtectedRoute>
              <ChatAIPage />
            </ProtectedRoute>
          } />
          
          <Route path="settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="subscription" element={
            <ProtectedRoute>
              <Subscription />
            </ProtectedRoute>
          } />
          
          {/* Rota de página não encontrada */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster position="top-center" />
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
