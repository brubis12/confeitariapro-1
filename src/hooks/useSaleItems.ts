
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SaleItem } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export const useSaleItems = (initialSaleId?: string) => {
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadSaleItems = useCallback(async (saleId: string) => {
    if (!saleId) {
      console.log('No saleId provided to loadSaleItems');
      return [];
    }
    
    try {
      setLoading(true);
      console.log('Loading sale items for sale ID:', saleId);
      
      const { data, error } = await supabase
        .from('sale_items')
        .select('*')
        .eq('sale_id', saleId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Supabase error loading sale items:', error);
        throw error;
      }
      
      console.log('Successfully loaded sale items:', data?.length || 0, 'items', data);
      setSaleItems(data || []);
      return data || [];
    } catch (error) {
      console.error('Error loading sale items:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os itens da venda",
        variant: "destructive"
      });
      setSaleItems([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createSaleItems = useCallback(async (saleId: string, items: any[]) => {
    if (!saleId || !items || items.length === 0) {
      console.log('No saleId or items provided to createSaleItems');
      return [];
    }
    
    try {
      console.log('Creating sale items for sale:', saleId, 'items:', items);
      
      // Preparar dados dos itens - REMOVENDO colunas geradas (total_price, total_cost, profit)
      const saleItemsData = items
        .filter(item => item.customName && item.customName.trim()) // Filtrar itens vazios
        .map(item => {
          const itemData = {
            sale_id: saleId,
            item_type: item.type || 'custom',
            product_id: item.type === 'product' ? item.productId : null,
            recipe_id: item.type === 'recipe' ? item.recipeId : null,
            product_name: item.type === 'product' ? item.customName : null,
            recipe_name: item.type === 'recipe' ? item.customName : null,
            custom_name: item.customName || null,
            quantity: Number(item.quantity) || 1,
            unit_price: Number(item.unitPrice) || 0,
            unit_cost: Number(item.unitCost) || 0
            // NÃO incluir: total_price, total_cost, profit (são calculados pelo banco)
          };
          
          console.log('Prepared item data:', itemData);
          return itemData;
        });

      if (saleItemsData.length === 0) {
        console.log('No valid items to create');
        return [];
      }

      console.log('Final sale items data to insert:', saleItemsData);

      const { data, error } = await supabase
        .from('sale_items')
        .insert(saleItemsData)
        .select();

      if (error) {
        console.error('Supabase error creating sale items:', error);
        throw error;
      }
      
      console.log('Sale items created successfully:', data?.length || 0, 'items');
      return data || [];
    } catch (error) {
      console.error('Error creating sale items:', error);
      throw error;
    }
  }, []);

  const updateSaleItems = useCallback(async (saleId: string, items: any[]) => {
    if (!saleId) {
      console.log('No saleId provided to updateSaleItems');
      return [];
    }
    
    try {
      console.log('Updating sale items for sale:', saleId, 'with items:', items);
      
      // Primeiro, deletar itens existentes
      const { error: deleteError } = await supabase
        .from('sale_items')
        .delete()
        .eq('sale_id', saleId);

      if (deleteError) {
        console.error('Error deleting existing sale items:', deleteError);
        throw deleteError;
      }

      console.log('Existing sale items deleted successfully');

      // Criar novos itens se houver algum válido
      const validItems = items.filter(item => item.customName && item.customName.trim());
      
      if (validItems.length > 0) {
        const newItems = await createSaleItems(saleId, validItems);
        setSaleItems(newItems);
        return newItems;
      } else {
        console.log('No valid items to create');
        setSaleItems([]);
        return [];
      }
    } catch (error) {
      console.error('Error updating sale items:', error);
      throw error;
    }
  }, [createSaleItems]);

  const deleteSaleItems = useCallback(async (saleId: string) => {
    if (!saleId) {
      console.log('No saleId provided to deleteSaleItems');
      return;
    }
    
    try {
      console.log('Deleting sale items for sale:', saleId);
      
      const { error } = await supabase
        .from('sale_items')
        .delete()
        .eq('sale_id', saleId);

      if (error) {
        console.error('Error deleting sale items:', error);
        throw error;
      }
      
      console.log('Sale items deleted successfully');
      setSaleItems([]);
    } catch (error) {
      console.error('Error deleting sale items:', error);
      throw error;
    }
  }, []);

  return {
    saleItems,
    loading,
    createSaleItems,
    updateSaleItems,
    deleteSaleItems,
    loadSaleItems
  };
};
