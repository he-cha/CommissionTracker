import { useState, useMemo, useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import { useSalesStore } from './stores/salesStore';
import { LoginPage } from './components/features/LoginPage';
import { Header } from './components/layout/Header';
import { Dashboard } from './components/features/Dashboard';
import { AddSaleForm } from './components/features/AddSaleForm';
import { SalesTable } from './components/features/SalesTable';
import { BountyAlerts } from './components/features/BountyAlerts';
import { BountyUpdate } from './components/features/BountyUpdate';
import { EditSaleForm } from './components/features/EditSaleForm';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Toaster } from './components/ui/toaster';
import { LayoutDashboard, Plus, Table, Bell } from 'lucide-react';

type View = 'dashboard' | 'add-sale' | 'sales-list' | 'alerts' | 'bounty-update' | 'edit-sale';

interface ViewState {
  view: View;
  saleId?: string;
  monthNumber?: number;
}

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const sales = useSalesStore((state) => state.sales);
  const fetchSales = useSalesStore((state) => state.fetchSales);
  const [viewState, setViewState] = useState<ViewState>({ view: 'dashboard' });

  // Check authentication on app start
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Fetch sales when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchSales();
    }
  }, [isAuthenticated, fetchSales]);

  const setView = (view: View, saleId?: string, monthNumber?: number) => {
    setViewState({ view, saleId, monthNumber });
  };

  // Calculate overdue alerts count
  const overdueAlertsCount = useMemo(() => {
    let count = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    sales.forEach((sale) => {
      if (sale.status === 'deactivated') return;

      const activationDate = new Date(sale.activationDate);
      
      for (let month = 1; month <= 6; month++) {
        const bountyMonth = sale.bountyTracking.find(bt => bt.monthNumber === month);
        
        const checkDate = new Date(activationDate);
        checkDate.setDate(checkDate.getDate() + (35 * month));
        checkDate.setHours(0, 0, 0, 0);

        const daysUntilCheck = Math.ceil((checkDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        // Count if overdue and unpaid
        if (daysUntilCheck < 0 && !bountyMonth?.paid) {
          count++;
        }
      }
    });

    return count;
  }, [sales]);

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage />
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-secondary">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        {/* Navigation - Hide when in bounty update or edit sale view */}
        {viewState.view !== 'bounty-update' && viewState.view !== 'edit-sale' && (
          <div className="mb-6 flex flex-wrap gap-2">
            <Button
              variant={viewState.view === 'dashboard' ? 'default' : 'outline'}
              onClick={() => setView('dashboard')}
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button
              variant={viewState.view === 'add-sale' ? 'default' : 'outline'}
              onClick={() => setView('add-sale')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Sale
            </Button>
            <Button
              variant={viewState.view === 'sales-list' ? 'default' : 'outline'}
              onClick={() => setView('sales-list')}
            >
              <Table className="h-4 w-4 mr-2" />
              Sales List
            </Button>
            <Button
              variant={viewState.view === 'alerts' ? 'default' : 'outline'}
              onClick={() => setView('alerts')}
              className="relative"
            >
              <Bell className="h-4 w-4 mr-2" />
              Alerts
              {overdueAlertsCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="ml-2 h-5 min-w-5 px-1.5 text-xs font-bold"
                >
                  {overdueAlertsCount}
                </Badge>
              )}
            </Button>
          </div>
        )}

        {/* Content */}
        <div className="space-y-6">
          {viewState.view === 'dashboard' && <Dashboard />}
          {viewState.view === 'add-sale' && <AddSaleForm />}
          {viewState.view === 'sales-list' && (
            <SalesTable onEditSale={(saleId) => setView('edit-sale', saleId)} />
          )}
          {viewState.view === 'alerts' && (
            <BountyAlerts onCheckNow={(saleId, monthNumber) => setView('bounty-update', saleId, monthNumber)} />
          )}
          {viewState.view === 'bounty-update' && viewState.saleId && viewState.monthNumber && (
            <BountyUpdate 
              saleId={viewState.saleId} 
              monthNumber={viewState.monthNumber}
              onBack={() => setView('alerts')}
            />
          )}
          {viewState.view === 'edit-sale' && viewState.saleId && (
            <EditSaleForm 
              saleId={viewState.saleId}
              onBack={() => setView('sales-list')}
            />
          )}
        </div>
      </div>

      <Toaster />
    </div>
  );
}

export default App;
