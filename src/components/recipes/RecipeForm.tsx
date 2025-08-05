
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Recipe, InventoryItem } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

interface RecipeFormProps {
  recipe?: Recipe | null;
  onSubmit: (recipe: Partial<Recipe>) => Promise<void>;
  onClose: () => void;
}

interface RecipeIngredient {
  id?: string;
  inventory_id: string;
  name: string;
  quantity_needed: number;
  unit: string;
  cost_per_unit: number;
  total_cost: number;
}

export const RecipeForm: React.FC<RecipeFormProps> = ({ recipe, onSubmit, onClose }) => {
  const [name, setName] = useState(recipe?.name || '');
  const [yield_amount, setYieldAmount] = useState(recipe?.yield || 1);
  const [markup, setMarkup] = useState(recipe?.markup || 50);
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadInventoryItems();
    if (recipe) {
      loadRecipeIngredients();
    }
  }, [recipe]);

  const loadInventoryItems = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('user_id', user!.id)
        .order('name');

      if (error) throw error;
      setInventoryItems(data || []);
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
  };

  const loadRecipeIngredients = async () => {
    if (!recipe) return;

    try {
      const { data, error } = await supabase
        .from('recipe_ingredients')
        .select(`
          *,
          inventory:inventory_id (name, unit, cost_per_unit)
        `)
        .eq('recipe_id', recipe.id);

      if (error) throw error;

      const formattedIngredients = data.map(item => ({
        id: item.id,
        inventory_id: item.inventory_id,
        name: item.inventory.name,
        quantity_needed: item.quantity_needed,
        unit: item.unit,
        cost_per_unit: item.cost_per_unit,
        total_cost: item.total_cost || 0
      }));

      setIngredients(formattedIngredients);
    } catch (error) {
      console.error('Error loading recipe ingredients:', error);
    }
  };

  const addIngredient = () => {
    setIngredients([...ingredients, {
      inventory_id: '',
      name: '',
      quantity_needed: 0,
      unit: '',
      cost_per_unit: 0,
      total_cost: 0
    }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof RecipeIngredient, value: any) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };

    if (field === 'inventory_id') {
      const selectedItem = inventoryItems.find(item => item.id === value);
      if (selectedItem) {
        newIngredients[index].name = selectedItem.name;
        newIngredients[index].unit = selectedItem.unit;
        newIngredients[index].cost_per_unit = selectedItem.cost_per_unit;
      }
    }

    if (field === 'quantity_needed' || field === 'cost_per_unit') {
      newIngredients[index].total_cost = newIngredients[index].quantity_needed * newIngredients[index].cost_per_unit;
    }

    setIngredients(newIngredients);
  };

  const calculateTotalCost = () => {
    return ingredients.reduce((total, ingredient) => total + ingredient.total_cost, 0);
  };

  const calculateSuggestedPrice = () => {
    const totalCost = calculateTotalCost();
    return totalCost * (1 + markup / 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const totalCost = calculateTotalCost();
      const suggestedPrice = calculateSuggestedPrice();

      const recipeData = {
        name,
        yield: yield_amount,
        markup,
        total_cost: totalCost,
        suggested_price: suggestedPrice,
        ingredients: ingredients
      };

      await onSubmit(recipeData);

      // Save recipe ingredients
      if (recipe) {
        // Delete existing ingredients
        await supabase
          .from('recipe_ingredients')
          .delete()
          .eq('recipe_id', recipe.id);
      }

      // Get the recipe ID (either from existing recipe or from the created one)
      const recipeId = recipe?.id;
      if (recipeId) {
        const ingredientsData = ingredients.map(ingredient => ({
          recipe_id: recipeId,
          inventory_id: ingredient.inventory_id,
          quantity_needed: ingredient.quantity_needed,
          unit: ingredient.unit,
          cost_per_unit: ingredient.cost_per_unit,
          total_cost: ingredient.total_cost
        }));

        await supabase
          .from('recipe_ingredients')
          .insert(ingredientsData);
      }

    } catch (error) {
      console.error('Error saving recipe:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a receita",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {recipe ? 'Editar Receita' : 'Nova Receita'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="name">Nome da Receita</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Brigadeiro Gourmet"
                required
              />
            </div>
            <div>
              <Label htmlFor="yield">Rendimento</Label>
              <Input
                id="yield"
                type="number"
                value={yield_amount}
                onChange={(e) => setYieldAmount(Number(e.target.value))}
                placeholder="Ex: 50"
                min="1"
                required
              />
            </div>
            <div>
              <Label htmlFor="markup">Markup (%)</Label>
              <Input
                id="markup"
                type="number"
                value={markup}
                onChange={(e) => setMarkup(Number(e.target.value))}
                placeholder="Ex: 50"
                min="0"
                required
              />
            </div>
          </div>

          {/* Ingredients */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Ingredientes</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {ingredients.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Nenhum ingrediente adicionado
                </p>
              ) : (
                <div className="space-y-4">
                  {ingredients.map((ingredient, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                      <div className="md:col-span-2">
                        <Label>Ingrediente</Label>
                        <Select
                          value={ingredient.inventory_id}
                          onValueChange={(value) => updateIngredient(index, 'inventory_id', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um ingrediente" />
                          </SelectTrigger>
                          <SelectContent>
                            {inventoryItems.map(item => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Quantidade</Label>
                        <Input
                          type="number"
                          value={ingredient.quantity_needed}
                          onChange={(e) => updateIngredient(index, 'quantity_needed', Number(e.target.value))}
                          placeholder="0"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <Label>Unidade</Label>
                        <Input
                          value={ingredient.unit}
                          placeholder="kg, g, ml..."
                          disabled
                        />
                      </div>
                      <div>
                        <Label>Custo/Unidade</Label>
                        <Input
                          type="number"
                          value={ingredient.cost_per_unit}
                          placeholder="R$ 0,00"
                          disabled
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Total</Label>
                          <div className="text-sm font-medium">
                            R$ {ingredient.total_cost.toFixed(2)}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeIngredient(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Calculations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                Cálculos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    R$ {calculateTotalCost().toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Custo Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    R$ {calculateSuggestedPrice().toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Preço Sugerido</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    R$ {yield_amount ? (calculateSuggestedPrice() / yield_amount).toFixed(2) : '0,00'}
                  </div>
                  <div className="text-sm text-gray-600">Preço por Unidade</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-pink-600 hover:bg-pink-700">
              {loading ? 'Salvando...' : (recipe ? 'Atualizar' : 'Criar')} Receita
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
