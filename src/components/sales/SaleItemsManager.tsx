import React from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Product } from '@/types/database';

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

interface SaleItemsManagerProps {
  products: Product[];
  recipes: any[];
  items: SaleItem[];
  onChange: (items: SaleItem[]) => void;
}

export const SaleItemsManager: React.FC<SaleItemsManagerProps> = ({
  products,
  recipes,
  items,
  onChange
}) => {
  const addItem = () => {
    console.log('Adicionar Item button clicked');
    console.log('Current items count:', items.length);
    
    const newItem: SaleItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'custom',
      customName: '',
      quantity: 1,
      unitPrice: 0,
      unitCost: 0
    };
    
    console.log('Creating new item:', newItem);
    
    const updatedItems = [...items, newItem];
    console.log('Updated items array:', updatedItems);
    
    onChange(updatedItems);
  };

  const removeItem = (id: string) => {
    console.log('Removing item with id:', id);
    const updatedItems = items.filter(item => item.id !== id);
    console.log('Items after removal:', updatedItems);
    onChange(updatedItems);
  };

  const updateItem = (id: string, updates: Partial<SaleItem>) => {
    console.log('Updating item:', id, 'with updates:', updates);
    const updatedItems = items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    console.log('Items after update:', updatedItems);
    onChange(updatedItems);
  };

  const handleTypeChange = (id: string, type: 'product' | 'recipe' | 'custom') => {
    const updates: Partial<SaleItem> = { 
      type, 
      productId: undefined, 
      recipeId: undefined,
      customName: '',
      unitPrice: 0,
      unitCost: 0
    };
    
    updateItem(id, updates);
  };

  const handleProductSelect = (id: string, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      updateItem(id, {
        productId,
        customName: product.name,
        unitPrice: Number(product.final_price || product.sale_price || 0),
        unitCost: Number(product.total_cost || 0)
      });
    }
  };

  const handleRecipeSelect = (id: string, recipeId: string) => {
    const recipe = recipes.find(r => r.id === recipeId);
    if (recipe) {
      updateItem(id, {
        recipeId,
        customName: recipe.name,
        unitPrice: Number(recipe.suggested_price || 0),
        unitCost: Number(recipe.total_cost || 0)
      });
    }
  };

  const calculateItemSubtotal = (item: SaleItem) => {
    return Number(item.unitPrice) * Number(item.quantity);
  };

  const calculateItemCostSubtotal = (item: SaleItem) => {
    return Number(item.unitCost) * Number(item.quantity);
  };

  const calculateTotal = () => {
    const validItems = items.filter(item => item.customName.trim());
    return validItems.reduce((total, item) => total + calculateItemSubtotal(item), 0);
  };

  const calculateTotalCost = () => {
    const validItems = items.filter(item => item.customName.trim());
    return validItems.reduce((total, item) => total + calculateItemCostSubtotal(item), 0);
  };

  const calculateProfit = () => {
    return calculateTotal() - calculateTotalCost();
  };

  const getValidItemsCount = () => {
    return items.filter(item => item.customName.trim()).length;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Itens da Venda</CardTitle>
        <Button 
          onClick={addItem} 
          size="sm" 
          variant="outline"
          type="button"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Item
        </Button>
      </CardHeader>
      <CardContent>
        {/* Items List */}
        <div className="space-y-6">
          {items.map((item, index) => {
            const isValid = item.customName.trim() !== '';
            
            return (
              <Card key={item.id} className={`border-2 border-dashed ${isValid ? 'border-green-200 bg-green-50/30' : 'border-gray-200 bg-gray-50/50'}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium text-gray-600">
                        Item #{index + 1}
                      </div>
                      {!isValid && (
                        <span className="text-xs text-red-500 bg-red-100 px-2 py-1 rounded">
                          Nome obrigatório
                        </span>
                      )}
                    </div>
                    <Button
                      onClick={() => removeItem(item.id)}
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      type="button"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Type Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Tipo *</Label>
                      <Select
                        value={item.type}
                        onValueChange={(value) => handleTypeChange(item.id, value as 'product' | 'recipe' | 'custom')}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="product">Produto</SelectItem>
                          <SelectItem value="recipe">Receita</SelectItem>
                          <SelectItem value="custom">Personalizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Product Selection */}
                    {item.type === 'product' && (
                      <div>
                        <Label>Produto *</Label>
                        <Select
                          value={item.productId || ''}
                          onValueChange={(value) => handleProductSelect(item.id, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um produto" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.length === 0 ? (
                              <SelectItem value="" disabled>Nenhum produto disponível</SelectItem>
                            ) : (
                              products.map(product => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name} - R$ {Number(product.final_price || product.sale_price || 0).toFixed(2)}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Recipe Selection */}
                    {item.type === 'recipe' && (
                      <div>
                        <Label>Receita *</Label>
                        <Select
                          value={item.recipeId || ''}
                          onValueChange={(value) => handleRecipeSelect(item.id, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma receita" />
                          </SelectTrigger>
                          <SelectContent>
                            {recipes.length === 0 ? (
                              <SelectItem value="" disabled>Nenhuma receita disponível</SelectItem>
                            ) : (
                              recipes.map(recipe => (
                                <SelectItem key={recipe.id} value={recipe.id}>
                                  {recipe.name} - R$ {Number(recipe.suggested_price || 0).toFixed(2)}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* Nome do Item */}
                  <div>
                    <Label>Nome do Item *</Label>
                    <Input
                      value={item.customName}
                      onChange={(e) => updateItem(item.id, { customName: e.target.value })}
                      placeholder="Digite o nome do item"
                      className={!isValid ? 'border-red-300 focus:border-red-500' : ''}
                    />
                  </div>

                  {/* Quantity, Price, Cost Row */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Quantidade *</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, { quantity: Math.max(1, Number(e.target.value) || 1) })}
                        min="1"
                        step="1"
                      />
                    </div>
                    <div>
                      <Label>Preço Unitário (R$) *</Label>
                      <Input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, { unitPrice: Math.max(0, Number(e.target.value) || 0) })}
                        step="0.01"
                        min="0"
                        placeholder="0,00"
                      />
                    </div>
                    <div>
                      <Label>Custo Unitário (R$)</Label>
                      <Input
                        type="number"
                        value={item.unitCost}
                        onChange={(e) => updateItem(item.id, { unitCost: Math.max(0, Number(e.target.value) || 0) })}
                        step="0.01"
                        min="0"
                        placeholder="0,00"
                      />
                    </div>
                    <div>
                      <Label>Subtotal</Label>
                      <div className="h-10 px-3 py-2 bg-white border rounded-md flex items-center text-sm font-medium">
                        R$ {calculateItemSubtotal(item).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Item Summary */}
                  {isValid && (
                    <div className="bg-blue-50 p-3 rounded-md">
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>Receita: R$ {calculateItemSubtotal(item).toFixed(2)}</div>
                        <div>Custo: R$ {calculateItemCostSubtotal(item).toFixed(2)}</div>
                        <div className="font-medium">Lucro: R$ {(calculateItemSubtotal(item) - calculateItemCostSubtotal(item)).toFixed(2)}</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {items.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
            <div className="text-gray-500">
              <Plus className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p className="text-lg font-medium mb-2">Nenhum item adicionado ainda</p>
              <p className="text-sm mb-4">Adicione produtos, receitas ou itens personalizados à sua venda</p>
              <Button onClick={addItem} variant="outline" type="button">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Item
              </Button>
            </div>
          </div>
        )}

        {/* Totals Summary */}
        {items.length > 0 && (
          <div className="mt-8 pt-6 border-t">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Resumo da Venda</h3>
                
                {getValidItemsCount() === 0 ? (
                  <div className="text-center text-yellow-700 bg-yellow-100 p-4 rounded-lg">
                    <p className="font-medium">⚠️ Nenhum item válido</p>
                    <p className="text-sm">Adicione pelo menos um item com nome para prosseguir</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-2xl font-bold text-green-600">
                        R$ {calculateTotal().toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Total da Venda</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {getValidItemsCount()} {getValidItemsCount() === 1 ? 'item válido' : 'itens válidos'}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-2xl font-bold text-red-600">
                        R$ {calculateTotalCost().toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Custo Total</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-2xl font-bold text-blue-600">
                        R$ {calculateProfit().toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Lucro Total</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {calculateTotal() > 0 ? (
                          <>
                            {calculateProfit() > 0 ? '+' : ''}{((calculateProfit() / calculateTotal()) * 100).toFixed(1)}% margem
                          </>
                        ) : (
                          '0% margem'
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
