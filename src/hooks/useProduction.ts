
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ProductionOrder } from '@/types/database';

export const useProduction = () => {
  const { user } = useAuth();
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProductionOrders();
    }
  }, [user]);

  const loadProductionOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('production_orders')
        .select(`
          *,
          products(name),
          recipes(name)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type cast to ensure compatibility with our interface
      const typedOrders = (data || []).map(order => ({
        ...order,
        status: order.status as ProductionOrder['status'],
        priority: order.priority as ProductionOrder['priority'],
        product_id: order.product_id || null,
        recipe_id: order.recipe_id || null,
        custom_product_name: order.custom_product_name || null,
        responsible: order.responsible || null,
        actual_end_date: order.actual_end_date || null,
        notes: order.notes || null,
        updated_at: order.updated_at || null
      }));
      
      setProductionOrders(typedOrders as ProductionOrder[]);
    } catch (error) {
      console.error('Error loading production orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProductionOrder = async (orderData: Omit<ProductionOrder, 'id' | 'user_id' | 'created_at' | 'updated_at'> & {
    quantity: number;
    start_date: string;
    expected_end_date: string;
  }) => {
    if (!user) return;

    const insertData = {
      user_id: user.id,
      product_id: orderData.product_id || null,
      recipe_id: orderData.recipe_id || null,
      custom_product_name: orderData.custom_product_name || null,
      quantity: orderData.quantity,
      status: orderData.status || 'agendado' as const,
      priority: orderData.priority || 'media' as const,
      responsible: orderData.responsible || null,
      start_date: orderData.start_date,
      expected_end_date: orderData.expected_end_date,
      actual_end_date: orderData.actual_end_date || null,
      notes: orderData.notes || null
    };

    const { data, error } = await supabase
      .from('production_orders')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    
    await loadProductionOrders();
    return data;
  };

  const updateProductionOrder = async (id: string, updates: Partial<ProductionOrder>) => {
    const { error } = await supabase
      .from('production_orders')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    await loadProductionOrders();
  };

  const deleteProductionOrder = async (id: string) => {
    const { error } = await supabase
      .from('production_orders')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await loadProductionOrders();
  };

  const updateStatus = async (id: string, status: ProductionOrder['status']) => {
    const updates: Partial<ProductionOrder> = { status };
    
    // Se estiver concluindo, adicionar data atual
    if (status === 'concluido') {
      updates.actual_end_date = new Date().toISOString();
    }

    await updateProductionOrder(id, updates);
  };

  return {
    productionOrders,
    loading,
    createProductionOrder,
    updateProductionOrder,
    deleteProductionOrder,
    updateStatus,
    refetch: loadProductionOrders
  };
};
