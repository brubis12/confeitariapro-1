
import React, { useState, useEffect, useCallback } from 'react';
import { X, User, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Sale, Product, SaleItem as DatabaseSaleItem } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { SaleItemsManager } from './SaleItemsManager';
import { useSaleItems } from '@/hooks/useSaleItems';

interface SaleItem {
  id: string;
  type: 'product' | 'recipe' | 'custom';
  productId?: string;
  recipeId?: string;
  customName: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
}

interface SaleFormProps {
  sale?: Sale | null;
  products: Product[];
  recipes: any[];
  onSubmit: (sale: Partial<Sale>, items: SaleItem[]) => Promise<void>;
  onClose: () => void;
}

export const SaleForm: React.FC<SaleFormProps> = ({ 
  sale, 
  products, 
  recipes, 
  onSubmit, 
  onClose 
}) => {
  const [items, setItems] = useState<SaleItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('completed');
  const [loading, setLoading] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const { toast } = useToast();
  const { saleItems, loadSaleItems, loading: loadingItems } = useSaleItems();

  // Carregar itens da venda para edição
  const loadExistingSaleItems = useCallback(async () => {
    if (sale?.id && !initialDataLoaded) {
      console.log('Loading existing sale items for sale:', sale.id);
      try {
        setInitialDataLoaded(true);
        const loadedItems = await loadSaleItems(sale.id);
        console.log('Loaded existing items:', loadedItems);
      } catch (error) {
        console.error('Error loading existing items:', error);
      }
    }
  }, [sale?.id, loadSaleItems, initialDataLoaded]);

  // Inicializar dados do formulário
  useEffect(() => {
    console.log('SaleForm effect - sale:', sale);
    
    if (sale) {
      // Editando venda existente
      console.log('Initializing form for editing sale:', sale);
      setCustomerName(sale.customer_name || '');
      setCustomerEmail(sale.customer_email || '');
      setCustomerPhone(sale.customer_phone || '');
      setPaymentMethod(sale.payment_method || '');
      setNotes(sale.notes || '');
      setStatus(sale.status || 'completed');
      
      loadExistingSaleItems();
    } else {
      // Nova venda
      console.log('Initializing form for new sale');
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setPaymentMethod('');
      setNotes('');
      setStatus('completed');
      setInitialDataLoaded(false);
      
      // Criar item inicial vazio para nova venda
      const newItem: SaleItem = {
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'custom',
        customName: '',
        quantity: 1,
        unitPrice: 0,
        unitCost: 0
      };
      setItems([newItem]);
    }
  }, [sale, loadExistingSaleItems]);

  // Converter itens carregados para formato do formulário quando editando
  useEffect(() => {
    if (sale && saleItems.length > 0 && initialDataLoaded) {
      console.log('Converting sale items to form format:', saleItems);
      
      const formItems: SaleItem[] = saleItems.map((item: DatabaseSaleItem, index) => {
        const itemType = item.product_id ? 'product' : item.recipe_id ? 'recipe' : 'custom';
        
        return {
          id: item.id || `item-${index}`,
          type: itemType,
          productId: item.product_id || undefined,
          recipeId: item.recipe_id || undefined,
          customName: item.custom_name || `Item ${index + 1}`,
          quantity: Number(item.quantity) || 1,
          unitPrice: Number(item.unit_price) || 0,
          unitCost: Number(item.unit_cost) || 0
        };
      });
      
      console.log('Converted form items:', formItems);
      setItems(formItems);
    } else if (sale && !loadingItems && initialDataLoaded && saleItems.length === 0) {
      // Se não há itens carregados, criar um item baseado na venda principal
      console.log('No items found, creating item from sale data');
      const saleItem: SaleItem = {
        id: `main_item_${Date.now()}`,
        type: 'custom',
        customName: sale.custom_name || 'Item da venda',
        quantity: Number(sale.quantity) || 1,
        unitPrice: Number(sale.sale_price) || 0,
        unitCost: Number(sale.total_cost) || 0
      };
      setItems([saleItem]);
    }
  }, [sale, saleItems, initialDataLoaded, loadingItems]);

  const calculateTotals = () => {
    const validItems = items.filter(item => item.customName.trim());
    const totalRevenue = validItems.reduce((sum, item) => sum + (Number(item.unitPrice) * Number(item.quantity)), 0);
    const totalCost = validItems.reduce((sum, item) => sum + (Number(item.unitCost) * Number(item.quantity)), 0);
    const totalProfit = totalRevenue - totalCost;
    
    return { totalRevenue, totalCost, totalProfit, validItems };
  };

  const generateSaleName = () => {
    const { validItems } = calculateTotals();
    
    if (validItems.length === 0) return 'Venda sem nome';
    if (validItems.length === 1) return validItems[0].customName;
    
    // Melhor lógica para múltiplos itens
    const firstItem = validItems[0].customName;
    const additionalCount = validItems.length - 1;
    return `${firstItem} e mais ${additionalCount} ${additionalCount === 1 ? 'item' : 'itens'}`;
  };

  const validateForm = () => {
    console.log('Validating form with items:', items);
    
    const { validItems } = calculateTotals();
    
    if (validItems.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um item com nome válido à venda",
        variant: "destructive"
      });
      return false;
    }

    // Validar se todos os itens válidos têm quantidade e preço corretos
    const invalidItems = validItems.filter(item => 
      Number(item.quantity) <= 0 || Number(item.unitPrice) < 0
    );

    if (invalidItems.length > 0) {
      toast({
        title: "Erro",
        description: "Todos os itens devem ter quantidade válida (maior que 0) e preço não negativo",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started');
    console.log('Current items:', items);
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const { totalRevenue, totalCost, validItems } = calculateTotals();
      const totalQuantity = validItems.reduce((sum, item) => sum + Number(item.quantity), 0);

      // Gerar nome da venda baseado nos itens válidos
      const saleName = generateSaleName();

      console.log('Calculated totals:', { totalRevenue, totalCost, totalQuantity, validItems: validItems.length });

      // Preparar dados da venda
      const saleData: Partial<Sale> = {
        custom_name: saleName,
        quantity: totalQuantity,
        sale_price: totalQuantity > 0 ? totalRevenue / totalQuantity : 0,
        total_cost: totalQuantity > 0 ? totalCost / totalQuantity : 0,
        customer_name: customerName.trim() || null,
        customer_email: customerEmail.trim() || null,
        customer_phone: customerPhone.trim() || null,
        payment_method: paymentMethod || null,
        notes: notes.trim() || null,
        status: status,
        sale_date: sale?.sale_date || new Date().toISOString()
      };

      console.log('Final sale data to submit:', saleData);
      console.log('Valid items to submit:', validItems);
      
      await onSubmit(saleData, validItems);
      
    } catch (error) {
      console.error('Error in form submission:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a venda. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Loading state para carregamento de dados existentes
  if (sale && loadingItems && !initialDataLoaded) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
            <span className="ml-2">Carregando dados da venda...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {sale ? 'Editar Venda' : 'Nova Venda'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Gerenciador de Itens */}
          <SaleItemsManager
            products={products}
            recipes={recipes}
            items={items}
            onChange={setItems}
          />

          {/* Informações do Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <User className="h-5 w-5 mr-2" />
                Informações do Cliente (Opcional)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Nome</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nome do cliente"
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone">Telefone</Label>
                  <Input
                    id="customerPhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    disabled={loading}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="customerEmail">E-mail</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  disabled={loading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pagamento e Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Pagamento e Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod} disabled={loading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                      <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="transferencia">Transferência</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={setStatus} disabled={loading}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completed">Concluída</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="cancelled">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Observações sobre a venda..."
                  rows={3}
                  disabled={loading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-pink-600 hover:bg-pink-700">
              {loading ? 'Salvando...' : (sale ? 'Atualizar' : 'Registrar')} Venda
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
