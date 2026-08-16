export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      fuel_entries: {
        Row: {
          created_at: string
          fueled_at: string
          full_tank: boolean
          id: string
          mileage: number
          station: string
          total_cost_in_cents: number
          updated_at: string
          vehicle_id: string
          volume_milliliters: number
        }
        Insert: {
          created_at?: string
          fueled_at: string
          full_tank?: boolean
          id?: string
          mileage: number
          station?: string
          total_cost_in_cents: number
          updated_at?: string
          vehicle_id: string
          volume_milliliters: number
        }
        Update: {
          created_at?: string
          fueled_at?: string
          full_tank?: boolean
          id?: string
          mileage?: number
          station?: string
          total_cost_in_cents?: number
          updated_at?: string
          vehicle_id?: string
          volume_milliliters?: number
        }
        Relationships: [
          {
            foreignKeyName: 'fuel_entries_vehicle_id_fkey'
            columns: ['vehicle_id']
            isOneToOne: false
            referencedRelation: 'vehicles'
            referencedColumns: ['id']
          },
        ]
      }
      maintenance_reminders: {
        Row: {
          completed_at: string | null
          created_at: string
          due_date: string | null
          due_mileage: number | null
          id: string
          title: string
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          due_mileage?: number | null
          id?: string
          title: string
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          due_mileage?: number | null
          id?: string
          title?: string
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'maintenance_reminders_vehicle_id_fkey'
            columns: ['vehicle_id']
            isOneToOne: false
            referencedRelation: 'vehicles'
            referencedColumns: ['id']
          },
        ]
      }
      service_records: {
        Row: {
          category: string
          cost_in_cents: number
          created_at: string
          id: string
          mileage: number
          notes: string
          service_date: string
          title: string
          updated_at: string
          vehicle_id: string
          workshop: string
        }
        Insert: {
          category: string
          cost_in_cents: number
          created_at?: string
          id?: string
          mileage: number
          notes?: string
          service_date: string
          title: string
          updated_at?: string
          vehicle_id: string
          workshop?: string
        }
        Update: {
          category?: string
          cost_in_cents?: number
          created_at?: string
          id?: string
          mileage?: number
          notes?: string
          service_date?: string
          title?: string
          updated_at?: string
          vehicle_id?: string
          workshop?: string
        }
        Relationships: [
          {
            foreignKeyName: 'service_records_vehicle_id_fkey'
            columns: ['vehicle_id']
            isOneToOne: false
            referencedRelation: 'vehicles'
            referencedColumns: ['id']
          },
        ]
      }
      vehicles: {
        Row: {
          created_at: string
          current_mileage: number
          distance_unit: string
          id: string
          make: string
          model: string
          registration_number: string
          starting_mileage: number
          updated_at: string
          user_id: string
          vin: string
          year: number
        }
        Insert: {
          created_at?: string
          current_mileage: number
          distance_unit?: string
          id?: string
          make: string
          model: string
          registration_number?: string
          starting_mileage: number
          updated_at?: string
          user_id?: string
          vin?: string
          year: number
        }
        Update: {
          created_at?: string
          current_mileage?: number
          distance_unit?: string
          id?: string
          make?: string
          model?: string
          registration_number?: string
          starting_mileage?: number
          updated_at?: string
          user_id?: string
          vin?: string
          year?: number
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
