
import React, { useEffect, useState } from 'react';
import { Eye, X, Package, ChefHat } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sale, SaleItem } from '@/types/database';
import { useSaleItems } from '@/hooks/useSaleItems';

interface SaleDetailsModalProps {
  sale: Sale | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SaleDetailsModal: React.FC<SaleDetailsModalProps> = ({
  sale,
  isOpen,
  onClose
}) => {
  const { saleItems, loading, loadSaleItems } = useSaleItems();

  useEffect(() => {
    if (sale?.id && isOpen) {
      loadSaleItems(sale.id);
    }
  }, [sale?.id, isOpen, loadSaleItems]);

  if (!sale) return null;

  const formatCurrency = (value: number | null) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentMethodLabel = (method: string | null) => {
    if (!method) return 'Não informado';
    
    const methods: Record<string, string> = {
      'dinheiro': 'Dinheiro',
      'cartao_debito': 'Cartão de Débito',
      'cartao_credito': 'Cartão de Crédito',
      'pix': 'PIX',
      'transferencia': 'Transferência'
    };
    
    return methods[method] || method;
  };

  // Calculate totals from sale items if available, otherwise use sale totals
  const totalValue = saleItems.length > 0 
    ? saleItems.reduce((sum, item) => sum + Number(item.total_price || 0), 0)
    : sale.sale_price * sale.quantity;
  
  const totalCost = saleItems.length > 0
    ? saleItems.reduce((sum, item) => sum + Number(item.total_cost || 0), 0)
    : sale.total_cost;
    
  const profit = totalValue - totalCost;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Detalhes da Venda
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Gerais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-lg mb-3">Informações Gerais</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-600">Nome Personalizado:</span>
                  <p className="font-medium">{sale.custom_name || 'Não informado'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Data da Venda:</span>
                  <p className="font-medium">{formatDate(sale.sale_date)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge variant={sale.status === 'completed' ? 'default' : 'secondary'}>
                    {sale.status === 'completed' ? 'Concluída' : 
                     sale.status === 'pending' ? 'Pendente' : 
                     sale.status === 'cancelled' ? 'Cancelada' : 
                     sale.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Informações do Cliente */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Cliente</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-600">Nome:</span>
                  <p className="font-medium">{sale.customer_name || 'Não informado'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Email:</span>
                  <p className="font-medium">{sale.customer_email || 'Não informado'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Telefone:</span>
                  <p className="font-medium">{sale.customer_phone || 'Não informado'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Itens da Venda */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Itens da Venda</h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
              </div>
            ) : saleItems.length > 0 ? (
              <div className="space-y-3">
                {saleItems.map((item, index) => (
                  <Card key={item.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {item.product_id ? (
                            <Package className="h-5 w-5 text-blue-600" />
                          ) : item.recipe_id ? (
                            <ChefHat className="h-5 w-5 text-green-600" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-600" />
                          )}
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {item.custom_name || `Item ${index + 1}`}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {item.product_id ? 'Produto' : item.recipe_id ? 'Receita' : 'Personalizado'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            {formatCurrency(Number(item.total_price))}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.quantity}x {formatCurrency(Number(item.unit_price))}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Qtd:</span>
                          <span className="ml-1 font-medium">{item.quantity}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Custo:</span>
                          <span className="ml-1 font-medium text-red-600">
                            {formatCurrency(Number(item.total_cost))}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Lucro:</span>
                          <span className={`ml-1 font-medium ${Number(item.profit) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(Number(item.profit))}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
                Nenhum item encontrado para esta venda
              </div>
            )}
          </div>

          {/* Pagamento */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Pagamento</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-600">Método de Pagamento:</span>
                  <p className="font-medium">{getPaymentMethodLabel(sale.payment_method)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Resumo Financeiro */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Resumo Financeiro</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Valor Total:</span>
                  <span className="font-bold text-lg text-blue-600">
                    {formatCurrency(totalValue)}
                  </span>
                </div>
                 <div className="flex justify-between items-center">
                   <span className="text-gray-600">Custo Total:</span>
                   <span className="font-medium text-red-600">
                     {formatCurrency(totalCost)}
                   </span>
                 </div>
                <hr className="border-gray-300" />
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-semibold">Lucro:</span>
                  <span className={`font-bold text-lg ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(profit)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Observações */}
          {sale.notes && (
            <div>
              <h3 className="font-semibold text-lg mb-3">Observações</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">{sale.notes}</p>
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={onClose} variant="outline">
              <X className="h-4 w-4 mr-2" />
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
