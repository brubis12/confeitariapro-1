
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sale } from '@/types/database';
import { TrendingUp, TrendingDown, Clock, Users } from 'lucide-react';

interface SalesAnalysisProps {
  sales: Sale[];
}

export const SalesAnalysis: React.FC<SalesAnalysisProps> = ({ sales }) => {
  const today = new Date();
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const todaySales = sales.filter(sale => 
    new Date(sale.sale_date).toDateString() === today.toDateString()
  );
  
  const yesterdaySales = sales.filter(sale => 
    new Date(sale.sale_date).toDateString() === yesterday.toDateString()
  );

  const weekSales = sales.filter(sale => 
    new Date(sale.sale_date) >= lastWeek
  );

  const monthSales = sales.filter(sale => 
    new Date(sale.sale_date) >= lastMonth
  );

  const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.sale_price * sale.quantity, 0);
  const yesterdayRevenue = yesterdaySales.reduce((sum, sale) => sum + sale.sale_price * sale.quantity, 0);
  const weekRevenue = weekSales.reduce((sum, sale) => sum + sale.sale_price * sale.quantity, 0);
  const monthRevenue = monthSales.reduce((sum, sale) => sum + sale.sale_price * sale.quantity, 0);

  const revenueGrowth = yesterdayRevenue > 0 ? 
    ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0;

  const uniqueCustomers = new Set(sales.map(sale => sale.customer_name).filter(Boolean)).size;
  
  const averageOrderValue = sales.length > 0 ? 
    sales.reduce((sum, sale) => sum + sale.sale_price * sale.quantity, 0) / sales.length : 0;

  const bestSellingHours = sales.reduce((acc, sale) => {
    const hour = new Date(sale.sale_date).getHours();
    if (!acc[hour]) acc[hour] = 0;
    acc[hour]++;
    return acc;
  }, {} as Record<number, number>);

  const peakHour = Object.entries(bestSellingHours)
    .sort(([,a], [,b]) => b - a)[0];

  const paymentMethods = sales.reduce((acc, sale) => {
    const method = sale.payment_method || 'Não informado';
    if (!acc[method]) acc[method] = 0;
    acc[method]++;
    return acc;
  }, {} as Record<string, number>);

  const topPaymentMethod = Object.entries(paymentMethods)
    .sort(([,a], [,b]) => b - a)[0];

  // Análise por faixa de valor (ao invés de nome)
  const salesByValueRange = sales.reduce((acc, sale) => {
    const totalValue = sale.sale_price * sale.quantity;
    let range: string;
    
    if (totalValue <= 10) range = 'Até R$ 10';
    else if (totalValue <= 25) range = 'R$ 10 - R$ 25';
    else if (totalValue <= 50) range = 'R$ 25 - R$ 50';
    else if (totalValue <= 100) range = 'R$ 50 - R$ 100';
    else range = 'Acima de R$ 100';
    
    if (!acc[range]) acc[range] = { count: 0, revenue: 0 };
    acc[range].count++;
    acc[range].revenue += totalValue;
    return acc;
  }, {} as Record<string, { count: number; revenue: number }>);

  const topValueRange = Object.entries(salesByValueRange)
    .sort(([,a], [,b]) => b.count - a.count)[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análise de Vendas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Crescimento da Receita */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600">Crescimento da Receita (vs. ontem)</p>
            <p className="text-2xl font-bold text-gray-900">
              {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth.toFixed(1)}%
            </p>
          </div>
          {revenueGrowth >= 0 ? (
            <TrendingUp className="h-8 w-8 text-green-500" />
          ) : (
            <TrendingDown className="h-8 w-8 text-red-500" />
          )}
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              R$ {weekRevenue.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Receita (7 dias)</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              R$ {monthRevenue.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Receita (30 dias)</div>
          </div>
        </div>

        {/* Clientes Únicos */}
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600">Clientes Únicos</p>
            <p className="text-2xl font-bold text-blue-600">{uniqueCustomers}</p>
          </div>
          <Users className="h-8 w-8 text-blue-500" />
        </div>

        {/* Ticket Médio */}
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <p className="text-sm text-gray-600">Ticket Médio</p>
          <p className="text-2xl font-bold text-purple-600">
            R$ {averageOrderValue.toFixed(2)}
          </p>
        </div>

        {/* Horário de Pico */}
        {peakHour && (
          <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Horário de Pico</p>
              <p className="text-2xl font-bold text-orange-600">
                {peakHour[0]}:00 - {(parseInt(peakHour[0]) + 1).toString().padStart(2, '0')}:00
              </p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
        )}

        {/* Faixa de Valor Mais Comum */}
        {topValueRange && (
          <div className="text-center p-4 bg-indigo-50 rounded-lg">
            <p className="text-sm text-gray-600">Faixa de Valor Mais Comum</p>
            <p className="text-lg font-bold text-indigo-600">
              {topValueRange[0]}
            </p>
            <p className="text-sm text-gray-600">
              {topValueRange[1].count} vendas ({((topValueRange[1].count / sales.length) * 100).toFixed(1)}%)
            </p>
          </div>
        )}

        {/* Método de Pagamento Mais Usado */}
        {topPaymentMethod && (
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Método de Pagamento Principal</p>
            <p className="text-lg font-bold text-green-600">
              {topPaymentMethod[0] === 'dinheiro' ? 'Dinheiro' :
               topPaymentMethod[0] === 'cartao_debito' ? 'Cartão de Débito' :
               topPaymentMethod[0] === 'cartao_credito' ? 'Cartão de Crédito' :
               topPaymentMethod[0] === 'pix' ? 'PIX' :
               topPaymentMethod[0] === 'transferencia' ? 'Transferência' :
               topPaymentMethod[0]}
            </p>
            <p className="text-sm text-gray-600">
              {topPaymentMethod[1]} vendas ({((topPaymentMethod[1] / sales.length) * 100).toFixed(1)}%)
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
