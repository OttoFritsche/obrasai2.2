/**
 * 🏗️ Modal para Seleção de Obra
 * 
 * Modal reutilizável que permite ao usuário selecionar uma obra
 * antes de criar um orçamento paramétrico.
 * 
 * @author ObrasAI Team
 * @version 1.0.0
 */

import { motion } from "framer-motion";
import { Building, MapPin, Search, X } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useObras } from "@/hooks/useObras";
import { formatCurrencyBR } from "@/lib/i18n";
import { cn } from "@/lib/utils";

// ====================================
// 🎯 TIPOS E INTERFACES
// ====================================

interface SelecionarObraModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  returnPath?: string;
  title?: string;
  description?: string;
}

interface ObraCardProps {
  obra: {
    id: string;
    nome: string;
    cidade: string;
    estado: string;
    orcamento: number;
    data_inicio?: string;
    construtora_id?: string;
  };
  onSelect: (obraId: string) => void;
}

// ====================================
// 🧩 SUB-COMPONENTES
// ====================================

const ObraCard: React.FC<ObraCardProps> = ({ obra, onSelect }) => {
  const hasStarted = obra.data_inicio && new Date(obra.data_inicio) <= new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <button
        onClick={() => onSelect(obra.id)}
        className={cn(
          "w-full p-4 text-left rounded-lg border transition-all duration-200",
          "hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-900/20",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Nome da Obra */}
            <div className="flex items-center gap-2 mb-2">
              <Building className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                {obra.nome}
              </h3>
            </div>

            {/* Localização */}
            <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 mb-2">
              <MapPin className="h-3 w-3" />
              <span>{obra.cidade}, {obra.estado}</span>
            </div>

            {/* Orçamento */}
            <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              {formatCurrencyBR(obra.orcamento)}
            </div>
          </div>

          {/* Status */}
          <div className="flex flex-col items-end gap-2">
            <Badge 
              variant={hasStarted ? "default" : "secondary"}
              className={cn(
                hasStarted 
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" 
                  : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
              )}
            >
              {hasStarted ? "Em Andamento" : "Planejada"}
            </Badge>
          </div>
        </div>
      </button>
    </motion.div>
  );
};

// ====================================
// 🏗️ COMPONENTE PRINCIPAL
// ====================================

export const SelecionarObraModal: React.FC<SelecionarObraModalProps> = ({
  open,
  onOpenChange,
  returnPath = "/dashboard/obras",
  title = "Selecionar Obra",
  description = "Escolha a obra para criar o orçamento paramétrico"
}) => {
  const navigate = useNavigate();
  const { obras, isLoading } = useObras();
  const [busca, setBusca] = useState("");

  // ====================================
  // 🔍 FILTRO DE OBRAS
  // ====================================

  const obrasFiltradas = obras?.filter(obra => 
    obra.nome.toLowerCase().includes(busca.toLowerCase()) ||
    obra.cidade.toLowerCase().includes(busca.toLowerCase()) ||
    obra.estado.toLowerCase().includes(busca.toLowerCase())
  ) || [];

  // ====================================
  // 🎯 HANDLERS
  // ====================================

  const handleSelecionarObra = (obraId: string) => {
    onOpenChange(false);
    navigate(`/dashboard/orcamentos/novo?obra_id=${obraId}&return=${returnPath}`);
  };

  const handleClose = () => {
    setBusca("");
    onOpenChange(false);
  };

  // ====================================
  // 🎨 RENDER
  // ====================================

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Building className="h-5 w-5 text-blue-500" />
                {title}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {description}
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-6 w-6 rounded-md"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Campo de Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por nome, cidade ou estado..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Lista de Obras */}
          <ScrollArea className="h-[400px] pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : obrasFiltradas.length > 0 ? (
              <div className="space-y-3">
                {obrasFiltradas.map((obra) => (
                  <ObraCard
                    key={obra.id}
                    obra={obra}
                    onSelect={handleSelecionarObra}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Building className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400">
                  {busca ? "Nenhuma obra encontrada" : "Nenhuma obra cadastrada"}
                </p>
                {!busca && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleClose();
                      navigate("/dashboard/obras/nova");
                    }}
                    className="mt-4"
                  >
                    Cadastrar Nova Obra
                  </Button>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {obrasFiltradas.length} obra{obrasFiltradas.length !== 1 ? 's' : ''} encontrada{obrasFiltradas.length !== 1 ? 's' : ''}
            </p>
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SelecionarObraModal;