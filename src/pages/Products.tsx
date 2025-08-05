import React, { useState, useEffect } from 'react';
import { Plus, Search, Package, Edit, Trash2, Eye, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/contexts/PlanContext';
import { supabase } from '@/integrations/supabase/client';
import { Product, Recipe } from '@/types/database';
import { ProductForm } from '@/components/products/ProductForm';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/hooks/use-toast';
import DiscreetPlanInfo from '@/components/common/DiscreetPlanInfo';

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { canCreateMore, currentPlan, planLimits } = usePlan();
  const { toast } = useToast();

  // Calculate allowed products based on plan
  const allowedProductsCount = planLimits.products === Infinity ? products.length : planLimits.products;
  const allowedProducts = products.slice(0, allowedProductsCount);
  const blockedProducts = products.slice(allowedProductsCount);

  const filteredAllowedProducts = allowedProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBlockedProducts = blockedProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (user) {
      loadProducts();
      loadRecipes();
    }
  }, [user]);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os produtos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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
    }
  };

  const handleCreateProduct = async () => {
    const canCreate = await canCreateMore('products');
    if (!canCreate) {
      toast({
        title: "Limite atingido",
        description: "Você atingiu o limite de produtos do seu plano",
        variant: "destructive"
      });
      return;
    }
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    // Check if product is blocked
    const productIndex = products.findIndex(p => p.id === product.id);
    if (productIndex >= allowedProductsCount) {
      toast({
        title: "Produto bloqueado",
        description: "Este produto está bloqueado pelo seu plano atual. Faça upgrade para acessar.",
        variant: "destructive"
      });
      return;
    }
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteProduct = async (product: Product) => {
    // Check if product is blocked
    const productIndex = products.findIndex(p => p.id === product.id);
    if (productIndex >= allowedProductsCount) {
      toast({
        title: "Produto bloqueado",
        description: "Este produto está bloqueado pelo seu plano atual. Faça upgrade para acessar.",
        variant: "destructive"
      });
      return;
    }

    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);

      if (error) throw error;

      setProducts(products.filter(p => p.id !== product.id));
      toast({
        title: "Sucesso",
        description: "Produto excluído com sucesso"
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o produto",
        variant: "destructive"
      });
    }
  };

  const handleProductSubmit = async (productData: Partial<Product>) => {
    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;

        setProducts(products.map(p => 
          p.id === editingProduct.id ? { ...p, ...productData } : p
        ));
        toast({
          title: "Sucesso",
          description: "Produto atualizado com sucesso"
        });
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert([{
            name: productData.name!,
            user_id: user!.id,
            recipe_id: productData.recipe_id || null,
            sale_price: productData.sale_price || null,
            description: productData.description || null,
            category: productData.category || null
          }])
          .select()
          .single();

        if (error) throw error;

        setProducts([data, ...products]);
        toast({
          title: "Sucesso",
          description: "Produto criado com sucesso"
        });
      }

      setIsFormOpen(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o produto",
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
          <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
          <p className="text-gray-600">
            Gerencie seus produtos e precifique baseado nas receitas
          </p>
        </div>
        <Button onClick={handleCreateProduct} className="bg-pink-600 hover:bg-pink-700">
          <Plus className="h-4 w-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Buscar produtos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Discreet Plan Info */}
      <DiscreetPlanInfo type="products" currentCount={products.length} />

      {/* Products Grid */}
      {filteredAllowedProducts.length === 0 && filteredBlockedProducts.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Nenhum produto encontrado"
          description="Comece criando seu primeiro produto baseado em suas receitas"
          actionLabel="Criar Produto"
          onAction={handleCreateProduct}
        />
      ) : (
        <div className="space-y-6">
          {/* Allowed Products */}
          {filteredAllowedProducts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAllowedProducts.map((product) => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteProduct(product)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      {product.description || 'Sem descrição'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Preço:</span>
                        <span className="font-medium">{formatCurrency(product.sale_price)}</span>
                      </div>
                      {product.category && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Categoria:</span>
                          <Badge variant="outline">{product.category}</Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Blocked Products */}
          {filteredBlockedProducts.length > 0 && (
            <div className="space-y-4">
              <div className="border-t pt-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Lock className="h-5 w-5 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-600">Produtos Bloqueados</h3>
                  <Badge variant="secondary">Upgrade necessário</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBlockedProducts.map((product) => (
                    <Card key={product.id} className="opacity-60 border-gray-300">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg text-gray-500 flex items-center">
                            <Lock className="h-4 w-4 mr-2" />
                            {product.name}
                          </CardTitle>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditProduct(product)}
                              disabled
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteProduct(product)}
                              disabled
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                        <CardDescription className="text-gray-400">
                          {product.description || 'Sem descrição'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-400">Preço:</span>
                            <span className="font-medium text-gray-400">{formatCurrency(product.sale_price)}</span>
                          </div>
                          {product.category && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-400">Categoria:</span>
                              <Badge variant="outline" className="text-gray-400 border-gray-300">{product.category}</Badge>
                            </div>
                          )}
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

      {/* Product Form Modal */}
      {isFormOpen && (
        <ProductForm
          product={editingProduct}
          recipes={recipes}
          onSubmit={handleProductSubmit}
          onClose={() => {
            setIsFormOpen(false);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
};
