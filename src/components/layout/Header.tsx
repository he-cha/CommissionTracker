import { Smartphone, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuthStore } from '../../stores/authStore';

export function Header() {
  const { username, logout } = useAuthStore();

  return (
    <header className="border-b border-border/50 bg-gradient-to-r from-card to-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-lg blur-md opacity-50"></div>
              <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
                <Smartphone className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Boost Mobile
              </h1>
              <p className="text-xs text-muted-foreground">Commission Tracker</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-foreground">{username}</p>
              <p className="text-xs text-muted-foreground">Store Owner</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
            >
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
