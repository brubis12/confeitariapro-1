
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@/types/database';
import { Edit, Trash2, Package } from 'lucide-react';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({ products, onEdit, onDelete }) => {
  return (
    <div className="space-y-4">
      <div className="hidden md:block">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="grid grid-cols-7 gap-4 p-4 border-b bg-gray-50 font-medium text-sm text-gray-600">
            <div>Produto</div>
            <div>Categoria</div>
            <div>Custo Total</div>
            <div>Preço de Venda</div>
            <div>Lucro</div>
            <div>Margem</div>
            <div>Ações</div>
          </div>
          {products.map((product) => (
            <div key={product.id} className="grid grid-cols-7 gap-4 p-4 border-b last:border-b-0 items-center">
              <div>
                <div className="font-medium text-gray-900">{product.name}</div>
                {product.description && (
                  <div className="text-sm text-gray-500 truncate">{product.description}</div>
                )}
              </div>
              <div>
                {product.category && (
                  <Badge variant="secondary">{product.category}</Badge>
                )}
              </div>
              <div className="text-red-600 font-medium">
                R$ {product.total_cost.toFixed(2)}
              </div>
              <div className="text-green-600 font-medium">
                R$ {product.final_price.toFixed(2)}
              </div>
              <div className="text-blue-600 font-medium">
                R$ {product.profit.toFixed(2)}
              </div>
              <div className="text-purple-600 font-medium">
                {product.margin.toFixed(1)}%
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(product)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(product.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {products.map((product) => (
          <Card key={product.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-gray-400" />
                    <h3 className="font-medium text-gray-900">{product.name}</h3>
                  </div>
                  {product.description && (
                    <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                  )}
                  {product.category && (
                    <Badge variant="secondary" className="mt-2">{product.category}</Badge>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(product)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(product.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Custo Total</div>
                  <div className="font-medium text-red-600">R$ {product.total_cost.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Preço de Venda</div>
                  <div className="font-medium text-green-600">R$ {product.final_price.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Lucro</div>
                  <div className="font-medium text-blue-600">R$ {product.profit.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Margem</div>
                  <div className="font-medium text-purple-600">{product.margin.toFixed(1)}%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
