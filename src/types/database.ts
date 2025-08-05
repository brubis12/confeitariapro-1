
export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  plan: 'free' | 'basic' | 'premium';
  updated_at: string | null;
  subscription_expires_at: string | null;
  subscription_status: string | null;
}

export interface Business {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  user_id: string;
  name: string;
  quantity: number;
  unit: string;
  cost_per_unit: number;
  min_stock: number;
  category: string | null;
  supplier: string | null;
  notes: string | null;
  last_updated: string;
}

export interface InventoryMovement {
  id: string;
  user_id: string;
  inventory_id: string;
  movement_type: 'entrada' | 'saida' | 'ajuste' | 'manual';
  quantity: number;
  previous_quantity: number;
  new_quantity: number;
  reason: string | null;
  reference_id: string | null;
  created_at: string;
}

export interface Recipe {
  id: string;
  user_id: string;
  name: string;
  ingredients: any;
  yield: number | null;
  markup: number | null;
  total_cost: number | null;
  suggested_price: number | null;
  created_at: string;
}

export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  inventory_id: string;
  quantity_needed: number;
  unit: string;
  cost_per_unit: number;
  total_cost: number | null;
  created_at: string;
}

export interface Product {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  sale_price: number | null;
  recipe_id: string | null;
  category: string | null;
  total_cost: number;
  final_price: number;
  profit: number;
  margin: number;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  user_id: string;
  product_id: string | null;
  custom_name: string | null;
  quantity: number;
  sale_price: number;
  total_cost: number;
  profit: number | null;
  sale_date: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  payment_method: string | null;
  notes: string | null;
  status: string;
  updated_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string | null;
  recipe_id: string | null;
  custom_name: string | null;
  quantity: number;
  unit_price: number;
  total_price: number | null;
  unit_cost: number;
  total_cost: number | null;
  profit: number | null;
  created_at: string;
}

// Novas tabelas para Produção
export interface ProductionOrder {
  id: string;
  user_id: string;
  product_id: string | null;
  recipe_id: string | null;
  custom_product_name: string | null;
  quantity: number;
  status: 'agendado' | 'em_andamento' | 'concluido' | 'cancelado';
  priority: 'baixa' | 'media' | 'alta';
  responsible: string | null;
  start_date: string;
  expected_end_date: string;
  actual_end_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Novas tabelas para Clientes/Fidelidade
export interface Customer {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  birth_date: string | null;
  tier: 'bronze' | 'prata' | 'ouro' | 'diamante';
  total_spent: number;
  total_points: number;
  registration_date: string;
  last_purchase: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyReward {
  id: string;
  user_id: string;
  name: string;
  description: string;
  points_required: number;
  category: 'desconto' | 'produto' | 'servico';
  discount_percentage: number | null;
  discount_value: number | null;
  product_id: string | null;
  is_active: boolean;
  expiration_days: number | null;
  usage_limit: number | null;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyTransaction {
  id: string;
  user_id: string;
  customer_id: string;
  transaction_type: 'ganho' | 'resgate' | 'expiracao' | 'ajuste';
  points: number;
  previous_balance: number;
  new_balance: number;
  reference_id: string | null; // ID da venda ou recompensa
  reference_type: 'sale' | 'reward' | 'manual' | 'expiration';
  description: string | null;
  created_at: string;
}

// Novas tabelas para Sistema de Assinatura
export interface Subscription {
  id: string;
  user_id: string;
  plan: 'free' | 'basic' | 'premium';
  status: 'active' | 'inactive' | 'cancelled' | 'expired';
  start_date: string;
  end_date: string | null;
  payment_method: string | null;
  payment_status: 'pending' | 'paid' | 'failed';
  amount: number | null;
  currency: string;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentHistory {
  id: string;
  user_id: string;
  subscription_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  stripe_payment_intent_id: string | null;
  payment_date: string;
  description: string | null;
  created_at: string;
}

// Tabela para Configurações do Usuário
export interface UserSettings {
  id: string;
  user_id: string;
  business_name: string | null;
  business_address: string | null;
  business_phone: string | null;
  business_email: string | null;
  tax_id: string | null;
  default_currency: string;
  default_markup: number | null;
  low_stock_alert: boolean;
  email_notifications: boolean;
  whatsapp_notifications: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserAdState {
  user_id: string;
  watched_today: number;
  last_ad_timestamp: string | null;
  reports_unlocked_until: string | null;
  recipes_bonus: number;
  recipes_unlocked_until: string | null;
  recipes_ads_watched: number;
  products_bonus: number;
  products_unlocked_until: string | null;
  products_ads_watched: number;
  sales_bonus: number;
  sales_unlocked_until: string | null;
  sales_ads_watched: number;
  reports_ads_watched: number;
  updated_at: string;
}

export type PlanType = 'free' | 'basic' | 'premium';

export interface PlanLimits {
  recipes: number;
  products: number;
  sales_per_day: number;
  inventory_items: number;
  has_reports: boolean;
  has_production_center: boolean;
  has_loyalty_system: boolean;
  has_marketplace_integration: boolean;
}
