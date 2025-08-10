export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      business: {
        Row: {
          created_at: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          birth_date: string | null
          created_at: string
          email: string | null
          id: string
          last_purchase: string | null
          name: string
          notes: string | null
          phone: string | null
          registration_date: string
          tier: string
          total_points: number
          total_spent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_purchase?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          registration_date?: string
          tier?: string
          total_points?: number
          total_spent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_purchase?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          registration_date?: string
          tier?: string
          total_points?: number
          total_spent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          category: string | null
          cost_per_unit: number
          id: string
          last_updated: string | null
          min_stock: number | null
          name: string
          notes: string | null
          quantity: number
          supplier: string | null
          unit: string
          user_id: string
        }
        Insert: {
          category?: string | null
          cost_per_unit: number
          id?: string
          last_updated?: string | null
          min_stock?: number | null
          name: string
          notes?: string | null
          quantity: number
          supplier?: string | null
          unit: string
          user_id: string
        }
        Update: {
          category?: string | null
          cost_per_unit?: number
          id?: string
          last_updated?: string | null
          min_stock?: number | null
          name?: string
          notes?: string | null
          quantity?: number
          supplier?: string | null
          unit?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          created_at: string | null
          id: string
          inventory_id: string
          movement_type: string
          new_quantity: number
          previous_quantity: number
          quantity: number
          reason: string | null
          reference_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          inventory_id: string
          movement_type: string
          new_quantity: number
          previous_quantity: number
          quantity: number
          reason?: string | null
          reference_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          inventory_id?: string
          movement_type?: string
          new_quantity?: number
          previous_quantity?: number
          quantity?: number
          reason?: string | null
          reference_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_rewards: {
        Row: {
          category: string
          created_at: string
          description: string
          discount_percentage: number | null
          discount_value: number | null
          expiration_days: number | null
          id: string
          is_active: boolean
          name: string
          points_required: number
          product_id: string | null
          updated_at: string
          usage_limit: number | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          discount_percentage?: number | null
          discount_value?: number | null
          expiration_days?: number | null
          id?: string
          is_active?: boolean
          name: string
          points_required: number
          product_id?: string | null
          updated_at?: string
          usage_limit?: number | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          discount_percentage?: number | null
          discount_value?: number | null
          expiration_days?: number | null
          id?: string
          is_active?: boolean
          name?: string
          points_required?: number
          product_id?: string | null
          updated_at?: string
          usage_limit?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_rewards_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_transactions: {
        Row: {
          created_at: string
          customer_id: string
          description: string | null
          id: string
          new_balance: number
          points: number
          previous_balance: number
          reference_id: string | null
          reference_type: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          description?: string | null
          id?: string
          new_balance?: number
          points: number
          previous_balance?: number
          reference_id?: string | null
          reference_type?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          description?: string | null
          id?: string
          new_balance?: number
          points?: number
          previous_balance?: number
          reference_id?: string | null
          reference_type?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_history: {
        Row: {
          amount: number
          created_at: string
          currency: string
          description: string | null
          id: string
          payment_date: string
          payment_method: string
          payment_status: string
          stripe_payment_intent_id: string | null
          subscription_id: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          payment_date?: string
          payment_method: string
          payment_status?: string
          stripe_payment_intent_id?: string | null
          subscription_id: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          payment_date?: string
          payment_method?: string
          payment_status?: string
          stripe_payment_intent_id?: string | null
          subscription_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_history_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      production_orders: {
        Row: {
          actual_end_date: string | null
          created_at: string
          custom_product_name: string | null
          expected_end_date: string
          id: string
          notes: string | null
          priority: string
          product_id: string | null
          quantity: number
          recipe_id: string | null
          responsible: string | null
          start_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_end_date?: string | null
          created_at?: string
          custom_product_name?: string | null
          expected_end_date: string
          id?: string
          notes?: string | null
          priority?: string
          product_id?: string | null
          quantity: number
          recipe_id?: string | null
          responsible?: string | null
          start_date: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_end_date?: string | null
          created_at?: string
          custom_product_name?: string | null
          expected_end_date?: string
          id?: string
          notes?: string | null
          priority?: string
          product_id?: string | null
          quantity?: number
          recipe_id?: string | null
          responsible?: string | null
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "production_orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_orders_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          final_price: number | null
          id: string
          margin: number | null
          name: string
          profit: number | null
          recipe_id: string | null
          sale_price: number | null
          total_cost: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          final_price?: number | null
          id?: string
          margin?: number | null
          name: string
          profit?: number | null
          recipe_id?: string | null
          sale_price?: number | null
          total_cost?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          final_price?: number | null
          id?: string
          margin?: number | null
          name?: string
          profit?: number | null
          recipe_id?: string | null
          sale_price?: number | null
          total_cost?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          phone: string | null
          plan: string
          subscription_expires_at: string | null
          subscription_status: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          plan?: string
          subscription_expires_at?: string | null
          subscription_status?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          plan?: string
          subscription_expires_at?: string | null
          subscription_status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      recipe_ingredients: {
        Row: {
          cost_per_unit: number
          created_at: string | null
          id: string
          inventory_id: string
          quantity_needed: number
          recipe_id: string
          total_cost: number | null
          unit: string
        }
        Insert: {
          cost_per_unit: number
          created_at?: string | null
          id?: string
          inventory_id: string
          quantity_needed: number
          recipe_id: string
          total_cost?: number | null
          unit: string
        }
        Update: {
          cost_per_unit?: number
          created_at?: string | null
          id?: string
          inventory_id?: string
          quantity_needed?: number
          recipe_id?: string
          total_cost?: number | null
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          created_at: string | null
          id: string
          ingredients: Json | null
          markup: number | null
          name: string
          suggested_price: number | null
          total_cost: number | null
          user_id: string
          yield: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ingredients?: Json | null
          markup?: number | null
          name: string
          suggested_price?: number | null
          total_cost?: number | null
          user_id: string
          yield?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ingredients?: Json | null
          markup?: number | null
          name?: string
          suggested_price?: number | null
          total_cost?: number | null
          user_id?: string
          yield?: number | null
        }
        Relationships: []
      }
      sale_items: {
        Row: {
          created_at: string | null
          custom_name: string | null
          id: string
          item_type: string | null
          product_id: string | null
          product_name: string | null
          profit: number | null
          quantity: number
          recipe_id: string | null
          recipe_name: string | null
          sale_id: string
          total_cost: number | null
          total_price: number | null
          unit_cost: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          custom_name?: string | null
          id?: string
          item_type?: string | null
          product_id?: string | null
          product_name?: string | null
          profit?: number | null
          quantity: number
          recipe_id?: string | null
          recipe_name?: string | null
          sale_id: string
          total_cost?: number | null
          total_price?: number | null
          unit_cost?: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          custom_name?: string | null
          id?: string
          item_type?: string | null
          product_id?: string | null
          product_name?: string | null
          profit?: number | null
          quantity?: number
          recipe_id?: string | null
          recipe_name?: string | null
          sale_id?: string
          total_cost?: number | null
          total_price?: number | null
          unit_cost?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          custom_name: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          id: string
          notes: string | null
          payment_method: string | null
          product_id: string | null
          profit: number | null
          quantity: number
          sale_date: string | null
          sale_price: number
          status: string | null
          total_cost: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          custom_name?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          product_id?: string | null
          profit?: number | null
          quantity: number
          sale_date?: string | null
          sale_price: number
          status?: string | null
          total_cost: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          custom_name?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          product_id?: string | null
          profit?: number | null
          quantity?: number
          sale_date?: string | null
          sale_price?: number
          status?: string | null
          total_cost?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount: number | null
          created_at: string
          currency: string
          end_date: string | null
          id: string
          payment_method: string | null
          payment_status: string | null
          plan: string
          start_date: string
          status: string
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string
          end_date?: string | null
          id?: string
          payment_method?: string | null
          payment_status?: string | null
          plan?: string
          start_date?: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string
          end_date?: string | null
          id?: string
          payment_method?: string | null
          payment_status?: string | null
          plan?: string
          start_date?: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_ad_state: {
        Row: {
          last_ad_timestamp: string | null
          products_ads_watched: number | null
          products_bonus: number | null
          products_unlocked_until: string | null
          recipes_ads_watched: number | null
          recipes_bonus: number | null
          recipes_unlocked_until: string | null
          reports_ads_watched: number | null
          reports_unlocked_until: string | null
          sales_ads_watched: number | null
          sales_bonus: number | null
          sales_unlocked_until: string | null
          updated_at: string | null
          user_id: string
          watched_today: number
        }
        Insert: {
          last_ad_timestamp?: string | null
          products_ads_watched?: number | null
          products_bonus?: number | null
          products_unlocked_until?: string | null
          recipes_ads_watched?: number | null
          recipes_bonus?: number | null
          recipes_unlocked_until?: string | null
          reports_ads_watched?: number | null
          reports_unlocked_until?: string | null
          sales_ads_watched?: number | null
          sales_bonus?: number | null
          sales_unlocked_until?: string | null
          updated_at?: string | null
          user_id: string
          watched_today?: number
        }
        Update: {
          last_ad_timestamp?: string | null
          products_ads_watched?: number | null
          products_bonus?: number | null
          products_unlocked_until?: string | null
          recipes_ads_watched?: number | null
          recipes_bonus?: number | null
          recipes_unlocked_until?: string | null
          reports_ads_watched?: number | null
          reports_unlocked_until?: string | null
          sales_ads_watched?: number | null
          sales_bonus?: number | null
          sales_unlocked_until?: string | null
          updated_at?: string | null
          user_id?: string
          watched_today?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_ad_state_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          business_address: string | null
          business_email: string | null
          business_name: string | null
          business_phone: string | null
          created_at: string
          default_currency: string
          default_markup: number | null
          email_notifications: boolean
          id: string
          low_stock_alert: boolean
          tax_id: string | null
          updated_at: string
          user_id: string
          whatsapp_notifications: boolean
        }
        Insert: {
          business_address?: string | null
          business_email?: string | null
          business_name?: string | null
          business_phone?: string | null
          created_at?: string
          default_currency?: string
          default_markup?: number | null
          email_notifications?: boolean
          id?: string
          low_stock_alert?: boolean
          tax_id?: string | null
          updated_at?: string
          user_id: string
          whatsapp_notifications?: boolean
        }
        Update: {
          business_address?: string | null
          business_email?: string | null
          business_name?: string | null
          business_phone?: string | null
          created_at?: string
          default_currency?: string
          default_markup?: number | null
          email_notifications?: boolean
          id?: string
          low_stock_alert?: boolean
          tax_id?: string | null
          updated_at?: string
          user_id?: string
          whatsapp_notifications?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      reset_daily_ad_counts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
