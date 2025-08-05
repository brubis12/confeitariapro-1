import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, Edit, Trash2, Lock, Eye, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sale, SaleItem } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';

interface SaleCardProps {
  sale: Sale;
  onEdit: (sale: Sale) => void;
  onDelete: (sale: Sale) => void;
  onViewDetails: (sale: Sale) => void;
  isBlocked?: boolean;
}

export const SaleCard: React.FC<SaleCardProps> = ({
  sale,
  onEdit,
  onDelete,
  onViewDetails,
  isBlocked = false
}) => {
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  const loadSaleItems = useCallback(async () => {
    if (isBlocked || !sale.id) return;
    
    try {
      setLoadingItems(true);
      const { data, error } = await supabase
        .from('sale_items')
        .select('*')
        .eq('sale_id', sale.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading sale items:', error);
        return;
      }
      
      setSaleItems(data || []);
    } catch (error) {
      console.error('Error loading sale items:', error);
      setSaleItems([]);
    } finally {
      setLoadingItems(false);
    }
  }, [sale.id, isBlocked]);

  useEffect(() => {
    // Load sale items when component mounts or sale.updated_at changes
    loadSaleItems();
  }, [loadSaleItems, sale.updated_at]);

  useEffect(() => {
    if (isBlocked) return;

    // Subscribe to real-time updates for sale items
    const channel = supabase
      .channel(`sale_items_${sale.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sale_items',
          filter: `sale_id=eq.${sale.id}`
        },
        () => {
          console.log('Sale items changed, reloading...');
          loadSaleItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sale.id, loadSaleItems, isBlocked]);

  const formatCurrency = (value: number | null) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Data inválida';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleDeleteClick = () => {
    if (confirm('Tem certeza que deseja excluir esta venda?')) {
      onDelete(sale);
    }
  };

  const getPaymentMethodLabel = (method: string | null) => {
    if (!method) return '';
    
    switch (method) {
      case 'dinheiro': return 'Dinheiro';
      case 'cartao_debito': return 'Cartão Débito';
      case 'cartao_credito': return 'Cartão Crédito';
      case 'pix': return 'PIX';
      case 'transferencia': return 'Transferência';
      default: return method;
    }
  };

  const totalValue = (sale.sale_price || 0) * (sale.quantity || 1);

  return (
    <Card className={`hover:shadow-lg transition-shadow ${isBlocked ? 'opacity-60 border-gray-300' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className={`text-lg ${isBlocked ? 'text-gray-500 flex items-center' : ''}`}>
            {isBlocked && <Lock className="h-4 w-4 mr-2" />}
            {sale.custom_name || 'Venda sem nome'}
          </CardTitle>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDetails(sale)}
              title="Ver detalhes"
              disabled={isBlocked}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(sale)}
              title="Editar"
              disabled={isBlocked}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteClick}
              title="Excluir"
              disabled={isBlocked}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
        <CardDescription className={isBlocked ? 'text-gray-400' : ''}>
          {sale.customer_name || 'Cliente não informado'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Informações básicas */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className={`text-sm ${isBlocked ? 'text-gray-400' : 'text-gray-600'}`}>Quantidade:</span>
              <span className={`font-medium ${isBlocked ? 'text-gray-400' : ''}`}>{sale.quantity || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${isBlocked ? 'text-gray-400' : 'text-gray-600'}`}>Preço Unitário:</span>
              <span className={`font-medium ${isBlocked ? 'text-gray-400' : ''}`}>{formatCurrency(sale.sale_price)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${isBlocked ? 'text-gray-400' : 'text-gray-600'}`}>Total:</span>
              <span className={`font-medium ${isBlocked ? 'text-gray-400' : 'text-green-600'}`}>
                {formatCurrency(totalValue)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${isBlocked ? 'text-gray-400' : 'text-gray-600'}`}>Data:</span>
              <span className={`font-medium ${isBlocked ? 'text-gray-400' : ''}`}>{formatDate(sale.sale_date)}</span>
            </div>
            {sale.payment_method && (
              <div className="flex justify-between items-center">
                <span className={`text-sm ${isBlocked ? 'text-gray-400' : 'text-gray-600'}`}>Pagamento:</span>
                <Badge variant="outline" className={isBlocked ? 'text-gray-400 border-gray-300' : ''}>
                  {getPaymentMethodLabel(sale.payment_method)}
                </Badge>
              </div>
            )}
          </div>

          {/* Itens da venda */}
          {!isBlocked && saleItems.length > 0 && (
            <div className="border-t pt-3">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Itens da Venda</span>
                <Badge variant="secondary" className="text-xs">
                  {saleItems.length} {saleItems.length === 1 ? 'item' : 'itens'}
                </Badge>
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {saleItems.map((item, index) => (
                  <div key={item.id || index} className="text-xs bg-gray-50 p-2 rounded">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{item.custom_name || `Item ${index + 1}`}</span>
                      <span className="text-gray-600">{item.quantity}x</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-500">
                      <span>{formatCurrency(item.unit_price)}</span>
                      <span className="font-medium">{formatCurrency(item.total_price || (item.unit_price * item.quantity))}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isBlocked && loadingItems && (
            <div className="border-t pt-3">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">Carregando itens...</span>
              </div>
            </div>
          )}

          {!isBlocked && !loadingItems && saleItems.length === 0 && (
            <div className="border-t pt-3">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-400">Nenhum item adicionado</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
