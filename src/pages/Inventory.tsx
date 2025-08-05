import React, { useState, useEffect } from 'react';
import { Plus, Search, Package2, Edit, Trash2, TrendingDown, TrendingUp, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/contexts/PlanContext';
import { supabase } from '@/integrations/supabase/client';
import { InventoryItem } from '@/types/database';
import { InventoryForm } from '@/components/inventory/InventoryForm';
import { InventoryTable } from '@/components/inventory/InventoryTable';
import { InventoryMovements } from '@/components/inventory/InventoryMovements';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/hooks/use-toast';
import DiscreetPlanInfo from '@/components/common/DiscreetPlanInfo';

export const Inventory: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { planLimits } = usePlan();
  const { toast } = useToast();

  // Calculate allowed inventory items based on plan
  const allowedItemsCount = planLimits.inventory_items === Infinity ? items.length : planLimits.inventory_items;
  const allowedItems = items.slice(0, allowedItemsCount);
  const blockedItems = items.slice(allowedItemsCount);

  const filteredAllowedItems = allowedItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBlockedItems = blockedItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockItems = allowedItems.filter(item => 
    item.min_stock && item.quantity <= item.min_stock
  );

  useEffect(() => {
    if (user) {
      loadItems();
    }
  }, [user]);

  const loadItems = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('user_id', user!.id)
        .order('name');

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error loading inventory:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o inventário",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async () => {
    if (items.length >= allowedItemsCount && planLimits.inventory_items !== Infinity) {
      toast({
        title: "Limite atingido",
        description: "Você atingiu o limite de itens no estoque do seu plano",
        variant: "destructive"
      });
      return;
    }
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    // Check if item is blocked
    const itemIndex = items.findIndex(i => i.id === item.id);
    if (itemIndex >= allowedItemsCount) {
      toast({
        title: "Item bloqueado",
        description: "Este item está bloqueado pelo seu plano atual. Faça upgrade para acessar.",
        variant: "destructive"
      });
      return;
    }
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDeleteItem = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    // Check if item is blocked
    const itemIndex = items.findIndex(i => i.id === id);
    if (itemIndex >= allowedItemsCount) {
      toast({
        title: "Item bloqueado",
        description: "Este item está bloqueado pelo seu plano atual. Faça upgrade para acessar.",
        variant: "destructive"
      });
      return;
    }

    if (!confirm('Tem certeza que deseja excluir este item?')) return;

    try {
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setItems(items.filter(i => i.id !== id));
      toast({
        title: "Sucesso",
        description: "Item excluído com sucesso"
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o item",
        variant: "destructive"
      });
    }
  };

  const handleItemSubmit = async (itemData: Partial<InventoryItem>) => {
    try {
      if (editingItem) {
        const { error } = await supabase
          .from('inventory')
          .update(itemData)
          .eq('id', editingItem.id);

        if (error) throw error;

        setItems(items.map(item => 
          item.id === editingItem.id ? { ...item, ...itemData } : item
        ));
        toast({
          title: "Sucesso",
          description: "Item atualizado com sucesso"
        });
      } else {
        const { data, error } = await supabase
          .from('inventory')
          .insert([{
            name: itemData.name!,
            user_id: user!.id,
            quantity: itemData.quantity!,
            unit: itemData.unit!,
            cost_per_unit: itemData.cost_per_unit!,
            min_stock: itemData.min_stock,
            category: itemData.category,
            supplier: itemData.supplier,
            notes: itemData.notes
          }])
          .select()
          .single();

        if (error) throw error;

        setItems([...items, data]);
        toast({
          title: "Sucesso",
          description: "Item criado com sucesso"
        });
      }

      setIsFormOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving item:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o item",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventário</h1>
          <p className="text-gray-600">
            Controle seu estoque e movimentações
          </p>
        </div>
        <Button onClick={handleCreateItem} className="bg-pink-600 hover:bg-pink-700">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Item
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
            <Package2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allowedItems.length}</div>
            {blockedItems.length > 0 && (
              <p className="text-xs text-muted-foreground">
                +{blockedItems.length} bloqueados
              </p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">
              Itens abaixo do mínimo
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(allowedItems.reduce((total, item) => 
                total + (item.quantity * item.cost_per_unit), 0
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor do estoque
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Buscar por nome, categoria ou fornecedor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Discreet Plan Info */}
      <DiscreetPlanInfo type="inventory_items" currentCount={items.length} />

      {/* Tabs */}
      <Tabs defaultValue="items" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="items">Itens</TabsTrigger>
          <TabsTrigger value="movements">Movimentações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="items" className="space-y-6">
          {/* Low Stock Alert */}
          {lowStockItems.length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-800 flex items-center">
                  <TrendingDown className="h-5 w-5 mr-2" />
                  Alerta de Estoque Baixo
                </CardTitle>
                <CardDescription className="text-orange-700">
                  {lowStockItems.length} item(s) com estoque abaixo do mínimo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lowStockItems.slice(0, 3).map(item => (
                    <div key={item.id} className="flex justify-between items-center">
                      <span className="font-medium text-orange-800">{item.name}</span>
                      <Badge variant="outline" className="border-orange-300 text-orange-700">
                        {item.quantity} {item.unit} (mín: {item.min_stock})
                      </Badge>
                    </div>
                  ))}
                  {lowStockItems.length > 3 && (
                    <p className="text-sm text-orange-600">
                      +{lowStockItems.length - 3} outros itens
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {filteredAllowedItems.length === 0 && filteredBlockedItems.length === 0 ? (
            <EmptyState
              icon={Package2}
              title="Nenhum item encontrado"
              description="Comece adicionando itens ao seu inventário para controlar o estoque"
              actionLabel="Adicionar Item"
              onAction={handleCreateItem}
            />
          ) : (
            <div className="space-y-6">
              {/* Allowed Items Table */}
              {filteredAllowedItems.length > 0 && (
                <InventoryTable
                  items={filteredAllowedItems}
                  onEdit={handleEditItem}
                  onDelete={handleDeleteItem}
                />
              )}

              {/* Blocked Items */}
              {filteredBlockedItems.length > 0 && (
                <div className="space-y-4">
                  <div className="border-t pt-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <Lock className="h-5 w-5 text-gray-400" />
                      <h3 className="text-lg font-semibold text-gray-600">Itens Bloqueados</h3>
                      <Badge variant="secondary">Upgrade necessário</Badge>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <InventoryTable
                        items={filteredBlockedItems}
                        onEdit={handleEditItem}
                        onDelete={handleDeleteItem}
                        blocked={true}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="movements">
          <InventoryMovements onUpdateInventory={loadItems} />
        </TabsContent>
      </Tabs>

      {/* Item Form Modal */}
      {isFormOpen && (
        <InventoryForm
          item={editingItem}
          onSave={handleItemSubmit}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
};

export default Inventory;
