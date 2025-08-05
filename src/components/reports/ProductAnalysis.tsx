
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Product, Sale } from '@/types/database';
import { Badge } from '@/components/ui/badge';
import { Star, Package, DollarSign } from 'lucide-react';

interface ProductAnalysisProps {
  products: Product[];
  sales: Sale[];
}

export const ProductAnalysis: React.FC<ProductAnalysisProps> = ({ products, sales }) => {
  // Análise de vendas por produto ID (não por nome)
  const productSales = sales.reduce((acc, sale) => {
    // Usar product_id quando disponível, senão agrupar por "vendas avulsas"
    const productKey = sale.product_id || 'avulso';
    const productName = sale.product_id 
      ? products.find(p => p.id === sale.product_id)?.name || 'Produto não encontrado'
      : 'Vendas Avulsas';
    
    if (!acc[productKey]) {
      acc[productKey] = {
        id: productKey,
        name: productName,
        quantity: 0,
        revenue: 0,
        profit: 0,
        salesCount: 0
      };
    }
    
    acc[productKey].quantity += sale.quantity;
    acc[productKey].revenue += sale.sale_price * sale.quantity;
    acc[productKey].profit += sale.profit || 0;
    acc[productKey].salesCount += 1;
    
    return acc;
  }, {} as Record<string, {
    id: string;
    name: string;
    quantity: number;
    revenue: number;
    profit: number;
    salesCount: number;
  }>);

  const productAnalysis = Object.values(productSales);

  // Top produtos por receita
  const topByRevenue = productAnalysis
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Top produtos por quantidade vendida
  const topByQuantity = productAnalysis
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Top produtos por lucro
  const topByProfit = productAnalysis
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 5);

  // Produtos com melhor margem
  const productsWithMargin = products
    .filter(product => product.margin && product.margin > 0)
    .sort((a, b) => (b.margin || 0) - (a.margin || 0))
    .slice(0, 5);

  // Análise por faixa de preço
  const priceRangeAnalysis = sales.reduce((acc, sale) => {
    const price = sale.sale_price;
    let range: string;
    
    if (price <= 5) range = 'Até R$ 5';
    else if (price <= 15) range = 'R$ 5 - R$ 15';
    else if (price <= 30) range = 'R$ 15 - R$ 30';
    else if (price <= 50) range = 'R$ 30 - R$ 50';
    else range = 'Acima de R$ 50';
    
    if (!acc[range]) acc[range] = 0;
    acc[range] += sale.quantity;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análise de Produtos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Top Produtos por Receita */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-green-500" />
            Top Produtos por Receita
          </h3>
          <div className="space-y-2">
            {topByRevenue.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{index + 1}</Badge>
                  <span className="font-medium">{product.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">
                    R$ {product.revenue.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {product.salesCount} vendas
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Produtos por Quantidade */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <Package className="h-5 w-5 mr-2 text-blue-500" />
            Top Produtos por Quantidade
          </h3>
          <div className="space-y-2">
            {topByQuantity.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{index + 1}</Badge>
                  <span className="font-medium">{product.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-blue-600">
                    {product.quantity} unidades
                  </div>
                  <div className="text-sm text-gray-500">
                    {product.salesCount} vendas
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Análise por Faixa de Preço */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-orange-500" />
            Vendas por Faixa de Preço
          </h3>
          <div className="space-y-2">
            {Object.entries(priceRangeAnalysis)
              .sort(([,a], [,b]) => b - a)
              .map(([range, quantity], index) => (
                <div key={range} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{index + 1}</Badge>
                    <span className="font-medium">{range}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-orange-600">
                      {quantity} unidades
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Produtos com Melhor Margem */}
        {productsWithMargin.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Star className="h-5 w-5 mr-2 text-purple-500" />
              Produtos com Melhor Margem
            </h3>
            <div className="space-y-2">
              {productsWithMargin.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{index + 1}</Badge>
                    <span className="font-medium">{product.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-purple-600">
                      {product.margin?.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-500">
                      R$ {product.final_price?.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {products.length}
            </div>
            <div className="text-sm text-gray-600">Produtos Cadastrados</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {productAnalysis.length}
            </div>
            <div className="text-sm text-gray-600">Categorias Vendidas</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
