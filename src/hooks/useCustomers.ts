
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Customer, LoyaltyTransaction } from '@/types/database';

export const useCustomers = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadCustomers();
    }
  }, [user]);

  const loadCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type cast to ensure compatibility with our interface
      const typedCustomers = (data || []).map(customer => ({
        ...customer,
        tier: customer.tier as Customer['tier'],
        email: customer.email || null,
        phone: customer.phone || null,
        address: customer.address || null,
        birth_date: customer.birth_date || null,
        last_purchase: customer.last_purchase || null,
        notes: customer.notes || null,
        updated_at: customer.updated_at || null
      }));
      
      setCustomers(typedCustomers as Customer[]);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCustomer = async (customerData: Omit<Customer, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'registration_date'> & { 
    name: string;
  }) => {
    if (!user) return;

    const insertData = {
      user_id: user.id,
      name: customerData.name,
      email: customerData.email || null,
      phone: customerData.phone || null,
      address: customerData.address || null,
      birth_date: customerData.birth_date || null,
      tier: customerData.tier || 'bronze' as const,
      total_spent: customerData.total_spent || 0,
      total_points: customerData.total_points || 0,
      last_purchase: customerData.last_purchase || null,
      notes: customerData.notes || null
    };

    const { data, error } = await supabase
      .from('customers')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    await loadCustomers();
    return data;
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    const { error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    await loadCustomers();
  };

  const deleteCustomer = async (id: string) => {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await loadCustomers();
  };

  const addPoints = async (customerId: string, points: number, description?: string) => {
    if (!user) return;

    // Buscar saldo atual do cliente
    const { data: customer } = await supabase
      .from('customers')
      .select('total_points')
      .eq('id', customerId)
      .single();

    if (!customer) throw new Error('Cliente não encontrado');

    const previousBalance = customer.total_points;
    const newBalance = previousBalance + points;

    // Atualizar pontos do cliente
    const { error: updateError } = await supabase
      .from('customers')
      .update({ total_points: newBalance })
      .eq('id', customerId);

    if (updateError) throw updateError;

    // Criar transação de pontos
    const { error: transactionError } = await supabase
      .from('loyalty_transactions')
      .insert({
        user_id: user.id,
        customer_id: customerId,
        transaction_type: points > 0 ? 'ganho' : 'ajuste',
        points: Math.abs(points),
        previous_balance: previousBalance,
        new_balance: newBalance,
        reference_type: 'manual',
        description: description || (points > 0 ? 'Pontos adicionados manualmente' : 'Ajuste de pontos')
      });

    if (transactionError) throw transactionError;
    await loadCustomers();
  };

  return {
    customers,
    loading,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    addPoints,
    refetch: loadCustomers
  };
};
