
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  AlertTriangle,
  Plus,
  Eye
} from 'lucide-react';
import { Sale, Product, InventoryItem } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    totalProducts: 0,
    lowStockItems: 0,
    todaySales: 0,
    todayRevenue: 0,
  });
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load sales data
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .eq('user_id', user!.id)
        .order('sale_date', { ascending: false })
        .limit(5);

      if (salesError) throw salesError;

      // Load products data
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user!.id);

      if (productsError) throw productsError;

      // Load inventory data
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory')
        .select('*')
        .eq('user_id', user!.id);

      if (inventoryError) throw inventoryError;

      // Load all sales for stats
      const { data: allSalesData, error: allSalesError } = await supabase
        .from('sales')
        .select('*')
        .eq('user_id', user!.id);

      if (allSalesError) throw allSalesError;

      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const todaySales = allSalesData?.filter(sale => 
        sale.sale_date.startsWith(today)
      ) || [];

      const lowStock = inventoryData?.filter(item => 
        item.quantity <= (item.min_stock || 0)
      ) || [];

      setStats({
        totalSales: allSalesData?.length || 0,
        totalRevenue: allSalesData?.reduce((sum, sale) => sum + (sale.sale_price * sale.quantity), 0) || 0,
        totalProducts: productsData?.length || 0,
        lowStockItems: lowStock.length,
        todaySales: todaySales.length,
        todayRevenue: todaySales.reduce((sum, sale) => sum + (sale.sale_price * sale.quantity), 0),
      });

      setRecentSales(salesData || []);
      setLowStockItems(lowStock);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do dashboard",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral do seu negócio</p>
      </div>

      {/* Stats Cards */}
      <DashboardStats stats={stats} />

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Vendas Recentes
              </span>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Ver Todas
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentSales.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Nenhuma venda registrada ainda
              </p>
            ) : (
              <div className="space-y-4">
                {recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{sale.custom_name}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(sale.sale_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">
                        R$ {(sale.sale_price * sale.quantity).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {sale.quantity} un.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Estoque Baixo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockItems.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Todos os itens estão com estoque adequado
              </p>
            ) : (
              <div className="space-y-3">
                {lowStockItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        Mínimo: {item.min_stock || 0} {item.unit}
                      </p>
                    </div>
                    <Badge variant="destructive">
                      {item.quantity} {item.unit}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button className="h-16 flex-col space-y-2">
              <Plus className="h-6 w-6" />
              <span>Nova Venda</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col space-y-2">
              <Package className="h-6 w-6" />
              <span>Novo Produto</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col space-y-2">
              <TrendingUp className="h-6 w-6" />
              <span>Relatórios</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col space-y-2">
              <AlertTriangle className="h-6 w-6" />
              <span>Estoque</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
