import React, { useState, useEffect } from 'react';
import { X, Edit, Calculator, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Recipe, RecipeIngredient } from '@/types/database';

interface RecipeDetailsProps {
  recipe: Recipe;
  onClose: () => void;
  onEdit: () => void;
}

interface RecipeIngredientWithInventory extends RecipeIngredient {
  inventory: {
    name: string;
    unit: string;
  };
}

export const RecipeDetails: React.FC<RecipeDetailsProps> = ({ recipe, onClose, onEdit }) => {
  const [ingredients, setIngredients] = useState<RecipeIngredientWithInventory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIngredients();
  }, [recipe]);

  const loadIngredients = async () => {
    try {
      const { data, error } = await supabase
        .from('recipe_ingredients')
        .select(`
          *,
          inventory:inventory_id (name, unit)
        `)
        .eq('recipe_id', recipe.id);

      if (error) throw error;
      setIngredients(data || []);
    } catch (error) {
      console.error('Error loading ingredients:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center">
            <ChefHat className="h-5 w-5 mr-2" />
            {recipe.name}
          </h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Recipe Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Rendimento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{recipe.yield || 'N/A'}</div>
                <div className="text-sm text-gray-500">unidades</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Custo Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(recipe.total_cost)}
                </div>
                <div className="text-sm text-gray-500">custo da receita</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Preço Sugerido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(recipe.suggested_price)}
                </div>
                <div className="text-sm text-gray-500">com markup</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Markup</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {recipe.markup || 0}%
                </div>
                <div className="text-sm text-gray-500">margem aplicada</div>
              </CardContent>
            </Card>
          </div>

          {/* Profit Calculation */}
          {recipe.total_cost && recipe.suggested_price && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Calculator className="h-5 w-5 mr-2" />
                  Análise de Lucro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600">
                      {formatCurrency(recipe.total_cost)}
                    </div>
                    <div className="text-sm text-gray-600">Custo</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {formatCurrency(recipe.suggested_price - recipe.total_cost)}
                    </div>
                    <div className="text-sm text-gray-600">Lucro</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {recipe.yield ? formatCurrency((recipe.suggested_price - recipe.total_cost) / recipe.yield) : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">Lucro por Unidade</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ingredients List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ingredientes</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-600 mx-auto"></div>
                </div>
              ) : ingredients.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Nenhum ingrediente encontrado
                </p>
              ) : (
                <div className="space-y-3">
                  {ingredients.map((ingredient) => (
                    <div key={ingredient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{ingredient.inventory?.name}</div>
                        <div className="text-sm text-gray-600">
                          {ingredient.quantity_needed} {ingredient.unit} × {formatCurrency(ingredient.cost_per_unit)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatCurrency(ingredient.total_cost)}</div>
                        <Badge variant="secondary" className="text-xs">
                          {ingredient.unit}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recipe Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações da Receita</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Criado em</div>
                  <div className="font-medium">{formatDate(recipe.created_at)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Custo por Unidade</div>
                  <div className="font-medium">
                    {recipe.yield && recipe.total_cost ? 
                      formatCurrency(recipe.total_cost / recipe.yield) : 
                      'N/A'
                    }
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
