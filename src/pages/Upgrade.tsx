
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/contexts/PlanContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Crown, 
  Check, 
  Star, 
  Zap, 
  Shield, 
  TrendingUp,
  Users,
  Factory,
  BarChart3
} from 'lucide-react';

const Upgrade: React.FC = () => {
  const { profile } = useAuth();
  const { currentPlan, upgradeToBasic, upgradeToPremium } = usePlan();
  const { toast } = useToast();

  const handleUpgrade = async (plan: 'basic' | 'premium') => {
    try {
      if (plan === 'basic') {
        await upgradeToBasic();
      } else {
        await upgradeToPremium();
      }
      
      toast({
        title: "Upgrade realizado!",
        description: `Seu plano foi atualizado para ${plan === 'basic' ? 'Básico' : 'Premium'}.`,
      });
    } catch (error) {
      toast({
        title: "Erro no upgrade",
        description: "Não foi possível realizar o upgrade. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const plans = [
    {
      name: 'Gratuito',
      price: 'R$ 0',
      period: '/mês',
      description: 'Perfeito para começar',
      features: [
        '1 receita',
        '1 produto',
        '1 venda por dia',
        '50 itens no estoque',
        'Suporte básico'
      ],
      color: 'border-gray-200',
      current: currentPlan === 'free',
      plan: 'free' as const
    },
    {
      name: 'Básico',
      price: 'R$ 29',
      period: '/mês',
      description: 'Ideal para pequenos negócios',
      features: [
        '20 receitas',
        '20 produtos',
        '20 vendas por dia',
        'Estoque ilimitado',
        'Relatórios avançados',
        'Suporte prioritário'
      ],
      color: 'border-blue-200',
      current: currentPlan === 'basic',
      popular: true,
      plan: 'basic' as const
    },
    {
      name: 'Premium',
      price: 'R$ 79',
      period: '/mês',
      description: 'Para negócios em crescimento',
      features: [
        'Receitas ilimitadas',
        'Produtos ilimitados',
        'Vendas ilimitadas',
        'Estoque ilimitado',
        'Relatórios avançados',
        'Centro de produção',
        'Sistema de fidelidade',
        'Integração com marketplace',
        'Suporte 24/7'
      ],
      color: 'border-purple-200',
      current: currentPlan === 'premium',
      plan: 'premium' as const
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Escolha seu plano</h1>
        <p className="text-gray-600">Selecione o plano que melhor se adequa ao seu negócio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.name} className={`relative ${plan.color} ${plan.current ? 'ring-2 ring-pink-500' : ''}`}>
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-pink-500 to-orange-500">
                  <Star className="h-3 w-3 mr-1" />
                  Mais Popular
                </Badge>
              </div>
            )}
            {plan.current && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge variant="secondary">
                  <Check className="h-3 w-3 mr-1" />
                  Plano Atual
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center space-x-2">
                {plan.name === 'Gratuito' && <Shield className="h-5 w-5 text-gray-500" />}
                {plan.name === 'Básico' && <TrendingUp className="h-5 w-5 text-blue-500" />}
                {plan.name === 'Premium' && <Crown className="h-5 w-5 text-purple-500" />}
                <span>{plan.name}</span>
              </CardTitle>
              <div className="flex items-baseline justify-center space-x-1">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-gray-600">{plan.period}</span>
              </div>
              <p className="text-sm text-gray-600">{plan.description}</p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              {!plan.current && plan.plan !== 'free' && (
                <Button 
                  className={`w-full ${plan.name === 'Premium' ? 'bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600' : ''}`}
                  onClick={() => handleUpgrade(plan.plan)}
                >
                  {plan.name === 'Premium' && <Zap className="h-4 w-4 mr-2" />}
                  Upgrade para {plan.name}
                </Button>
              )}
              
              {plan.current && (
                <Button variant="outline" className="w-full" disabled>
                  <Check className="h-4 w-4 mr-2" />
                  Plano Atual
                </Button>
              )}
              
              {plan.plan === 'free' && !plan.current && (
                <Button variant="outline" className="w-full" disabled>
                  Plano Gratuito
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center">
        <h3 className="text-lg font-semibold mb-4">Recursos por categoria</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              <h4 className="font-medium">Relatórios</h4>
            </div>
            <p className="text-sm text-gray-600">Análises detalhadas de vendas, produtos e estoque</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Factory className="h-5 w-5 text-purple-500" />
              <h4 className="font-medium">Produção</h4>
            </div>
            <p className="text-sm text-gray-600">Centro de produção para gerenciar fabricação</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="h-5 w-5 text-green-500" />
              <h4 className="font-medium">Fidelidade</h4>
            </div>
            <p className="text-sm text-gray-600">Sistema de pontos e recompensas para clientes</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Upgrade;
