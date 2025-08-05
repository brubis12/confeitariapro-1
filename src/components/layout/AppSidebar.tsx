
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/contexts/PlanContext';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarSeparator, SidebarRail, useSidebar } from '@/components/ui/sidebar';
import { Home, ChefHat, Package, ShoppingCart, BarChart3, Settings, Crown, Cake, Box, Factory, Users, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';

const navigation = [{
  name: 'Dashboard',
  href: '/dashboard',
  icon: Home
}, {
  name: 'Receitas',
  href: '/recipes',
  icon: ChefHat
}, {
  name: 'Produtos',
  href: '/products',
  icon: Package
}, {
  name: 'Estoque',
  href: '/inventory',
  icon: Box
}, {
  name: 'Vendas',
  href: '/sales',
  icon: ShoppingCart
}, {
  name: 'Relatórios',
  href: '/reports',
  icon: BarChart3
}, {
  name: 'Produção',
  href: '/production',
  icon: Factory,
  premium: true
}, {
  name: 'Fidelidade',
  href: '/loyalty',
  icon: Users,
  premium: true
}];

export const AppSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    signOut,
    profile
  } = useAuth();
  const {
    currentPlan,
    canUseFeature
  } = usePlan();
  const {
    state,
    toggleSidebar
  } = useSidebar();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar 
      variant="sidebar" 
      collapsible="icon"
      className="border-r border-sidebar-border"
    >
      <SidebarHeader className="p-3 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <Cake className="h-6 w-6 text-pink-500 shrink-0" />
          {!isCollapsed && (
            <div className="min-w-0">
              <h1 className="text-base font-bold text-sidebar-foreground truncate">ConfeiFlow</h1>
              <p className="text-xs text-sidebar-foreground/70 capitalize truncate">Plano {currentPlan}</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/70 mb-1">
            {!isCollapsed && 'Menu Principal'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigation.map(item => {
                const isActive = location.pathname === item.href;
                const canAccess = item.premium ? canUseFeature('has_production_center') : true;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive} 
                      className={cn(
                        "h-8 rounded-md transition-all duration-200",
                        isCollapsed ? "w-8 h-8 p-0 justify-center" : "px-2", 
                        !canAccess && "opacity-50 cursor-not-allowed"
                      )} 
                      tooltip={isCollapsed ? item.name : undefined}
                    >
                      <Link 
                        to={item.href} 
                        onClick={!canAccess ? e => e.preventDefault() : undefined} 
                        className={cn(
                          "flex items-center w-full",
                          isCollapsed ? "justify-center" : "gap-2"
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!isCollapsed && (
                          <>
                            <span className="flex-1 truncate text-sm">
                              {item.name}
                            </span>
                            {item.premium && !canAccess && (
                              <Crown className="h-3 w-3 text-yellow-500 shrink-0" />
                            )}
                          </>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-3" />

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={location.pathname === '/settings'} 
                  tooltip={isCollapsed ? 'Configurações' : undefined} 
                  className={cn(
                    "h-8 rounded-md transition-all duration-200",
                    isCollapsed ? "w-8 h-8 p-0 justify-center" : "px-2"
                  )}
                >
                  <Link 
                    to="/settings" 
                    className={cn(
                      "flex items-center w-full",
                      isCollapsed ? "justify-center" : "gap-2"
                    )}
                  >
                    <Settings className="h-4 w-4 shrink-0" />
                    {!isCollapsed && (
                      <span className="truncate text-sm">
                        Configurações
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {currentPlan === 'free' && (
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    tooltip={isCollapsed ? 'Upgrade' : undefined} 
                    className={cn(
                      "h-8 rounded-md text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 transition-all duration-200",
                      isCollapsed ? "w-8 h-8 p-0 justify-center" : "px-2"
                    )}
                  >
                    <Link 
                      to="/upgrade" 
                      className={cn(
                        "flex items-center w-full",
                        isCollapsed ? "justify-center" : "gap-2"
                      )}
                    >
                      <Crown className="h-4 w-4 shrink-0" />
                      {!isCollapsed && (
                        <span className="truncate text-sm">
                          Upgrade
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={handleSignOut} 
                  tooltip={isCollapsed ? 'Sair' : undefined} 
                  className={cn(
                    "h-8 rounded-md transition-all duration-200",
                    isCollapsed ? "w-8 h-8 p-0 justify-center" : "px-2"
                  )}
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  {!isCollapsed && (
                    <span className="truncate text-sm">
                      Sair
                    </span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {!isCollapsed && profile && (
        <SidebarFooter className="p-2 border-t border-sidebar-border">
          <div className="text-center space-y-1">
            <p className="text-xs font-medium text-sidebar-foreground truncate">
              {profile.full_name || 'Usuário'}
            </p>
            <p className="text-xs text-sidebar-foreground/70 truncate">
              {profile.plan === 'free' ? 'Plano Gratuito' : profile.plan === 'basic' ? 'Plano Básico' : 'Plano Premium'}
            </p>
          </div>
        </SidebarFooter>
      )}

      {/* Botão de toggle com bolinha e seta */}
      <Button 
        onClick={toggleSidebar} 
        size="sm" 
        variant="outline" 
        className="absolute -right-3 top-6 h-6 w-6 rounded-full border border-border bg-background p-0 shadow-md hover:bg-accent z-10 transition-transform duration-200"
      >
        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>

      <SidebarRail />
    </Sidebar>
  );
};
