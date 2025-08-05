
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useInventoryMovement = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const createMovement = async (
    inventoryId: string,
    quantity: number,
    movementType: 'in' | 'out' | 'adjustment',
    reason?: string,
    referenceId?: string
  ) => {
    if (!user) return;

    try {
      // Get current inventory item
      const { data: currentItem, error: fetchError } = await supabase
        .from('inventory')
        .select('*')
        .eq('id', inventoryId)
        .single();

      if (fetchError) throw fetchError;

      const previousQuantity = currentItem.quantity;
      const newQuantity = movementType === 'out' ? 
        previousQuantity - quantity : 
        movementType === 'in' ? 
          previousQuantity + quantity : 
          quantity;

      // Update inventory quantity
      const { error: updateError } = await supabase
        .from('inventory')
        .update({ 
          quantity: newQuantity,
          last_updated: new Date().toISOString()
        })
        .eq('id', inventoryId);

      if (updateError) throw updateError;

      // Create movement record
      const { error: movementError } = await supabase
        .from('inventory_movements')
        .insert({
          user_id: user.id,
          inventory_id: inventoryId,
          quantity: movementType === 'out' ? -quantity : quantity,
          movement_type: movementType,
          previous_quantity: previousQuantity,
          new_quantity: newQuantity,
          reason: reason || '',
          reference_id: referenceId
        });

      if (movementError) throw movementError;

      return { success: true, newQuantity };
    } catch (error) {
      console.error('Error creating inventory movement:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o estoque",
        variant: "destructive"
      });
      return { success: false };
    }
  };

  const getMovements = async (inventoryId?: string) => {
    if (!user) return [];

    try {
      let query = supabase
        .from('inventory_movements')
        .select(`
          *,
          inventory:inventory_id (
            name,
            unit
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (inventoryId) {
        query = query.eq('inventory_id', inventoryId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching inventory movements:', error);
      return [];
    }
  };

  return {
    createMovement,
    getMovements
  };
};
