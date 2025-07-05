/**
 * 💰 Página de Controle Orçamentário
 * 
 * Página dedicada ao controle orçamentário inteligente que diferencia:
 * - Orçamento Disponível (dinheiro investido/disponível)
 * - Orçamento Paramétrico (estimativas de gastos)
 * 
 * @author ObrasAI Team
 * @version 1.0.0
 */

import React from "react";

import AnaliseOrcamentariaInteligente from "@/components/dashboard/AnaliseOrcamentariaInteligente";
import DashboardLayout from "@/components/layouts/DashboardLayout";

const ControleOrcamentario: React.FC = () => {
  return (
    <DashboardLayout>
      <AnaliseOrcamentariaInteligente />
    </DashboardLayout>
  );
};

export default ControleOrcamentario;