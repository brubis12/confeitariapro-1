
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { InventoryItem } from '@/types/database';
import { Edit, Trash2, Package, AlertTriangle, Lock } from 'lucide-react';

interface InventoryTableProps {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
  blocked?: boolean;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({ items, onEdit, onDelete, blocked = false }) => {
  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity <= (item.min_stock || 0)) {
      return { label: 'Baixo', color: 'bg-red-100 text-red-800' };
    }
    return { label: 'Normal', color: 'bg-green-100 text-green-800' };
  };

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden md:block">
        <div className={`bg-white rounded-lg shadow-sm border ${blocked ? 'opacity-60' : ''}`}>
          <div className="grid grid-cols-8 gap-4 p-4 border-b bg-gray-50 font-medium text-sm text-gray-600">
            <div>Item</div>
            <div>Categoria</div>
            <div>Quantidade</div>
            <div>Unidade</div>
            <div>Custo Unit.</div>
            <div>Valor Total</div>
            <div>Status</div>
            <div>Ações</div>
          </div>
          {items.map((item) => {
            const status = getStockStatus(item);
            const totalValue = item.quantity * item.cost_per_unit;
            
            return (
              <div key={item.id} className="grid grid-cols-8 gap-4 p-4 border-b last:border-b-0 items-center">
                <div>
                  <div className="font-medium text-gray-900 flex items-center">
                    {blocked && <Lock className="h-3 w-3 mr-1 text-gray-400" />}
                    {item.name}
                  </div>
                  {item.supplier && (
                    <div className="text-sm text-gray-500">{item.supplier}</div>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {item.category || 'N/A'}
                </div>
                <div className="text-gray-900 font-medium">
                  {item.quantity}
                </div>
                <div className="text-gray-600">
                  {item.unit}
                </div>
                <div className="text-gray-900 font-medium">
                  R$ {item.cost_per_unit.toFixed(2)}
                </div>
                <div className="text-green-600 font-medium">
                  R$ {totalValue.toFixed(2)}
                </div>
                <div>
                  <Badge className={status.color}>
                    {status.label}
                  </Badge>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(item)}
                    disabled={blocked}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(item.id)}
                    disabled={blocked}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {items.map((item) => {
          const status = getStockStatus(item);
          const totalValue = item.quantity * item.cost_per_unit;
          
          return (
            <Card key={item.id} className={blocked ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4 text-gray-400" />
                      {blocked && <Lock className="h-3 w-3 text-gray-400" />}
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                    </div>
                    {item.category && (
                      <p className="text-sm text-gray-600 mt-1">
                        Categoria: {item.category}
                      </p>
                    )}
                    {item.supplier && (
                      <p className="text-sm text-gray-600">
                        Fornecedor: {item.supplier}
                      </p>
                    )}
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className={status.color}>
                        {status.label}
                      </Badge>
                      {item.quantity <= (item.min_stock || 0) && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(item)}
                      disabled={blocked}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(item.id)}
                      disabled={blocked}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Quantidade</div>
                    <div className="font-medium text-gray-900">
                      {item.quantity} {item.unit}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Custo Unitário</div>
                    <div className="font-medium text-gray-900">
                      R$ {item.cost_per_unit.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Valor Total</div>
                    <div className="font-medium text-green-600">
                      R$ {totalValue.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Estoque Mín.</div>
                    <div className="font-medium text-gray-900">
                      {item.min_stock || 0} {item.unit}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
