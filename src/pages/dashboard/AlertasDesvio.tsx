import React from 'react';

import AlertasDesvioComponent from '@/components/dashboard/AlertasDesvio';
import DashboardLayout from '@/components/layouts/DashboardLayout';

const AlertasDesvioPage: React.FC = () => {
  return (
    <DashboardLayout>
      <AlertasDesvioComponent />
    </DashboardLayout>
  );
};

export default AlertasDesvioPage;