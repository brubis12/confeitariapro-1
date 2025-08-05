
import React from 'react';
import { usePlan } from '@/contexts/PlanContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DiscreetPlanInfoProps {
  type: 'recipes' | 'products' | 'sales' | 'inventory_items';
  currentCount: number;
}

const DiscreetPlanInfo: React.FC<DiscreetPlanInfoProps> = ({ type, currentCount }) => {
  const { currentPlan, planLimits } = usePlan();

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'recipes': return 'receitas';
      case 'products': return 'produtos';
      case 'sales': return 'vendas';
      case 'inventory_items': return 'itens no estoque';
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

  return (
    <div className="flex items-center justify-between text-sm text-gray-500 bg-gray-50/50 px-3 py-2 rounded-md border-0">
      <div className="flex items-center space-x-2">
        <Info className="h-3 w-3" />
        <span>
          {isUnlimited ? (
            `${getTypeLabel(type)} ilimitadas`
          ) : (
            `${currentCount}/${limit} ${getTypeLabel(type)} ${type === 'sales' ? '(hoje)' : ''}`
          )}
        </span>
        <Badge variant="outline" className="text-xs px-2 py-0">
          {currentPlan}
        </Badge>
      </div>
      
      {currentPlan === 'free' && (
        <Link to="/upgrade">
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-6 px-2 text-xs text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
          >
            <Crown className="h-3 w-3 mr-1" />
            Upgrade
          </Button>
        </Link>
      )}
    </div>
  );
};

export default DiscreetPlanInfo;
