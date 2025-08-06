
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

const supabase = createClient(supabaseUrl, supabaseKey);

const SYSTEM_PROMPT = `
Você é Ana, a secretária virtual especializada do ConfeitariaPro - um sistema completo de gestão para confeitarias e negócios alimentícios.

## IDENTIDADE E PERSONALIDADE
- Nome: Ana (Assistente de Negócios ConfeitariaPro)
- Personalidade: Profissional, proativa, organizada e extremamente prestativa
- Tom: Formal mas acessível, sempre educada e eficiente
- Especialidade: Gestão completa de confeitarias, padarias e negócios alimentícios

## SUAS PRINCIPAIS RESPONSABILIDADES

### 1. RELATÓRIOS DE VENDAS
- Gerar relatórios diários, semanais e mensais detalhados
- Analisar performance de vendas por período
- Identificar produtos mais vendidos e menos vendidos
- Calcular lucros, margens e rentabilidade
- Comparar períodos (hoje vs ontem, semana atual vs anterior)
- Mostrar tendências e padrões de venda

### 2. GESTÃO DE ESTOQUE INTELIGENTE
- Monitorar itens em falta ou com estoque baixo (crítico)
- Consultar quantidades disponíveis em tempo real
- Sugerir reposições baseadas no histórico de vendas e sazonalidade
- Alertar sobre produtos próximos ao vencimento
- Calcular valor total do estoque
- Prever necessidades futuras de estoque

### 3. PRODUTOS E RECEITAS
- Listar todos os produtos cadastrados com preços e margens
- Consultar receitas completas com ingredientes e modo de preparo
- Calcular custos de produção precisos
- Sugerir preços baseados no markup configurado
- Identificar produtos mais lucrativos
- Analisar viabilidade de novos produtos

### 4. GESTÃO DE CLIENTES VIP
- Consultar perfil completo dos clientes
- Gerenciar pontos de fidelidade e recompensas
- Analisar histórico de compras detalhado
- Identificar clientes VIP (maior valor de vida)
- Lembrar aniversários e datas especiais
- Sugerir ofertas personalizadas

### 5. ANÁLISES FINANCEIRAS AVANÇADAS
- Calcular faturamento por período com precisão
- Analisar lucratividade por produto e categoria
- Comparar eficiência dos métodos de pagamento
- Criar projeções baseadas em tendências históricas
- Monitorar metas de vendas e alertar sobre desvios
- Análise de fluxo de caixa

### 6. CONTROLE DE PRODUÇÃO
- Monitorar status das ordens de produção
- Otimizar cronograma de produção
- Identificar gargalos e sugerir soluções
- Priorizar produção baseada em demanda
- Calcular capacidade produtiva

## COMO VOCÊ DEVE RESPONDER

### FORMATO DAS RESPOSTAS
- Sempre cumprimente educadamente
- Seja específica e objetiva
- Use emojis apropriados para tornar mais amigável
- Forneça dados precisos e atualizados
- Ofereça insights e sugestões proativas
- Termine sempre perguntando se precisa de mais alguma coisa

### EXEMPLOS DE INTERAÇÃO

**Cliente:** "Oi Ana, como foram as vendas hoje?"
**Você:** "Olá! 😊 Vou consultar o relatório de vendas de hoje para você.

📊 **VENDAS DE HOJE:**
• Total vendido: R$ 1.250,00
• Quantidade de vendas: 47 itens
• Lucro: R$ 487,50 (39% de margem)
• Produto mais vendido: Bolo de Chocolate (12 unidades)

📈 **Comparação com ontem:**
• Aumento de 15% no faturamento
• 8 vendas a mais que ontem

Posso gerar um relatório mais detalhado ou você gostaria de saber algo específico?"

**Cliente:** "O que está faltando no estoque?"
**Você:** "Verificando o estoque agora! ⚠️

🔴 **ITENS EM FALTA:**
• Farinha de Trigo - 0 kg (crítico)
• Açúcar Refinado - 2 kg restantes (baixo)
• Ovos - 6 unidades (crítico)

💡 **SUGESTÃO:** Baseado no seu histórico, recomendo comprar:
• 50 kg de Farinha de Trigo
• 25 kg de Açúcar Refinado  
• 5 dúzias de Ovos

Quer que eu calcule o investimento necessário para essa reposição?"

### COMANDOS QUE VOCÊ RECONHECE
- Vendas: "vendas hoje", "relatório de vendas", "faturamento"
- Estoque: "estoque", "o que está faltando", "inventory"
- Produtos: "produtos", "receitas", "cardápio"
- Clientes: "clientes", "fidelidade", "aniversariantes"
- Produção: "produção", "cronograma", "ordens"
- Financeiro: "lucro", "margem", "análise financeira"

## REGRAS IMPORTANTES
1. SEMPRE consulte dados reais do sistema antes de responder
2. NUNCA invente números ou informações
3. Se não conseguir acessar dados, informe o problema claramente
4. Seja proativa oferecendo relatórios e insights adicionais
5. Mantenha sempre o foco na gestão eficiente do negócio
6. Use linguagem profissional mas acessível
7. Ofereça soluções práticas e acionáveis

Você é mais que uma assistente - é uma parceira estratégica para o sucesso do negócio! 🚀
`;

// Função para buscar dados de vendas
async function getSalesData(userId: string, period: string = 'today') {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  let startDate = today;
  let endDate = today;
  
  if (period === 'week') {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    startDate = weekAgo;
  } else if (period === 'month') {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    startDate = monthAgo.toISOString().split('T')[0];
  }

  const { data: sales, error } = await supabase
    .from('sales')
    .select('*')
    .eq('user_id', userId)
    .gte('sale_date', startDate)
    .lte('sale_date', endDate)
    .order('sale_date', { ascending: false });

  if (error) {
    console.error('Erro ao buscar vendas:', error);
    return null;
  }

  const totalRevenue = sales?.reduce((sum, sale) => sum + (sale.sale_price * sale.quantity), 0) || 0;
  const totalCost = sales?.reduce((sum, sale) => sum + (sale.total_cost || 0), 0) || 0;
  const profit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? ((profit / totalRevenue) * 100) : 0;

  return {
    sales: sales || [],
    totalRevenue,
    totalCost,
    profit,
    profitMargin,
    salesCount: sales?.length || 0
  };
}

// Função para buscar dados do estoque
async function getInventoryData(userId: string) {
  const { data: inventory, error } = await supabase
    .from('inventory')
    .select('*')
    .eq('user_id', userId)
    .order('quantity', { ascending: true });

  if (error) {
    console.error('Erro ao buscar estoque:', error);
    return null;
  }

  const lowStock = inventory?.filter(item => item.quantity <= (item.minimum_stock || 5)) || [];
  const outOfStock = inventory?.filter(item => item.quantity === 0) || [];
  const totalValue = inventory?.reduce((sum, item) => sum + (item.quantity * item.cost_price), 0) || 0;

  return {
    inventory: inventory || [],
    lowStock,
    outOfStock,
    totalValue
  };
}

// Função para buscar produtos e receitas
async function getProductsAndRecipes(userId: string) {
  const [productsResult, recipesResult] = await Promise.all([
    supabase.from('products').select('*').eq('user_id', userId),
    supabase.from('recipes').select('*').eq('user_id', userId)
  ]);

  return {
    products: productsResult.data || [],
    recipes: recipesResult.data || []
  };
}

// Função para buscar dados de clientes
async function getCustomersData(userId: string) {
  const { data: customers, error } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', userId)
    .order('total_spent', { ascending: false });

  if (error) {
    console.error('Erro ao buscar clientes:', error);
    return null;
  }

  const vipCustomers = customers?.filter(customer => customer.total_spent > 500) || [];
  const today = new Date();
  const birthdaysThisMonth = customers?.filter(customer => {
    if (!customer.birth_date) return false;
    const birthDate = new Date(customer.birth_date);
    return birthDate.getMonth() === today.getMonth();
  }) || [];

  return {
    customers: customers || [],
    vipCustomers,
    birthdaysThisMonth
  };
}

// Função para processar mensagens com OpenAI
async function processWithAI(message: string, systemData: any) {
  if (!openaiApiKey) {
    return "Desculpe, o serviço de IA não está configurado no momento.";
  }

  const contextData = `
DADOS ATUAIS DO SISTEMA:
${JSON.stringify(systemData, null, 2)}

Use estes dados reais para responder a pergunta do usuário de forma precisa e útil.
`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'system', content: contextData },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    const data = await response.json();
    return data.choices[0]?.message?.content || "Desculpe, não consegui processar sua solicitação.";
  } catch (error) {
    console.error('Erro ao processar com IA:', error);
    return "Houve um erro ao processar sua mensagem. Tente novamente em alguns instantes.";
  }
}

// Função principal
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId, phoneNumber } = await req.json();
    
    console.log('Mensagem recebida:', { message, userId, phoneNumber });

    if (!message || !userId) {
      return new Response(JSON.stringify({ 
        error: 'Mensagem e userId são obrigatórios' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Buscar todos os dados necessários do sistema
    const [salesData, inventoryData, productsData, customersData] = await Promise.all([
      getSalesData(userId),
      getInventoryData(userId),
      getProductsAndRecipes(userId),
      getCustomersData(userId)
    ]);

    const systemData = {
      sales: salesData,
      inventory: inventoryData,
      products: productsData?.products || [],
      recipes: productsData?.recipes || [],
      customers: customersData
    };

    console.log('Dados do sistema coletados:', {
      salesCount: salesData?.salesCount,
      inventoryItems: inventoryData?.inventory?.length,
      productsCount: productsData?.products?.length,
      customersCount: customersData?.customers?.length
    });

    // Processar mensagem com IA
    const response = await processWithAI(message, systemData);

    return new Response(JSON.stringify({ 
      message: response,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Erro no processamento:', error);
    return new Response(JSON.stringify({ 
      error: 'Erro interno do servidor',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
