
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sale } from '@/types/database';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  Area,
  AreaChart,
  ComposedChart
} from 'recharts';

interface ReportsChartsProps {
  sales: Sale[];
}

export const ReportsCharts: React.FC<ReportsChartsProps> = ({ sales }) => {
  // Dados para gráfico de vendas por dia (últimos 30 dias)
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toISOString().split('T')[0];
  });

  const dailyData = last30Days.map(date => {
    const daySales = sales.filter(sale => 
      sale.sale_date.startsWith(date)
    );
    
    return {
      date: new Date(date).toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit' 
      }),
      sales: daySales.length,
      revenue: daySales.reduce((sum, sale) => sum + sale.sale_price * sale.quantity, 0),
      profit: daySales.reduce((sum, sale) => sum + (sale.profit || 0), 0),
      cost: daySales.reduce((sum, sale) => sum + sale.total_cost, 0)
    };
  });

  // Dados para gráfico de vendas por método de pagamento
  const paymentMethodData = sales.reduce((acc, sale) => {
    const method = sale.payment_method || 'Não informado';
    const displayName = 
      method === 'dinheiro' ? 'Dinheiro' :
      method === 'cartao_debito' ? 'Cartão Débito' :
      method === 'cartao_credito' ? 'Cartão Crédito' :
      method === 'pix' ? 'PIX' :
      method === 'transferencia' ? 'Transferência' :
      method;
    
    if (!acc[displayName]) {
      acc[displayName] = { count: 0, revenue: 0 };
    }
    acc[displayName].count += 1;
    acc[displayName].revenue += sale.sale_price * sale.quantity;
    return acc;
  }, {} as Record<string, { count: number; revenue: number }>);

  const paymentData = Object.entries(paymentMethodData).map(([name, data]) => ({
    name,
    value: data.count,
    revenue: data.revenue
  }));

  // Dados para análise de margem de lucro
  const profitabilityData = sales.reduce((acc, sale) => {
    const revenue = sale.sale_price * sale.quantity;
    const profit = sale.profit || 0;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    
    let range: string;
    if (margin < 0) range = 'Prejuízo';
    else if (margin <= 10) range = '0-10%';
    else if (margin <= 20) range = '10-20%';
    else if (margin <= 30) range = '20-30%';
    else if (margin <= 50) range = '30-50%';
    else range = '50%+';
    
    if (!acc[range]) {
      acc[range] = { count: 0, totalRevenue: 0 };
    }
    acc[range].count += 1;
    acc[range].totalRevenue += revenue;
    return acc;
  }, {} as Record<string, { count: number; totalRevenue: number }>);

  const marginData = Object.entries(profitabilityData).map(([range, data]) => ({
    range,
    count: data.count,
    revenue: data.totalRevenue
  }));

  // Top produtos por receita
  const productRevenue = sales.reduce((acc, sale) => {
    const productName = sale.custom_name || 'Produto sem nome';
    if (!acc[productName]) {
      acc[productName] = { revenue: 0, quantity: 0, profit: 0 };
    }
    acc[productName].revenue += sale.sale_price * sale.quantity;
    acc[productName].quantity += sale.quantity;
    acc[productName].profit += sale.profit || 0;
    return acc;
  }, {} as Record<string, { revenue: number; quantity: number; profit: number }>);

  const topProductsData = Object.entries(productRevenue)
    .sort(([,a], [,b]) => b.revenue - a.revenue)
    .slice(0, 10)
    .map(([name, data]) => ({
      name: name.length > 20 ? name.substring(0, 20) + '...' : name,
      fullName: name,
      revenue: data.revenue,
      quantity: data.quantity,
      profit: data.profit
    }));

  const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#6B7280'];

  return (
    <div className="space-y-6">
      {/* Tendência de Vendas e Receita (30 dias) */}
      <Card>
        <CardHeader>
          <CardTitle>Tendência dos Últimos 30 Dias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'sales' ? `${value} vendas` : `R$ ${Number(value).toFixed(2)}`,
                    name === 'sales' ? 'Vendas' : 
                    name === 'revenue' ? 'Receita' :
                    name === 'profit' ? 'Lucro' : 'Custo'
                  ]}
                />
                <Bar yAxisId="left" dataKey="sales" fill="#8884d8" name="sales" />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} name="revenue" />
                <Line yAxisId="right" type="monotone" dataKey="profit" stroke="#3B82F6" strokeWidth={2} name="profit" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Métodos de Pagamento */}
        <Card>
          <CardHeader>
            <CardTitle>Métodos de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name, props) => [
                    `${value} vendas`,
                    `R$ ${props.payload.revenue.toFixed(2)}`
                  ]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Análise de Margem */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Margem de Lucro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={marginData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="range" type="category" width={60} />
                  <Tooltip formatter={(value, name) => [
                    name === 'count' ? `${value} vendas` : `R$ ${Number(value).toFixed(2)}`
                  ]} />
                  <Bar dataKey="count" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Produtos */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Produtos por Receita</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductsData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? `R$ ${Number(value).toFixed(2)}` :
                    name === 'profit' ? `R$ ${Number(value).toFixed(2)}` :
                    `${value} unidades`
                  ]}
                  labelFormatter={(label) => topProductsData.find(p => p.name === label)?.fullName || label}
                />
                <Bar dataKey="revenue" fill="#EC4899" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Receita vs Custo vs Lucro */}
      <Card>
        <CardHeader>
          <CardTitle>Análise Financeira Diária</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`R$ ${Number(value).toFixed(2)}`]} />
                <Area type="monotone" dataKey="revenue" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                <Area type="monotone" dataKey="cost" stackId="2" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
                <Area type="monotone" dataKey="profit" stackId="3" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
