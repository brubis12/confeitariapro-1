
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useInventoryMovement } from '@/hooks/useInventoryMovement';
import { ArrowUp, ArrowDown, Settings, History } from 'lucide-react';

interface InventoryMovementsProps {
  inventoryId?: string;
  onUpdateInventory?: () => Promise<void>;
}

export const InventoryMovements: React.FC<InventoryMovementsProps> = ({ inventoryId, onUpdateInventory }) => {
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { getMovements } = useInventoryMovement();

  useEffect(() => {
    loadMovements();
  }, [inventoryId]);

  const loadMovements = async () => {
    try {
      setLoading(true);
      const data = await getMovements(inventoryId);
      setMovements(data);
    } catch (error) {
      console.error('Error loading movements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMovementTypeIcon = (type: string) => {
    switch (type) {
      case 'in':
        return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'out':
        return <ArrowDown className="h-4 w-4 text-red-500" />;
      default:
        return <Settings className="h-4 w-4 text-blue-500" />;
    }
  };

  const getMovementTypeText = (type: string) => {
    switch (type) {
      case 'in':
        return 'Entrada';
      case 'out':
        return 'Saída';
      default:
        return 'Ajuste';
    }
  };

  const getMovementTypeColor = (type: string) => {
    switch (type) {
      case 'in':
        return 'bg-green-100 text-green-800';
      case 'out':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="h-5 w-5 mr-2" />
            Histórico de Movimentações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <History className="h-5 w-5 mr-2" />
          Histórico de Movimentações
        </CardTitle>
      </CardHeader>
      <CardContent>
        {movements.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            Nenhuma movimentação encontrada
          </p>
        ) : (
          <div className="space-y-4">
            {movements.map((movement) => (
              <div key={movement.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getMovementTypeIcon(movement.movement_type)}
                  <div>
                    <div className="font-medium text-gray-900">
                      {movement.inventory?.name || 'Item não identificado'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(movement.created_at).toLocaleDateString('pt-BR')} às{' '}
                      {new Date(movement.created_at).toLocaleTimeString('pt-BR')}
                    </div>
                    {movement.reason && (
                      <div className="text-sm text-gray-500 mt-1">
                        {movement.reason}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getMovementTypeColor(movement.movement_type)}>
                    {getMovementTypeText(movement.movement_type)}
                  </Badge>
                  <div className="mt-2">
                    <div className="text-sm text-gray-600">
                      {movement.quantity > 0 ? '+' : ''}{movement.quantity} {movement.inventory?.unit || 'un'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {movement.previous_quantity} → {movement.new_quantity}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
