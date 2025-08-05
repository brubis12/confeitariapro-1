
import React from 'react';
import { usePlan } from '@/contexts/PlanContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, AlertTriangle, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PlanLimitBannerProps {
  type: 'recipes' | 'products' | 'sales';
  currentCount: number;
}

const PlanLimitBanner: React.FC<PlanLimitBannerProps> = ({ type, currentCount }) => {
  const { currentPlan, planLimits } = usePlan();
  const { profile } = useAuth();

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'recipes': return 'receitas';
      case 'products': return 'produtos';
      case 'sales': return 'vendas';
      default: return type;
    }
  };

  const getLimit = (): number => {
    if (type === 'sales') {
      return planLimits.sales_per_day;
    }
    return planLimits[type as keyof typeof planLimits] as number;
  };

  const limit = getLimit();
  const isUnlimited = limit === Infinity;
  const isNearLimit = !isUnlimited && typeof limit === 'number' && currentCount >= limit * 0.8;
  const isAtLimit = !isUnlimited && typeof limit === 'number' && currentCount >= limit;

  const formatExpirationDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getDaysUntilExpiration = (dateString: string | null) => {
    if (!dateString) return null;
    const expirationDate = new Date(dateString);
    const today = new Date();
    const diffTime = expirationDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const expirationDate = profile?.subscription_expires_at;
  const daysUntilExpiration = getDaysUntilExpiration(expirationDate);
  const isExpiringSoon = daysUntilExpiration !== null && daysUntilExpiration <= 7;

  return (
    <div className="space-y-3">
      {/* Plan Limits Banner */}
      <Card className={`p-4 border-l-4 ${
        isAtLimit ? 'border-l-red-500 bg-red-50' : 
        isNearLimit ? 'border-l-yellow-500 bg-yellow-50' : 
        'border-l-blue-500 bg-blue-50'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${
              isAtLimit ? 'bg-red-100' : 
              isNearLimit ? 'bg-yellow-100' : 
              'bg-blue-100'
            }`}>
              {currentPlan === 'free' ? (
                <AlertTriangle className={`h-4 w-4 ${
                  isAtLimit ? 'text-red-600' : 
                  isNearLimit ? 'text-yellow-600' : 
                  'text-blue-600'
                }`} />
              ) : (
                <Crown className="h-4 w-4 text-yellow-600" />
              )}
            </div>
            <div>
              <p className="font-medium text-sm">
                {isUnlimited ? (
                  `${getTypeLabel(type)} ilimitadas`
                ) : (
                  `${currentCount}/${limit} ${getTypeLabel(type)} ${type === 'sales' ? 'hoje' : 'criadas'}`
                )}
              </p>
              <p className="text-xs text-gray-600">
                Plano {currentPlan === 'free' ? 'Gratuito' : currentPlan === 'basic' ? 'Básico' : 'Premium'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant={
              isAtLimit ? 'destructive' : 
              isNearLimit ? 'default' : 
              'secondary'
            }>
              {isUnlimited ? 'Ilimitado' : 
               isAtLimit ? 'Limite atingido' : 
               isNearLimit ? 'Próximo ao limite' : 
               'Dentro do limite'}
            </Badge>
            
            {currentPlan === 'free' && (
              <Link to="/upgrade">
                <Button size="sm" className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600">
                  <Crown className="h-3 w-3 mr-1" />
                  Upgrade
                </Button>
              </Link>
            )}
          </div>
        </div>
      </Card>

      {/* Subscription Expiration Banner */}
      {currentPlan !== 'free' && expirationDate && (
        <Card className={`p-3 border-l-4 ${
          isExpiringSoon ? 'border-l-orange-500 bg-orange-50' : 'border-l-green-500 bg-green-50'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className={`h-4 w-4 ${isExpiringSoon ? 'text-orange-600' : 'text-green-600'}`} />
              <div>
                <p className="text-sm font-medium">
                  {isExpiringSoon ? 'Assinatura expira em breve' : 'Assinatura ativa'}
                </p>
                <p className="text-xs text-gray-600">
                  {daysUntilExpiration !== null && daysUntilExpiration > 0 ? (
                    `Renova em ${daysUntilExpiration} dia${daysUntilExpiration === 1 ? '' : 's'} (${formatExpirationDate(expirationDate)})`
                  ) : (
                    'Assinatura expirada'
                  )}
                </p>
              </div>
            </div>
            
            {isExpiringSoon && (
              <Link to="/settings">
                <Button size="sm" variant="outline">
                  Renovar
                </Button>
              </Link>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default PlanLimitBanner;
