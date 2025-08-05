
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sale } from '@/types/database';
import { Calendar, Clock, TrendingUp, BarChart3 } from 'lucide-react';

interface TimeAnalysisProps {
  sales: Sale[];
}

export const TimeAnalysis: React.FC<TimeAnalysisProps> = ({ sales }) => {
  // Análise por dia da semana
  const salesByWeekday = sales.reduce((acc, sale) => {
    const weekday = new Date(sale.sale_date).getDay();
    const weekdayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const dayName = weekdayNames[weekday];
    
    if (!acc[dayName]) {
      acc[dayName] = { count: 0, revenue: 0 };
    }
    acc[dayName].count++;
    acc[dayName].revenue += sale.sale_price * sale.quantity;
    return acc;
  }, {} as Record<string, { count: number; revenue: number }>);

  // Análise por horário
  const salesByHour = sales.reduce((acc, sale) => {
    const hour = new Date(sale.sale_date).getHours();
    const hourRange = `${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`;
    
    if (!acc[hourRange]) {
      acc[hourRange] = { count: 0, revenue: 0 };
    }
    acc[hourRange].count++;
    acc[hourRange].revenue += sale.sale_price * sale.quantity;
    return acc;
  }, {} as Record<string, { count: number; revenue: number }>);

  // Análise mensal (últimos 6 meses)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const monthlyData = sales
    .filter(sale => new Date(sale.sale_date) >= sixMonthsAgo)
    .reduce((acc, sale) => {
      const month = new Date(sale.sale_date).toLocaleDateString('pt-BR', { 
        year: 'numeric', 
        month: 'short' 
      });
      
      if (!acc[month]) {
        acc[month] = { count: 0, revenue: 0, profit: 0 };
      }
      acc[month].count++;
      acc[month].revenue += sale.sale_price * sale.quantity;
      acc[month].profit += sale.profit || 0;
      return acc;
    }, {} as Record<string, { count: number; revenue: number; profit: number }>);

  const bestWeekday = Object.entries(salesByWeekday)
    .sort(([,a], [,b]) => b.revenue - a.revenue)[0];

  const bestHour = Object.entries(salesByHour)
    .sort(([,a], [,b]) => b.count - a.count)[0];

  const monthlyEntries = Object.entries(monthlyData).slice(-6);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Melhor Dia da Semana */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-500" />
            Análise por Dia da Semana
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bestWeekday && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Melhor dia</p>
              <p className="text-xl font-bold text-blue-600">{bestWeekday[0]}</p>
              <p className="text-sm text-gray-500">
                {bestWeekday[1].count} vendas - R$ {bestWeekday[1].revenue.toFixed(2)}
              </p>
            </div>
          )}
          <div className="space-y-2">
            {Object.entries(salesByWeekday)
              .sort(([,a], [,b]) => b.revenue - a.revenue)
              .slice(0, 4)
              .map(([day, data]) => (
                <div key={day} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="font-medium">{day}</span>
                  <div className="text-right">
                    <div className="text-sm font-semibold">R$ {data.revenue.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">{data.count} vendas</div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Melhor Horário */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Clock className="h-5 w-5 mr-2 text-green-500" />
            Análise por Horário
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bestHour && (
            <div className="mb-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Horário de pico</p>
              <p className="text-xl font-bold text-green-600">{bestHour[0]}</p>
              <p className="text-sm text-gray-500">
                {bestHour[1].count} vendas - R$ {bestHour[1].revenue.toFixed(2)}
              </p>
            </div>
          )}
          <div className="space-y-2">
            {Object.entries(salesByHour)
              .sort(([,a], [,b]) => b.count - a.count)
              .slice(0, 4)
              .map(([hour, data]) => (
                <div key={hour} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="font-medium">{hour}</span>
                  <div className="text-right">
                    <div className="text-sm font-semibold">R$ {data.revenue.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">{data.count} vendas</div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Tendência Mensal */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-purple-500" />
            Tendência dos Últimos 6 Meses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {monthlyEntries.map(([month, data]) => (
              <div key={month} className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-900">{month}</div>
                <div className="text-sm text-green-600 font-semibold">
                  R$ {data.revenue.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500">
                  {data.count} vendas • R$ {data.profit.toFixed(2)} lucro
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
