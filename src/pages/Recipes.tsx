import React, { useState, useEffect } from 'react';
import { Plus, Search, ChefHat, Calculator, Edit, Trash2, Eye, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/contexts/PlanContext';
import { supabase } from '@/integrations/supabase/client';
import { Recipe } from '@/types/database';
import { RecipeForm } from '@/components/recipes/RecipeForm';
import { RecipeDetails } from '@/components/recipes/RecipeDetails';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/hooks/use-toast';
import DiscreetPlanInfo from '@/components/common/DiscreetPlanInfo';

export const Recipes: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { canCreateMore, currentPlan, planLimits } = usePlan();
  const { toast } = useToast();

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate allowed recipes based on plan
  const allowedRecipesCount = planLimits.recipes === Infinity ? recipes.length : planLimits.recipes;
  const allowedRecipes = recipes.slice(0, allowedRecipesCount);
  const blockedRecipes = recipes.slice(allowedRecipesCount);

  const filteredAllowedRecipes = allowedRecipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBlockedRecipes = blockedRecipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (user) {
      loadRecipes();
    }
  }, [user]);

  const loadRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecipes(data || []);
    } catch (error) {
      console.error('Error loading recipes:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as receitas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRecipe = async () => {
    const canCreate = await canCreateMore('recipes');
    if (!canCreate) {
      toast({
        title: "Limite atingido",
        description: "Você atingiu o limite de receitas do seu plano",
        variant: "destructive"
      });
      return;
    }
    setEditingRecipe(null);
    setIsFormOpen(true);
  };

  const handleEditRecipe = (recipe: Recipe) => {
    // Check if recipe is blocked
    const recipeIndex = recipes.findIndex(r => r.id === recipe.id);
    if (recipeIndex >= allowedRecipesCount) {
      toast({
        title: "Receita bloqueada",
        description: "Esta receita está bloqueada pelo seu plano atual. Faça upgrade para acessar.",
        variant: "destructive"
      });
      return;
    }
    setEditingRecipe(recipe);
    setIsFormOpen(true);
  };

  const handleDeleteRecipe = async (recipe: Recipe) => {
    // Check if recipe is blocked
    const recipeIndex = recipes.findIndex(r => r.id === recipe.id);
    if (recipeIndex >= allowedRecipesCount) {
      toast({
        title: "Receita bloqueada",
        description: "Esta receita está bloqueada pelo seu plano atual. Faça upgrade para acessar.",
        variant: "destructive"
      });
      return;
    }

    if (!confirm('Tem certeza que deseja excluir esta receita?')) return;

    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', recipe.id);

      if (error) throw error;

      setRecipes(recipes.filter(r => r.id !== recipe.id));
      toast({
        title: "Sucesso",
        description: "Receita excluída com sucesso"
      });
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a receita",
        variant: "destructive"
      });
    }
  };

  const handleViewRecipe = (recipe: Recipe) => {
    // Check if recipe is blocked
    const recipeIndex = recipes.findIndex(r => r.id === recipe.id);
    if (recipeIndex >= allowedRecipesCount) {
      toast({
        title: "Receita bloqueada",
        description: "Esta receita está bloqueada pelo seu plano atual. Faça upgrade para acessar.",
        variant: "destructive"
      });
      return;
    }
    setSelectedRecipe(recipe);
  };

  const handleRecipeSubmit = async (recipeData: Partial<Recipe>) => {
    try {
      if (editingRecipe) {
        const { error } = await supabase
          .from('recipes')
          .update(recipeData)
          .eq('id', editingRecipe.id);

        if (error) throw error;

        setRecipes(recipes.map(r => 
          r.id === editingRecipe.id ? { ...r, ...recipeData } : r
        ));
        toast({
          title: "Sucesso",
          description: "Receita atualizada com sucesso"
        });
      } else {
        const { data, error } = await supabase
          .from('recipes')
          .insert([{
            name: recipeData.name!,
            user_id: user!.id,
            ingredients: recipeData.ingredients || null,
            yield: recipeData.yield || null,
            markup: recipeData.markup || null,
            total_cost: recipeData.total_cost || null,
            suggested_price: recipeData.suggested_price || null
          }])
          .select()
          .single();

        if (error) throw error;

        setRecipes([data, ...recipes]);
        toast({
          title: "Sucesso",
          description: "Receita criada com sucesso"
        });
      }

      setIsFormOpen(false);
      setEditingRecipe(null);
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a receita",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return 'R$ 0,00';
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
          <h1 className="text-2xl font-bold text-gray-900">Receitas</h1>
          <p className="text-gray-600">
            Gerencie suas receitas e calcule custos automaticamente
          </p>
        </div>
        <Button onClick={handleCreateRecipe} className="bg-pink-600 hover:bg-pink-700">
          <Plus className="h-4 w-4 mr-2" />
          Nova Receita
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Buscar receitas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Discreet Plan Info */}
      <DiscreetPlanInfo type="recipes" currentCount={recipes.length} />

      {/* Recipes Grid */}
      {filteredAllowedRecipes.length === 0 && filteredBlockedRecipes.length === 0 ? (
        <EmptyState
          icon={ChefHat}
          title="Nenhuma receita encontrada"
          description="Comece criando sua primeira receita para calcular custos e precificar seus produtos"
          actionLabel="Criar Receita"
          onAction={handleCreateRecipe}
        />
      ) : (
        <div className="space-y-6">
          {/* Allowed Recipes */}
          {filteredAllowedRecipes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAllowedRecipes.map((recipe) => (
                <Card key={recipe.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{recipe.name}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewRecipe(recipe)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditRecipe(recipe)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRecipe(recipe)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      {recipe.yield ? `Rendimento: ${recipe.yield}` : 'Sem rendimento definido'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Custo Total:</span>
                        <span className="font-medium">{formatCurrency(recipe.total_cost)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Preço Sugerido:</span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(recipe.suggested_price)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Markup:</span>
                        <span className="font-medium">
                          {recipe.markup ? `${recipe.markup}%` : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Blocked Recipes */}
          {filteredBlockedRecipes.length > 0 && (
            <div className="space-y-4">
              <div className="border-t pt-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Lock className="h-5 w-5 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-600">Receitas Bloqueadas</h3>
                  <Badge variant="secondary">Upgrade necessário</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBlockedRecipes.map((recipe) => (
                    <Card key={recipe.id} className="opacity-60 border-gray-300">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg text-gray-500 flex items-center">
                            <Lock className="h-4 w-4 mr-2" />
                            {recipe.name}
                          </CardTitle>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewRecipe(recipe)}
                              disabled
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditRecipe(recipe)}
                              disabled
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteRecipe(recipe)}
                              disabled
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                        <CardDescription className="text-gray-400">
                          {recipe.yield ? `Rendimento: ${recipe.yield}` : 'Sem rendimento definido'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-400">Custo Total:</span>
                            <span className="font-medium text-gray-400">{formatCurrency(recipe.total_cost)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-400">Preço Sugerido:</span>
                            <span className="font-medium text-gray-400">
                              {formatCurrency(recipe.suggested_price)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-400">Markup:</span>
                            <span className="font-medium text-gray-400">
                              {recipe.markup ? `${recipe.markup}%` : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recipe Form Modal */}
      {isFormOpen && (
        <RecipeForm
          recipe={editingRecipe}
          onSubmit={handleRecipeSubmit}
          onClose={() => {
            setIsFormOpen(false);
            setEditingRecipe(null);
          }}
        />
      )}

      {/* Recipe Details Modal */}
      {selectedRecipe && (
        <RecipeDetails
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          onEdit={() => {
            setEditingRecipe(selectedRecipe);
            setSelectedRecipe(null);
            setIsFormOpen(true);
          }}
        />
      )}
    </div>
  );
};
