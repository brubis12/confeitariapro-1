import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Sale, Product } from '@/types/database';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { MetricsSummary } from '@/components/reports/MetricsSummary';
import { ReportsCharts } from '@/components/reports/ReportsCharts';
import { SalesAnalysis } from '@/components/reports/SalesAnalysis';
import { ProductAnalysis } from '@/components/reports/ProductAnalysis';
import { TimeAnalysis } from '@/components/reports/TimeAnalysis';
import { PerformanceComparison } from '@/components/reports/PerformanceComparison';
import { useToast } from '@/hooks/use-toast';
import { BarChart3, Calendar, Download, Filter, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const Reports: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
    end: new Date()
  });
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | 'custom'>('7d');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, dateRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load sales data
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .eq('user_id', user!.id)
        .gte('sale_date', dateRange.start.toISOString())
        .lte('sale_date', dateRange.end.toISOString())
        .order('sale_date', { ascending: false });

      if (salesError) throw salesError;
      setSales(salesData || []);

      // Load products data
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user!.id);

      if (productsError) throw productsError;
      setProducts(productsData || []);

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do relatório",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (period: typeof selectedPeriod) => {
    setSelectedPeriod(period);
    const now = new Date();
    
    switch (period) {
      case '7d':
        setDateRange({
          start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          end: now
        });
        break;
      case '30d':
        setDateRange({
          start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          end: now
        });
        break;
      case '90d':
        setDateRange({
          start: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
          end: now
        });
        break;
    }
  };

  const exportData = () => {
    const csvData = sales.map(sale => ({
      Data: new Date(sale.sale_date).toLocaleDateString('pt-BR'),
      Produto: sale.custom_name,
      Cliente: sale.customer_name || 'N/A',
      Quantidade: sale.quantity,
      'Preço Unitário': sale.sale_price,
      Total: sale.sale_price * sale.quantity,
      Lucro: sale.profit || 0,
      'Método Pagamento': sale.payment_method || 'N/A',
      Status: sale.status
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_vendas_${dateRange.start.toISOString().split('T')[0]}_${dateRange.end.toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="h-8 w-8 mr-3 text-blue-600" />
            Relatórios e Análises
          </h1>
          <p className="text-gray-600 mt-1">Análise completa do desempenho do seu negócio</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={loadData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Period Selection */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-500" />
          <span className="text-sm font-medium">Período de Análise:</span>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d', 'custom'] as const).map(period => (
            <Button
              key={period}
              variant={selectedPeriod === period ? "default" : "outline"}
              size="sm"
              onClick={() => handlePeriodChange(period)}
            >
              {period === '7d' && '7 dias'}
              {period === '30d' && '30 dias'}
              {period === '90d' && '90 dias'}
              {period === 'custom' && 'Personalizado'}
            </Button>
          ))}
        </div>
        {selectedPeriod === 'custom' && (
          <div className="flex items-center gap-2">
            <DatePicker
              date={dateRange.start}
              onDateChange={(date) => setDateRange(prev => ({ ...prev, start: date || prev.start }))}
            />
            <span>até</span>
            <DatePicker
              date={dateRange.end}
              onDateChange={(date) => setDateRange(prev => ({ ...prev, end: date || prev.end }))}
            />
          </div>
        )}
      </div>

      {/* Resumo de Métricas */}
      <MetricsSummary sales={sales} />

      {/* Tabs para organizar os relatórios */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="sales">Vendas</TabsTrigger>
          <TabsTrigger value="time">Temporal</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-6">
            <ReportsCharts sales={sales} />
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceComparison sales={sales} />
        </TabsContent>

        <TabsContent value="products">
          <ProductAnalysis products={products} sales={sales} />
        </TabsContent>

        <TabsContent value="sales">
          <SalesAnalysis sales={sales} />
        </TabsContent>

        <TabsContent value="time">
          <TimeAnalysis sales={sales} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
