
-- Adicionar campos necessários para melhor gestão dos itens de venda
ALTER TABLE public.sale_items 
ADD COLUMN IF NOT EXISTS item_type TEXT DEFAULT 'custom',
ADD COLUMN IF NOT EXISTS recipe_name TEXT,
ADD COLUMN IF NOT EXISTS product_name TEXT;

-- Atualizar a política RLS para garantir que funcione corretamente
DROP POLICY IF EXISTS "Usuários podem gerenciar itens de suas vendas." ON public.sale_items;

CREATE POLICY "Users can manage their own sale items" 
ON public.sale_items 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM sales 
    WHERE sales.id = sale_items.sale_id 
    AND sales.user_id = auth.uid()
  )
);

-- Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON public.sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON public.sale_items(product_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_recipe_id ON public.sale_items(recipe_id);
