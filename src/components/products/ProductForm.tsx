
import React, { useState, useEffect } from 'react';
import { X, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Product, Recipe } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

interface ProductFormProps {
  product?: Product | null;
  recipes: Recipe[];
  onSubmit: (product: Partial<Product>) => Promise<void>;
  onClose: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ product, recipes, onSubmit, onClose }) => {
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [category, setCategory] = useState(product?.category || '');
  const [recipeId, setRecipeId] = useState(product?.recipe_id || '');
  const [salePrice, setSalePrice] = useState(product?.sale_price || 0);
  const [totalCost, setTotalCost] = useState(product?.total_cost || 0);
  const [finalPrice, setFinalPrice] = useState(product?.final_price || 0);
  const [profit, setProfit] = useState(product?.profit || 0);
  const [margin, setMargin] = useState(product?.margin || 0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (recipeId) {
      const selectedRecipe = recipes.find(r => r.id === recipeId);
      if (selectedRecipe) {
        setTotalCost(selectedRecipe.total_cost || 0);
        setSalePrice(selectedRecipe.suggested_price || 0);
        calculateProfitAndMargin(selectedRecipe.suggested_price || 0, selectedRecipe.total_cost || 0);
      }
    }
  }, [recipeId, recipes]);

  const calculateProfitAndMargin = (price: number, cost: number) => {
    const profitValue = price - cost;
    const marginValue = cost > 0 ? (profitValue / cost) * 100 : 0;
    
    setProfit(profitValue);
    setMargin(marginValue);
    setFinalPrice(price);
  };

  const handleSalePriceChange = (value: number) => {
    setSalePrice(value);
    calculateProfitAndMargin(value, totalCost);
  };

  const handleTotalCostChange = (value: number) => {
    setTotalCost(value);
    calculateProfitAndMargin(salePrice, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        name,
        description: description || null,
        category: category || null,
        recipe_id: recipeId || null,
        sale_price: salePrice,
        total_cost: totalCost,
        final_price: finalPrice,
        profit,
        margin,
      };

      await onSubmit(productData);
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o produto",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {product ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome do Produto</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Brigadeiro Tradicional"
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Categoria</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex: Doces, Bolos, Salgados"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o produto..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="recipe">Receita Base (Opcional)</Label>
            <Select value={recipeId} onValueChange={setRecipeId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma receita" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma receita</SelectItem>
                {recipes.map(recipe => (
                  <SelectItem key={recipe.id} value={recipe.id}>
                    {recipe.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                Precificação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="totalCost">Custo Total</Label>
                  <Input
                    id="totalCost"
                    type="number"
                    value={totalCost}
                    onChange={(e) => handleTotalCostChange(Number(e.target.value))}
                    placeholder="R$ 0,00"
                    step="0.01"
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="salePrice">Preço de Venda</Label>
                  <Input
                    id="salePrice"
                    type="number"
                    value={salePrice}
                    onChange={(e) => handleSalePriceChange(Number(e.target.value))}
                    placeholder="R$ 0,00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    R$ {profit.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Lucro</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {margin.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Margem</div>
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
              {loading ? 'Salvando...' : (product ? 'Atualizar' : 'Criar')} Produto
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
