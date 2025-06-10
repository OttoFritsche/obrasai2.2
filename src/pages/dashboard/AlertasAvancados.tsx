import React from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { DashboardAlertasAvancados } from '@/components/AlertasAvancados';

const AlertasAvancadosPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Alertas Avançados</h1>
            <p className="text-muted-foreground">
              Sistema avançado de alertas com notificações em tempo real e configurações personalizadas
            </p>
          </div>
        </div>
        
        <DashboardAlertasAvancados />
      </div>
    </DashboardLayout>
  );
};

export default AlertasAvancadosPage;