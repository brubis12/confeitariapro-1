
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sale } from '@/types/database';
import { TrendingUp, DollarSign, ShoppingCart, Users, Target, Percent } from 'lucide-react';

interface MetricsSummaryProps {
  sales: Sale[];
}

export const MetricsSummary: React.FC<MetricsSummaryProps> = ({ sales }) => {
  const today = new Date();
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Vendas de hoje e ontem
  const todaySales = sales.filter(sale => 
    new Date(sale.sale_date).toDateString() === today.toDateString()
  );
  const yesterdaySales = sales.filter(sale => 
    new Date(sale.sale_date).toDateString() === yesterday.toDateString()
  );

  // Métricas principais
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.sale_price * sale.quantity, 0);
  const totalProfit = sales.reduce((sum, sale) => sum + (sale.profit || 0), 0);
  const totalCost = sales.reduce((sum, sale) => sum + sale.total_cost, 0);
  const averageTicket = sales.length > 0 ? totalRevenue / sales.length : 0;
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  
  // Vendas de hoje vs ontem
  const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.sale_price * sale.quantity, 0);
  const yesterdayRevenue = yesterdaySales.reduce((sum, sale) => sum + sale.sale_price * sale.quantity, 0);
  const dailyGrowth = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0;

  // Clientes únicos
  const uniqueCustomers = new Set(sales.map(sale => sale.customer_name).filter(Boolean)).size;

  const metrics = [
    {
      title: "Receita Total",
      value: `R$ ${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: `${sales.length} vendas realizadas`
    },
    {
      title: "Lucro Total",
      value: `R$ ${totalProfit.toFixed(2)}`,
      icon: TrendingUp,
      color: "text-blue-600", 
      bgColor: "bg-blue-50",
      description: `Margem: ${profitMargin.toFixed(1)}%`
    },
    {
      title: "Ticket Médio",
      value: `R$ ${averageTicket.toFixed(2)}`,
      icon: ShoppingCart,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "Por venda realizada"
    },
    {
      title: "Clientes Únicos",
      value: uniqueCustomers.toString(),
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      description: "Clientes cadastrados"
    },
    {
      title: "Crescimento Diário",
      value: `${dailyGrowth >= 0 ? '+' : ''}${dailyGrowth.toFixed(1)}%`,
      icon: Target,
      color: dailyGrowth >= 0 ? "text-green-600" : "text-red-600",
      bgColor: dailyGrowth >= 0 ? "bg-green-50" : "bg-red-50",
      description: "vs. ontem"
    },
    {
      title: "Margem de Lucro",
      value: `${profitMargin.toFixed(1)}%`,
      icon: Percent,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      description: `Custo: R$ ${totalCost.toFixed(2)}`
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index} className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
                <p className="text-xs text-gray-500">{metric.description}</p>
              </div>
              <div className={`p-3 rounded-full ${metric.bgColor}`}>
                <metric.icon className={`h-6 w-6 ${metric.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
