import React from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import AlertasDesvioComponent from '@/components/dashboard/AlertasDesvio';

const AlertasDesvioPage: React.FC = () => {
  return (
    <DashboardLayout>
      <AlertasDesvioComponent />
    </DashboardLayout>
  );
};

export default AlertasDesvioPage;