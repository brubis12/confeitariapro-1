import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/contexts/PlanContext';
import { supabase } from '@/integrations/supabase/client';
import { Sale, Product } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { useSaleItems } from './useSaleItems';

export const useSales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const { canCreateMore, planLimits, currentPlan } = usePlan();
  const { toast } = useToast();
  const { createSaleItems, updateSaleItems, deleteSaleItems } = useSaleItems();

  const loadSales = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      console.log('Loading sales for user:', user.id);
      
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('user_id', user.id)
        .order('sale_date', { ascending: false });

      if (error) {
        console.error('Error loading sales:', error);
        throw error;
      }
      
      console.log('Loaded sales:', data?.length || 0, 'sales');
      setSales(data || []);
    } catch (error) {
      console.error('Error loading sales:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as vendas",
        variant: "destructive"
      });
      setSales([]);
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const loadProducts = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('Loaded products:', data?.length || 0, 'products');
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    }
  }, [user]);

  const loadRecipes = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('Loaded recipes:', data?.length || 0, 'recipes');
      setRecipes(data || []);
    } catch (error) {
      console.error('Error loading recipes:', error);
      setRecipes([]);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      Promise.all([
        loadSales(),
        loadProducts(),
        loadRecipes()
      ]);
    }
  }, [user, loadSales, loadProducts, loadRecipes]);

  const createSale = async (saleData: Partial<Sale>, items: any[] = []) => {
    if (!user) {
      console.error('No user found for creating sale');
      return false;
    }
    
    const canCreate = await canCreateMore('sales');
    if (!canCreate) {
      toast({
        title: "Limite atingido",
        description: "Você atingiu o limite de vendas diárias do seu plano",
        variant: "destructive"
      });
      return false;
    }

    try {
      console.log('Creating sale with data:', saleData);
      console.log('Creating sale with items:', items);
      
      // Validar dados obrigatórios
      if (!saleData.custom_name || !saleData.quantity || !saleData.sale_price) {
        console.error('Missing required sale data');
        toast({
          title: "Erro",
          description: "Dados obrigatórios da venda estão faltando",
          variant: "destructive"
        });
        return false;
      }

      // Preparar dados da venda (remover campos calculados)
      const { profit, ...saleDataToSave } = saleData;
      
      const saleToInsert = {
        custom_name: saleDataToSave.custom_name,
        user_id: user.id,
        product_id: saleDataToSave.product_id || null,
        quantity: Number(saleDataToSave.quantity),
        sale_price: Number(saleDataToSave.sale_price),
        total_cost: Number(saleDataToSave.total_cost) || 0,
        customer_name: saleDataToSave.customer_name || null,
        customer_email: saleDataToSave.customer_email || null,
        customer_phone: saleDataToSave.customer_phone || null,
        payment_method: saleDataToSave.payment_method || null,
        sale_date: saleDataToSave.sale_date || new Date().toISOString(),
        notes: saleDataToSave.notes || null,
        status: saleDataToSave.status || 'completed'
      };

      console.log('Final sale data to insert:', saleToInsert);

      const { data, error } = await supabase
        .from('sales')
        .insert(saleToInsert)
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating sale:', error);
        throw error;
      }

      console.log('Sale created successfully:', data);

      // Criar itens da venda se fornecidos e válidos
      const validItems = items.filter(item => item.customName && item.customName.trim());
      if (validItems.length > 0) {
        console.log('Creating sale items:', validItems.length, 'valid items');
        await createSaleItems(data.id, validItems);
      }

      // Atualizar lista local
      setSales(prevSales => [data, ...prevSales]);
      
      toast({
        title: "Sucesso",
        description: "Venda registrada com sucesso"
      });
      return true;
    } catch (error) {
      console.error('Error creating sale:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a venda. Verifique os dados e tente novamente.",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateSale = async (saleId: string, updates: Partial<Sale>, items: any[] = []) => {
    if (!user || !saleId) {
      console.error('Missing user or saleId for update');
      return false;
    }
    
    try {
      console.log('Updating sale:', saleId, 'with data:', updates);
      console.log('Updating sale with items:', items);
      
      // Validar dados obrigatórios
      if (updates.custom_name !== undefined && !updates.custom_name) {
        console.error('Missing required sale name');
        toast({
          title: "Erro",
          description: "Nome da venda é obrigatório",
          variant: "destructive"
        });
        return false;
      }

      // Remover campos calculados e preparar dados
      const { profit, ...updatesToSave } = updates;
      
      const updateData = {
        ...updatesToSave,
        sale_price: updatesToSave.sale_price !== undefined ? Number(updatesToSave.sale_price) : undefined,
        total_cost: updatesToSave.total_cost !== undefined ? Number(updatesToSave.total_cost) : undefined,
        quantity: updatesToSave.quantity !== undefined ? Number(updatesToSave.quantity) : undefined
      };

      // Remover campos undefined
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      console.log('Final update data:', updateData);

      const { data, error } = await supabase
        .from('sales')
        .update(updateData)
        .eq('id', saleId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Supabase error updating sale:', error);
        throw error;
      }

      console.log('Sale updated successfully:', data);

      // Atualizar itens da venda se fornecidos
      const validItems = items.filter(item => item.customName && item.customName.trim());
      console.log('Updating sale items - valid items count:', validItems.length);
      
      await updateSaleItems(saleId, validItems);

      // Atualizar lista local
      setSales(prevSales => 
        prevSales.map(sale => 
          sale.id === saleId ? data : sale
        )
      );
      
      toast({
        title: "Sucesso",
        description: "Venda atualizada com sucesso"
      });
      return true;
    } catch (error) {
      console.error('Error updating sale:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a venda. Verifique os dados e tente novamente.",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteSale = async (saleId: string) => {
    if (!user) return false;
    
    try {
      console.log('Deleting sale:', saleId);
      
      // Delete sale items first
      await deleteSaleItems(saleId);
      
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', saleId)
        .eq('user_id', user.id);

      if (error) throw error;

      console.log('Sale deleted successfully');
      setSales(prevSales => prevSales.filter(sale => sale.id !== saleId));
      
      toast({
        title: "Sucesso",
        description: "Venda excluída com sucesso"
      });
      return true;
    } catch (error) {
      console.error('Error deleting sale:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a venda",
        variant: "destructive"
      });
      return false;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getPaymentMethodDisplay = (method: string | null) => {
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

  const today = new Date().toISOString().split('T')[0];
  
  // Separate sales by date
  const todaySales = sales.filter(sale => 
    sale.sale_date?.startsWith(today)
  );
  const pastSales = sales.filter(sale => 
    !sale.sale_date?.startsWith(today)
  );

  // Apply plan-based blocking logic
  let allowedSales: Sale[] = [];
  let blockedSales: Sale[] = [];

  // Today's sales - apply daily limits
  const allowedTodaySalesCount = planLimits.sales_per_day === Infinity 
    ? todaySales.length 
    : planLimits.sales_per_day;
  
  const allowedTodaySales = todaySales.slice(0, allowedTodaySalesCount);
  const blockedTodaySales = todaySales.slice(allowedTodaySalesCount);

  // Past sales - apply historical limits based on plan
  let allowedPastSales: Sale[] = [];
  let blockedPastSales: Sale[] = [];

  if (currentPlan === 'free') {
    // Free plan: block all historical sales
    blockedPastSales = pastSales;
  } else if (currentPlan === 'basic') {
    // Basic plan: allow up to 20 historical sales
    allowedPastSales = pastSales.slice(0, 20);
    blockedPastSales = pastSales.slice(20);
  } else {
    // Premium plan: allow all historical sales
    allowedPastSales = pastSales;
  }

  // Combine allowed and blocked sales
  allowedSales = [...allowedTodaySales, ...allowedPastSales];
  blockedSales = [...blockedTodaySales, ...blockedPastSales];
  
  // Apply enhanced search filter
  const filteredAllowedSales = allowedSales.filter(sale => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    
    return (
      sale.customer_name?.toLowerCase().includes(searchLower) ||
      sale.custom_name?.toLowerCase().includes(searchLower) ||
      formatDate(sale.sale_date).includes(searchLower) ||
      getPaymentMethodDisplay(sale.payment_method).toLowerCase().includes(searchLower)
    );
  });

  const filteredBlockedSales = blockedSales.filter(sale => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    
    return (
      sale.customer_name?.toLowerCase().includes(searchLower) ||
      sale.custom_name?.toLowerCase().includes(searchLower) ||
      formatDate(sale.sale_date).includes(searchLower) ||
      getPaymentMethodDisplay(sale.payment_method).toLowerCase().includes(searchLower)
    );
  });

  return {
    sales,
    products,
    recipes,
    loading,
    searchTerm,
    setSearchTerm,
    filteredAllowedSales,
    filteredBlockedSales,
    todaySalesCount: todaySales.length,
    createSale,
    updateSale,
    deleteSale,
    refetch: loadSales
  };
};
