import { useState } from 'react';
import { useAuthStore } from './stores/authStore';
import { LoginPage } from './components/features/LoginPage';
import { Header } from './components/layout/Header';
import { Dashboard } from './components/features/Dashboard';
import { AddSaleForm } from './components/features/AddSaleForm';
import { SalesTable } from './components/features/SalesTable';
import { BountyCalendar } from './components/features/BountyCalendar';
import { BountyAlerts } from './components/features/BountyAlerts';
import { Button } from './components/ui/button';
import { Toaster } from './components/ui/toaster';
import { LayoutDashboard, Plus, Table, Calendar, Bell } from 'lucide-react';

type View = 'dashboard' | 'add-sale' | 'sales-list' | 'bounty-calendar' | 'alerts';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [currentView, setCurrentView] = useState<View>('dashboard');

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
        {/* Navigation */}
        <div className="mb-6 flex flex-wrap gap-2">
          <Button
            variant={currentView === 'dashboard' ? 'default' : 'outline'}
            onClick={() => setCurrentView('dashboard')}
          >
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <Button
            variant={currentView === 'add-sale' ? 'default' : 'outline'}
            onClick={() => setCurrentView('add-sale')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Sale
          </Button>
          <Button
            variant={currentView === 'sales-list' ? 'default' : 'outline'}
            onClick={() => setCurrentView('sales-list')}
          >
            <Table className="h-4 w-4 mr-2" />
            Sales List
          </Button>
          <Button
            variant={currentView === 'bounty-calendar' ? 'default' : 'outline'}
            onClick={() => setCurrentView('bounty-calendar')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Bounty Tracker
          </Button>
          <Button
            variant={currentView === 'alerts' ? 'default' : 'outline'}
            onClick={() => setCurrentView('alerts')}
          >
            <Bell className="h-4 w-4 mr-2" />
            Alerts
          </Button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'add-sale' && <AddSaleForm />}
          {currentView === 'sales-list' && <SalesTable />}
          {currentView === 'bounty-calendar' && <BountyCalendar />}
          {currentView === 'alerts' && <BountyAlerts />}
        </div>
      </div>

      <Toaster />
    </div>
  );
}

export default App;
