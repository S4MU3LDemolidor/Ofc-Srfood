import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  ChefHat, 
  Users, 
  FileText, 
  Plus,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface LayoutProps {
  children: ReactNode;
}

interface NavItemProps {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive?: boolean;
}

function NavItem({ to, icon: Icon, label, isActive }: NavItemProps) {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-smooth",
        isActive 
          ? "bg-primary text-primary-foreground shadow-elegant" 
          : "text-muted-foreground hover:text-foreground hover:bg-accent"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navigation = [
    { to: '/', icon: ChefHat, label: 'Dashboard' },
    { to: '/clientes', icon: Users, label: 'Clientes' },
    { to: '/nova-receita', icon: Plus, label: 'Nova Receita' },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Mobile menu button */}
      <div className="md:hidden bg-card border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChefHat className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">SrFoodSafety</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          "w-64 bg-card border-r shadow-card transition-transform duration-300",
          "hidden md:block",
          isMobileMenuOpen && "block absolute inset-y-0 left-0 z-50 md:relative"
        )}>
          <div className="p-6 border-b">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <ChefHat className="h-8 w-8 text-primary" />
                <span className="text-primary font-bold text-xs">Sr.</span>
              </div>
              <div>
                <h1 className="font-bold text-xl text-primary">SrFoodSafety</h1>
                <p className="text-xs text-muted-foreground">Sistema de Fichas Técnicas</p>
              </div>
            </Link>
          </div>
          
          <nav className="p-4 space-y-2">
            {navigation.map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                isActive={location.pathname === item.to}
              />
            ))}
          </nav>
        </aside>

        {/* Mobile menu overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-background/80 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 min-h-screen">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}