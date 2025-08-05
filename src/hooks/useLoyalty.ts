
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { LoyaltyReward, LoyaltyTransaction } from '@/types/database';

export const useLoyalty = () => {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadRewards();
      loadTransactions();
    }
  }, [user]);

  const loadRewards = async () => {
    try {
      const { data, error } = await supabase
        .from('loyalty_rewards')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type cast to ensure compatibility with our interface
      const typedRewards = (data || []).map(reward => ({
        ...reward,
        category: reward.category as LoyaltyReward['category'],
        discount_percentage: reward.discount_percentage || null,
        discount_value: reward.discount_value || null,
        product_id: reward.product_id || null,
        expiration_days: reward.expiration_days || null,
        usage_limit: reward.usage_limit || null,
        updated_at: reward.updated_at || null
      }));
      
      setRewards(typedRewards as LoyaltyReward[]);
    } catch (error) {
      console.error('Error loading loyalty rewards:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('loyalty_transactions')
        .select(`
          *,
          customers!customer_id(name, email)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      // Type cast to ensure compatibility with our interface
      const typedTransactions = (data || []).map(transaction => ({
        ...transaction,
        transaction_type: transaction.transaction_type as LoyaltyTransaction['transaction_type'],
        reference_id: transaction.reference_id || null,
        reference_type: transaction.reference_type as LoyaltyTransaction['reference_type'],
        description: transaction.description || null
      }));
      
      setTransactions(typedTransactions as LoyaltyTransaction[]);
    } catch (error) {
      console.error('Error loading loyalty transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const createReward = async (rewardData: Omit<LoyaltyReward, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'is_active'> & {
    name: string;
    description: string;
    points_required: number;
    category: 'desconto' | 'produto' | 'servico';
  }) => {
    if (!user) return;

    const insertData = {
      user_id: user.id,
      name: rewardData.name,
      description: rewardData.description,
      points_required: rewardData.points_required,
      category: rewardData.category,
      discount_percentage: rewardData.discount_percentage || null,
      discount_value: rewardData.discount_value || null,
      product_id: rewardData.product_id || null,
      expiration_days: rewardData.expiration_days || null,
      usage_limit: rewardData.usage_limit || null,
      is_active: true
    };

    const { data, error } = await supabase
      .from('loyalty_rewards')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    
    await loadRewards();
    return data;
  };

  const updateReward = async (id: string, updates: Partial<LoyaltyReward>) => {
    const { error } = await supabase
      .from('loyalty_rewards')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    await loadRewards();
  };

  const deleteReward = async (id: string) => {
    const { error } = await supabase
      .from('loyalty_rewards')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await loadRewards();
  };

  const redeemReward = async (customerId: string, rewardId: string) => {
    if (!user) return;

    // Buscar dados da recompensa e cliente
    const { data: reward } = await supabase
      .from('loyalty_rewards')
      .select('*')
      .eq('id', rewardId)
      .single();

    const { data: customer } = await supabase
      .from('customers')
      .select('total_points')
      .eq('id', customerId)
      .single();

    if (!reward || !customer) throw new Error('Recompensa ou cliente não encontrado');

    if (customer.total_points < reward.points_required) {
      throw new Error('Pontos insuficientes para resgatar esta recompensa');
    }

    const previousBalance = customer.total_points;
    const newBalance = previousBalance - reward.points_required;

    // Atualizar pontos do cliente
    const { error: updateError } = await supabase
      .from('customers')
      .update({ total_points: newBalance })
      .eq('id', customerId);

    if (updateError) throw updateError;

    // Criar transação de resgate
    const { error } = await supabase
      .from('loyalty_transactions')
      .insert({
        user_id: user.id,
        customer_id: customerId,
        transaction_type: 'resgate',
        points: reward.points_required,
        previous_balance: previousBalance,
        new_balance: newBalance,
        reference_id: rewardId,
        reference_type: 'reward',
        description: `Resgate: ${reward.name}`
      });

    if (error) throw error;
    await loadTransactions();
  };

  return {
    rewards,
    transactions,
    loading,
    createReward,
    updateReward,
    deleteReward,
    redeemReward,
    refetch: () => {
      loadRewards();
      loadTransactions();
    }
  };
};
