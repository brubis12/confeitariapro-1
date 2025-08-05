
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sale } from '@/types/database';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, Minus, Target, Award, AlertCircle } from 'lucide-react';

interface PerformanceComparisonProps {
  sales: Sale[];
}

export const PerformanceComparison: React.FC<PerformanceComparisonProps> = ({ sales }) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Dados do mês atual vs mês anterior
  const thisMonthSales = sales.filter(sale => {
    const saleDate = new Date(sale.sale_date);
    return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
  });

  const lastMonthSales = sales.filter(sale => {
    const saleDate = new Date(sale.sale_date);
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    return saleDate.getMonth() === lastMonth && saleDate.getFullYear() === lastMonthYear;
  });

  // Semana atual vs semana anterior
  const getWeekOfYear = (date: Date) => {
    const start = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + start.getDay() + 1) / 7);
  };

  const currentWeek = getWeekOfYear(now);
  const thisWeekSales = sales.filter(sale => getWeekOfYear(new Date(sale.sale_date)) === currentWeek);
  const lastWeekSales = sales.filter(sale => getWeekOfYear(new Date(sale.sale_date)) === currentWeek - 1);

  const calculateMetrics = (salesData: Sale[]) => ({
    count: salesData.length,
    revenue: salesData.reduce((sum, sale) => sum + sale.sale_price * sale.quantity, 0),
    profit: salesData.reduce((sum, sale) => sum + (sale.profit || 0), 0),
    averageTicket: salesData.length > 0 ? salesData.reduce((sum, sale) => sum + sale.sale_price * sale.quantity, 0) / salesData.length : 0,
    customers: new Set(salesData.map(sale => sale.customer_name).filter(Boolean)).size
  });

  const thisMonthMetrics = calculateMetrics(thisMonthSales);
  const lastMonthMetrics = calculateMetrics(lastMonthSales);
  const thisWeekMetrics = calculateMetrics(thisWeekSales);
  const lastWeekMetrics = calculateMetrics(lastWeekSales);

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 5) return { icon: ArrowUp, color: 'text-green-500', bg: 'bg-green-100' };
    if (growth < -5) return { icon: ArrowDown, color: 'text-red-500', bg: 'bg-red-100' };
    return { icon: Minus, color: 'text-gray-500', bg: 'bg-gray-100' };
  };

  const monthlyComparisons = [
    {
      label: 'Vendas',
      current: thisMonthMetrics.count,
      previous: lastMonthMetrics.count,
      format: (val: number) => val.toString()
    },
    {
      label: 'Receita',
      current: thisMonthMetrics.revenue,
      previous: lastMonthMetrics.revenue,
      format: (val: number) => `R$ ${val.toFixed(2)}`
    },
    {
      label: 'Lucro',
      current: thisMonthMetrics.profit,
      previous: lastMonthMetrics.profit,
      format: (val: number) => `R$ ${val.toFixed(2)}`
    },
    {
      label: 'Ticket Médio',
      current: thisMonthMetrics.averageTicket,
      previous: lastMonthMetrics.averageTicket,
      format: (val: number) => `R$ ${val.toFixed(2)}`
    }
  ];

  const weeklyComparisons = [
    {
      label: 'Vendas',
      current: thisWeekMetrics.count,
      previous: lastWeekMetrics.count,
      format: (val: number) => val.toString()
    },
    {
      label: 'Receita',
      current: thisWeekMetrics.revenue,
      previous: lastWeekMetrics.revenue,
      format: (val: number) => `R$ ${val.toFixed(2)}`
    }
  ];

  return (
    <div className="space-y-6">
      {/* Comparação Mensal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2 text-blue-500" />
            Comparação Mensal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {monthlyComparisons.map((item, index) => {
              const growth = calculateGrowth(item.current, item.previous);
              const { icon: GrowthIcon, color, bg } = getGrowthIcon(growth);
              
              return (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">{item.label}</span>
                    <div className={`p-1 rounded-full ${bg}`}>
                      <GrowthIcon className={`h-3 w-3 ${color}`} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-gray-900">
                      {item.format(item.current)}
                    </div>
                    <div className="text-xs text-gray-500">
                      vs. {item.format(item.previous)} (mês anterior)
                    </div>
                    <Badge variant={growth >= 0 ? "default" : "destructive"} className="text-xs">
                      {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Comparação Semanal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2 text-green-500" />
            Comparação Semanal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weeklyComparisons.map((item, index) => {
              const growth = calculateGrowth(item.current, item.previous);
              const { icon: GrowthIcon, color, bg } = getGrowthIcon(growth);
              
              return (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">{item.label}</span>
                    <div className={`p-1 rounded-full ${bg}`}>
                      <GrowthIcon className={`h-3 w-3 ${color}`} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-gray-900">
                      {item.format(item.current)}
                    </div>
                    <div className="text-xs text-gray-500">
                      vs. {item.format(item.previous)} (semana anterior)
                    </div>
                    <Badge variant={growth >= 0 ? "default" : "destructive"} className="text-xs">
                      {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Alertas e Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-orange-500" />
            Insights e Alertas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {thisMonthMetrics.revenue > lastMonthMetrics.revenue ? (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <ArrowUp className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-800">
                    Ótimo desempenho! Receita mensal cresceu {calculateGrowth(thisMonthMetrics.revenue, lastMonthMetrics.revenue).toFixed(1)}%
                  </span>
                </div>
              </div>
            ) : thisMonthMetrics.revenue < lastMonthMetrics.revenue && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <ArrowDown className="h-4 w-4 text-red-600 mr-2" />
                  <span className="text-sm font-medium text-red-800">
                    Atenção: Receita mensal reduziu {Math.abs(calculateGrowth(thisMonthMetrics.revenue, lastMonthMetrics.revenue)).toFixed(1)}%
                  </span>
                </div>
              </div>
            )}

            {thisMonthMetrics.averageTicket > lastMonthMetrics.averageTicket && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <Target className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-800">
                    Ticket médio aumentou! Agora está em R$ {thisMonthMetrics.averageTicket.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {thisMonthMetrics.customers > lastMonthMetrics.customers && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center">
                  <Award className="h-4 w-4 text-purple-600 mr-2" />
                  <span className="text-sm font-medium text-purple-800">
                    Crescimento da base de clientes: {thisMonthMetrics.customers - lastMonthMetrics.customers} novos clientes este mês
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
