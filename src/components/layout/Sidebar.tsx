import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/contexts/PlanContext';
import {
  Home,
  ChefHat,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  Crown,
  Cake,
  Box,
  Factory,
  Users,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Receitas', href: '/recipes', icon: ChefHat },
  { name: 'Produtos', href: '/products', icon: Package },
  { name: 'Estoque', href: '/inventory', icon: Box },
  { name: 'Vendas', href: '/sales', icon: ShoppingCart },
  { name: 'Relatórios', href: '/reports', icon: BarChart3 },
  { name: 'Produção', href: '/production', icon: Factory, premium: true },
  { name: 'Fidelidade', href: '/loyalty', icon: Users, premium: true },
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();
  const { currentPlan, canUseFeature } = usePlan();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Cake className="h-8 w-8 text-pink-500" />
          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold text-gray-900">ConfeiFlow</h1>
              <p className="text-xs text-gray-500 capitalize">Plano {currentPlan}</p>
            </div>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-2 py-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const canAccess = item.premium ? canUseFeature('has_production_center') : true;

            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                  isActive
                    ? "bg-pink-50 text-pink-700 border-pink-200"
                    : "text-gray-700 hover:bg-gray-50",
                  !canAccess && "opacity-50 cursor-not-allowed"
                )}
                onClick={!canAccess ? (e) => e.preventDefault() : undefined}
              >
                <item.icon className="h-5 w-5" />
                {!collapsed && (
                  <span className="flex-1">{item.name}</span>
                )}
                {!collapsed && item.premium && !canAccess && (
                  <Crown className="h-4 w-4 text-yellow-500" />
                )}
              </Link>
            );
          })}
        </div>

        <Separator />

        <div className="space-y-2 py-4">
          <Link
            to="/settings"
            className={cn(
              "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
              location.pathname === '/settings'
                ? "bg-pink-50 text-pink-700"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            <Settings className="h-5 w-5" />
            {!collapsed && <span>Configurações</span>}
          </Link>

          {currentPlan === 'free' && (
            <Link
              to="/upgrade"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-yellow-700 hover:bg-yellow-50 transition-colors"
            >
              <Crown className="h-5 w-5" />
              {!collapsed && <span>Upgrade</span>}
            </Link>
          )}

          <Button
            variant="ghost"
            className="w-full justify-start space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span>Sair</span>}
          </Button>
        </div>
      </ScrollArea>

      {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-gray-900">
              {profile?.full_name || 'Usuário'}
            </p>
            <p className="text-xs text-gray-500">
              {profile?.plan === 'free' ? 'Plano Gratuito' : 
               profile?.plan === 'basic' ? 'Plano Básico' : 
               'Plano Premium'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
