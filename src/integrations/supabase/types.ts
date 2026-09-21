export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      banners: {
        Row: {
          active: boolean
          created_at: string
          cta: string
          id: string
          image: string
          link: string
          sort: number
          subtitle: string
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          cta?: string
          id?: string
          image?: string
          link?: string
          sort?: number
          subtitle?: string
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          cta?: string
          id?: string
          image?: string
          link?: string
          sort?: number
          subtitle?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          hidden: boolean
          icon: string
          id: string
          image: string
          name: string
          slug: string
          sort: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          hidden?: boolean
          icon?: string
          id?: string
          image?: string
          name: string
          slug: string
          sort?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          hidden?: boolean
          icon?: string
          id?: string
          image?: string
          name?: string
          slug?: string
          sort?: number
          updated_at?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          active: boolean
          code: string
          created_at: string
          id: string
          min_order: number | null
          type: Database["public"]["Enums"]["coupon_type"]
          updated_at: string
          usage_limit: number | null
          used_count: number
          value: number
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          id?: string
          min_order?: number | null
          type?: Database["public"]["Enums"]["coupon_type"]
          updated_at?: string
          usage_limit?: number | null
          used_count?: number
          value?: number
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          id?: string
          min_order?: number | null
          type?: Database["public"]["Enums"]["coupon_type"]
          updated_at?: string
          usage_limit?: number | null
          used_count?: number
          value?: number
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string
          full_name: string
          governorate: string
          id: string
          last_order_at: string | null
          orders_count: number
          phone: string
          total_spent: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string
          governorate?: string
          id?: string
          last_order_at?: string | null
          orders_count?: number
          phone: string
          total_spent?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          governorate?: string
          id?: string
          last_order_at?: string | null
          orders_count?: number
          phone?: string
          total_spent?: number
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          image: string
          name: string
          order_id: string
          price: number
          product_id: string | null
          quantity: number
        }
        Insert: {
          id?: string
          image?: string
          name: string
          order_id: string
          price?: number
          product_id?: string | null
          quantity?: number
        }
        Update: {
          id?: string
          image?: string
          name?: string
          order_id?: string
          price?: number
          product_id?: string | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string
          city: string
          coupon_code: string | null
          created_at: string
          discount: number
          full_name: string
          governorate: string
          id: string
          landmark: string | null
          notes: string | null
          number: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_reference: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          phone: string
          shipping: number
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address: string
          city?: string
          coupon_code?: string | null
          created_at?: string
          discount?: number
          full_name: string
          governorate: string
          id?: string
          landmark?: string | null
          notes?: string | null
          number: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_reference?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          phone: string
          shipping?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string
          city?: string
          coupon_code?: string | null
          created_at?: string
          discount?: number
          full_name?: string
          governorate?: string
          id?: string
          landmark?: string | null
          notes?: string | null
          number?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_reference?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          phone?: string
          shipping?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          barcode: string | null
          best_seller: boolean
          category_id: string | null
          created_at: string
          description: string
          dimensions: string | null
          featured: boolean
          hidden: boolean
          id: string
          images: string[]
          is_new: boolean
          name: string
          old_price: number | null
          price: number
          rating: number
          reviews_count: number
          sku: string
          slug: string
          sort: number
          specifications: Json
          stock: number
          updated_at: string
          weight: number | null
        }
        Insert: {
          barcode?: string | null
          best_seller?: boolean
          category_id?: string | null
          created_at?: string
          description?: string
          dimensions?: string | null
          featured?: boolean
          hidden?: boolean
          id?: string
          images?: string[]
          is_new?: boolean
          name: string
          old_price?: number | null
          price?: number
          rating?: number
          reviews_count?: number
          sku?: string
          slug: string
          sort?: number
          specifications?: Json
          stock?: number
          updated_at?: string
          weight?: number | null
        }
        Update: {
          barcode?: string | null
          best_seller?: boolean
          category_id?: string | null
          created_at?: string
          description?: string
          dimensions?: string | null
          featured?: boolean
          hidden?: boolean
          id?: string
          images?: string[]
          is_new?: boolean
          name?: string
          old_price?: number | null
          price?: number
          rating?: number
          reviews_count?: number
          sku?: string
          slug?: string
          sort?: number
          specifications?: Json
          stock?: number
          updated_at?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string
          city: string
          created_at: string
          full_name: string
          governorate: string
          id: string
          phone: string
          updated_at: string
        }
        Insert: {
          address?: string
          city?: string
          created_at?: string
          full_name?: string
          governorate?: string
          id: string
          phone?: string
          updated_at?: string
        }
        Update: {
          address?: string
          city?: string
          created_at?: string
          full_name?: string
          governorate?: string
          id?: string
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          address: string
          background_color: string
          bank_details: string
          banner: string
          business_hours: string
          button_color: string
          currency: string
          dark_mode: boolean
          email: string
          facebook: string
          favicon: string
          font: string
          free_shipping_threshold: number
          google_map: string
          id: string
          instagram: string
          logo: string
          pay_bank_enabled: boolean
          pay_card_enabled: boolean
          pay_cod_enabled: boolean
          pay_wallet_enabled: boolean
          phone: string
          primary_color: string
          secondary_color: string
          seo_description: string
          seo_title: string
          shipping_fee: number
          store_name: string
          text_color: string
          tiktok: string
          updated_at: string
          wallet_numbers: string
          whatsapp: string
        }
        Insert: {
          address?: string
          background_color?: string
          bank_details?: string
          banner?: string
          business_hours?: string
          button_color?: string
          currency?: string
          dark_mode?: boolean
          email?: string
          facebook?: string
          favicon?: string
          font?: string
          free_shipping_threshold?: number
          google_map?: string
          id?: string
          instagram?: string
          logo?: string
          pay_bank_enabled?: boolean
          pay_card_enabled?: boolean
          pay_cod_enabled?: boolean
          pay_wallet_enabled?: boolean
          phone?: string
          primary_color?: string
          secondary_color?: string
          seo_description?: string
          seo_title?: string
          shipping_fee?: number
          store_name?: string
          text_color?: string
          tiktok?: string
          updated_at?: string
          wallet_numbers?: string
          whatsapp?: string
        }
        Update: {
          address?: string
          background_color?: string
          bank_details?: string
          banner?: string
          business_hours?: string
          button_color?: string
          currency?: string
          dark_mode?: boolean
          email?: string
          facebook?: string
          favicon?: string
          font?: string
          free_shipping_threshold?: number
          google_map?: string
          id?: string
          instagram?: string
          logo?: string
          pay_bank_enabled?: boolean
          pay_card_enabled?: boolean
          pay_cod_enabled?: boolean
          pay_wallet_enabled?: boolean
          phone?: string
          primary_color?: string
          secondary_color?: string
          seo_description?: string
          seo_title?: string
          shipping_fee?: number
          store_name?: string
          text_color?: string
          tiktok?: string
          updated_at?: string
          wallet_numbers?: string
          whatsapp?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_stock: {
        Args: { _product_id: string; _qty: number }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      track_order: {
        Args: { _number: string; _phone: string }
        Returns: {
          city: string
          created_at: string
          discount: number
          full_name: string
          governorate: string
          number: string
          shipping: number
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "staff" | "user"
      coupon_type: "percent" | "fixed"
      order_status:
        | "New"
        | "Preparing"
        | "Ready"
        | "Out for Delivery"
        | "Delivered"
        | "Cancelled"
      payment_method: "cod" | "card" | "wallet" | "bank"
      payment_status: "unpaid" | "pending" | "paid" | "failed" | "refunded"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "staff", "user"],
      coupon_type: ["percent", "fixed"],
      order_status: [
        "New",
        "Preparing",
        "Ready",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ],
      payment_method: ["cod", "card", "wallet", "bank"],
      payment_status: ["unpaid", "pending", "paid", "failed", "refunded"],
    },
  },
} as const
