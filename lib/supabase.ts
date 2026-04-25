import { createBrowserClient } from '@supabase/ssr'

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          short_desc: string | null
          purity: string | null
          price: number
          stock: number
          category: string | null
          image_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          short_desc?: string | null
          purity?: string | null
          price?: number
          stock?: number
          category?: string | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          short_desc?: string | null
          purity?: string | null
          price?: number
          stock?: number
          category?: string | null
          image_url?: string | null
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          address: string | null
          city: string | null
          county: string | null
          postal_code: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          county?: string | null
          postal_code?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          full_name?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          county?: string | null
          postal_code?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          status: string
          total_amount: number
          shipping_name: string | null
          shipping_address: string | null
          shipping_city: string | null
          shipping_county: string | null
          shipping_postal: string | null
          shipping_phone: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          status?: string
          total_amount?: number
          shipping_name?: string | null
          shipping_address?: string | null
          shipping_city?: string | null
          shipping_county?: string | null
          shipping_postal?: string | null
          shipping_phone?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: string
          total_amount?: number
          shipping_name?: string | null
          shipping_address?: string | null
          shipping_city?: string | null
          shipping_county?: string | null
          shipping_postal?: string | null
          shipping_phone?: string | null
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          unit_price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          quantity: number
          unit_price: number
          created_at?: string
        }
        Update: {
          product_name?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
