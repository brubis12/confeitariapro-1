import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { PlanType, PlanLimits, UserAdState } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';

interface PlanContextType {
  currentPlan: PlanType;
  planLimits: PlanLimits;
  adState: UserAdState | null;
  canUseFeature: (feature: keyof PlanLimits) => boolean;
  canCreateMore: (type: 'recipes' | 'products' | 'sales') => Promise<boolean>;
  watchAd: (category: string) => Promise<void>;
  upgradeToBasic: () => Promise<void>;
  upgradeToPremium: () => Promise<void>;
  loading: boolean;
}

const planLimitsConfig: Record<PlanType, PlanLimits> = {
  free: {
    recipes: 1,
    products: 1,
    sales_per_day: 1,
    inventory_items: 50,
    has_reports: false,
    has_production_center: false,
    has_loyalty_system: false,
    has_marketplace_integration: false,
  },
  basic: {
    recipes: 20,
    products: 20,
    sales_per_day: 20,
    inventory_items: Infinity,
    has_reports: true,
    has_production_center: false,
    has_loyalty_system: false,
    has_marketplace_integration: false,
  },
  premium: {
    recipes: Infinity,
    products: Infinity,
    sales_per_day: Infinity,
    inventory_items: Infinity,
    has_reports: true,
    has_production_center: true,
    has_loyalty_system: true,
    has_marketplace_integration: true,
  },
};

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export const usePlan = () => {
  const context = useContext(PlanContext);
  if (context === undefined) {
    throw new Error('usePlan must be used within a PlanProvider');
  }
  return context;
};

export const PlanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, updateProfile } = useAuth();
  const [adState, setAdState] = useState<UserAdState | null>(null);
  const [loading, setLoading] = useState(true);

  const currentPlan = (profile?.plan as PlanType) || 'free';
  const planLimits = planLimitsConfig[currentPlan];

  // Check if subscription is expired
  const isSubscriptionExpired = () => {
    if (currentPlan === 'free') return false;
    if (!profile?.subscription_expires_at) return false;
    
    const expirationDate = new Date(profile.subscription_expires_at);
    const now = new Date();
    return expirationDate < now;
  };

  // Get effective plan (downgrade to free if expired)
  const getEffectivePlan = (): PlanType => {
    if (isSubscriptionExpired()) {
      return 'free';
    }
    return currentPlan;
  };

  const effectivePlan = getEffectivePlan();
  const effectivePlanLimits = planLimitsConfig[effectivePlan];

  useEffect(() => {
    if (user) {
      loadAdState();
    }
    setLoading(false);
  }, [user]);

  const loadAdState = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_ad_state')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // Se não existe registro, criar um novo
        const { data: newData, error: insertError } = await supabase
          .from('user_ad_state')
          .insert({
            user_id: user.id,
            watched_today: 0,
            recipes_bonus: 0,
            products_bonus: 0,
            sales_bonus: 0,
            recipes_ads_watched: 0,
            products_ads_watched: 0,
            sales_ads_watched: 0,
            reports_ads_watched: 0
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setAdState(newData);
      } else {
        setAdState(data);
      }
    } catch (error) {
      console.error('Error loading ad state:', error);
    }
  };

  const canUseFeature = (feature: keyof PlanLimits): boolean => {
    if (effectivePlan === 'premium') return true;
    
    const featureValue = effectivePlanLimits[feature];
    
    // Para features booleanas
    if (typeof featureValue === 'boolean') {
      return featureValue;
    }
    
    // Para features numéricas
    return featureValue !== 0;
  };

  const canCreateMore = async (type: 'recipes' | 'products' | 'sales'): Promise<boolean> => {
    if (!user) return false;
    if (effectivePlan === 'premium') return true;

    const table = type === 'sales' ? 'sales' : type;
    const limit = effectivePlanLimits[type === 'sales' ? 'sales_per_day' : type];
    
    if (limit === Infinity) return true;

    let query = supabase
      .from(table)
      .select('id', { count: 'exact' })
      .eq('user_id', user.id);

    if (type === 'sales') {
      const today = new Date().toISOString().split('T')[0];
      query = query.gte('sale_date', today + 'T00:00:00.000Z');
    }

    const { count } = await query;
    return (count || 0) < limit;
  };

  const watchAd = async (category: string) => {
    if (!user || !adState) return;

    const now = new Date().toISOString();
    const unlockDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const unlockUntil = new Date(Date.now() + unlockDuration).toISOString();

    const updates: Partial<UserAdState> = {
      watched_today: adState.watched_today + 1,
      last_ad_timestamp: now,
      updated_at: now,
    };

    switch (category) {
      case 'recipes':
        updates.recipes_ads_watched = adState.recipes_ads_watched + 1;
        updates.recipes_unlocked_until = unlockUntil;
        updates.recipes_bonus = adState.recipes_bonus + 1;
        break;
      case 'products':
        updates.products_ads_watched = adState.products_ads_watched + 1;
        updates.products_unlocked_until = unlockUntil;
        updates.products_bonus = adState.products_bonus + 1;
        break;
      case 'sales':
        updates.sales_ads_watched = adState.sales_ads_watched + 1;
        updates.sales_unlocked_until = unlockUntil;
        updates.sales_bonus = adState.sales_bonus + 1;
        break;
      case 'reports':
        updates.reports_ads_watched = adState.reports_ads_watched + 1;
        updates.reports_unlocked_until = unlockUntil;
        break;
    }

    const { error } = await supabase
      .from('user_ad_state')
      .update(updates)
      .eq('user_id', user.id);

    if (error) throw error;
    setAdState(prev => prev ? { ...prev, ...updates } : null);
  };

  const upgradeToBasic = async () => {
    try {
      const expirationDate = new Date();
      expirationDate.setMonth(expirationDate.getMonth() + 1);
      
      await updateProfile({ 
        plan: 'basic',
        subscription_expires_at: expirationDate.toISOString(),
        subscription_status: 'active'
      });
      console.log('Upgrade to basic plan successful');
    } catch (error) {
      console.error('Error upgrading to basic plan:', error);
      throw error;
    }
  };

  const upgradeToPremium = async () => {
    try {
      const expirationDate = new Date();
      expirationDate.setMonth(expirationDate.getMonth() + 1);
      
      await updateProfile({ 
        plan: 'premium',
        subscription_expires_at: expirationDate.toISOString(),
        subscription_status: 'active'
      });
      console.log('Upgrade to premium plan successful');
    } catch (error) {
      console.error('Error upgrading to premium plan:', error);
      throw error;
    }
  };

  const value = {
    currentPlan: effectivePlan,
    planLimits: effectivePlanLimits,
    adState,
    canUseFeature,
    canCreateMore,
    watchAd,
    upgradeToBasic,
    upgradeToPremium,
    loading,
  };

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
};
