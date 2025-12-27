import { useState } from 'react';
import { useAuthStore } from './stores/authStore';
import { LoginPage } from './components/features/LoginPage';
import { Header } from './components/layout/Header';
import { Dashboard } from './components/features/Dashboard';
import { AddSaleForm } from './components/features/AddSaleForm';
import { SalesTable } from './components/features/SalesTable';
import { BountyCalendar } from './components/features/BountyCalendar';
import { BountyAlerts } from './components/features/BountyAlerts';
import { BountyUpdate } from './components/features/BountyUpdate';
import { Button } from './components/ui/button';
import { Toaster } from './components/ui/toaster';
import { LayoutDashboard, Plus, Table, Calendar, Bell } from 'lucide-react';

type View = 'dashboard' | 'add-sale' | 'sales-list' | 'bounty-calendar' | 'alerts' | 'bounty-update';

interface ViewState {
  view: View;
  saleId?: string;
  monthNumber?: number;
}

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [viewState, setViewState] = useState<ViewState>({ view: 'dashboard' });

  const setView = (view: View, saleId?: string, monthNumber?: number) => {
    setViewState({ view, saleId, monthNumber });
  };

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
        {/* Navigation - Hide when in bounty update view */}
        {viewState.view !== 'bounty-update' && (
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
              variant={viewState.view === 'bounty-calendar' ? 'default' : 'outline'}
              onClick={() => setView('bounty-calendar')}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Bounty Tracker
            </Button>
            <Button
              variant={viewState.view === 'alerts' ? 'default' : 'outline'}
              onClick={() => setView('alerts')}
            >
              <Bell className="h-4 w-4 mr-2" />
              Alerts
            </Button>
          </div>
        )}

        {/* Content */}
        <div className="space-y-6">
          {viewState.view === 'dashboard' && <Dashboard />}
          {viewState.view === 'add-sale' && <AddSaleForm />}
          {viewState.view === 'sales-list' && <SalesTable />}
          {viewState.view === 'bounty-calendar' && <BountyCalendar />}
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
        </div>
      </div>

      <Toaster />
    </div>
  );
}

export default App;
