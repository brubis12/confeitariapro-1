
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Sale } from '@/types/database';
import { Edit, Trash2, ShoppingCart, Calendar } from 'lucide-react';

interface SaleTableProps {
  sales: Sale[];
  onEdit: (sale: Sale) => void;
  onDelete: (id: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'completed':
      return 'Concluída';
    case 'pending':
      return 'Pendente';
    case 'cancelled':
      return 'Cancelada';
    default:
      return status;
  }
};

export const SaleTable: React.FC<SaleTableProps> = ({ sales, onEdit, onDelete }) => {
  return (
    <div className="space-y-4">
      <div className="hidden md:block">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="grid grid-cols-8 gap-4 p-4 border-b bg-gray-50 font-medium text-sm text-gray-600">
            <div>Item</div>
            <div>Cliente</div>
            <div>Quantidade</div>
            <div>Preço Unitário</div>
            <div>Total</div>
            <div>Lucro</div>
            <div>Status</div>
            <div>Ações</div>
          </div>
          {sales.map((sale) => (
            <div key={sale.id} className="grid grid-cols-8 gap-4 p-4 border-b last:border-b-0 items-center">
              <div>
                <div className="font-medium text-gray-900">{sale.custom_name}</div>
                <div className="text-sm text-gray-500">
                  {new Date(sale.sale_date).toLocaleDateString()}
                </div>
              </div>
              <div className="text-sm text-gray-900">
                {sale.customer_name || 'N/A'}
              </div>
              <div className="text-gray-900 font-medium">
                {sale.quantity}
              </div>
              <div className="text-gray-900 font-medium">
                R$ {sale.sale_price.toFixed(2)}
              </div>
              <div className="text-green-600 font-medium">
                R$ {(sale.sale_price * sale.quantity).toFixed(2)}
              </div>
              <div className="text-blue-600 font-medium">
                R$ {(sale.profit || 0).toFixed(2)}
              </div>
              <div>
                <Badge className={getStatusColor(sale.status)}>
                  {getStatusText(sale.status)}
                </Badge>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(sale)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(sale.id)}
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
        {sales.map((sale) => (
          <Card key={sale.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <ShoppingCart className="h-4 w-4 text-gray-400" />
                    <h3 className="font-medium text-gray-900">{sale.custom_name}</h3>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {new Date(sale.sale_date).toLocaleDateString()}
                    </span>
                  </div>
                  {sale.customer_name && (
                    <p className="text-sm text-gray-600 mt-1">Cliente: {sale.customer_name}</p>
                  )}
                  <Badge className={`mt-2 ${getStatusColor(sale.status)}`}>
                    {getStatusText(sale.status)}
                  </Badge>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(sale)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(sale.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Quantidade</div>
                  <div className="font-medium text-gray-900">{sale.quantity}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Preço Unitário</div>
                  <div className="font-medium text-gray-900">R$ {sale.sale_price.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total</div>
                  <div className="font-medium text-green-600">
                    R$ {(sale.sale_price * sale.quantity).toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Lucro</div>
                  <div className="font-medium text-blue-600">
                    R$ {(sale.profit || 0).toFixed(2)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
