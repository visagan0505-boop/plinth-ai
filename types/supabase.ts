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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          created_at: string | null
          customer_id: string | null
          customer_safety_accepted_at: string | null
          driver_team_id: string | null
          dropoff_lat_lng: unknown
          gearbox_type: string
          id: string
          initial_fee: number | null
          optional_stop_lat_lng: unknown
          pickup_charge: number | null
          pickup_lat_lng: unknown
          return_charge: number | null
          scheduled_at: string | null
          state: string
          total_fare: number | null
          trip_charge: number | null
          updated_at: string | null
          vehicle_make: string
          vehicle_model: string
          waiting_fee_minutes: number | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          customer_safety_accepted_at?: string | null
          driver_team_id?: string | null
          dropoff_lat_lng: unknown
          gearbox_type: string
          id?: string
          initial_fee?: number | null
          optional_stop_lat_lng?: unknown
          pickup_charge?: number | null
          pickup_lat_lng: unknown
          return_charge?: number | null
          scheduled_at?: string | null
          state?: string
          total_fare?: number | null
          trip_charge?: number | null
          updated_at?: string | null
          vehicle_make: string
          vehicle_model: string
          waiting_fee_minutes?: number | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          customer_safety_accepted_at?: string | null
          driver_team_id?: string | null
          dropoff_lat_lng?: unknown
          gearbox_type?: string
          id?: string
          initial_fee?: number | null
          optional_stop_lat_lng?: unknown
          pickup_charge?: number | null
          pickup_lat_lng?: unknown
          return_charge?: number | null
          scheduled_at?: string | null
          state?: string
          total_fare?: number | null
          trip_charge?: number | null
          updated_at?: string | null
          vehicle_make?: string
          vehicle_model?: string
          waiting_fee_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_driver_team_id_fkey"
            columns: ["driver_team_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_logs: {
        Row: {
          id: string
          meta: Json | null
          record_type: Database["public"]["Enums"]["compliance_type"]
          recorded_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          meta?: Json | null
          record_type: Database["public"]["Enums"]["compliance_type"]
          recorded_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          meta?: Json | null
          record_type?: Database["public"]["Enums"]["compliance_type"]
          recorded_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_teams: {
        Row: {
          approval_status: Database["public"]["Enums"]["approval_status"]
          id: string
          last_location: unknown
          status: Database["public"]["Enums"]["driver_status"]
          updated_at: string | null
          vehicle_details: Json | null
        }
        Insert: {
          approval_status?: Database["public"]["Enums"]["approval_status"]
          id: string
          last_location?: unknown
          status?: Database["public"]["Enums"]["driver_status"]
          updated_at?: string | null
          vehicle_details?: Json | null
        }
        Update: {
          approval_status?: Database["public"]["Enums"]["approval_status"]
          id?: string
          last_location?: unknown
          status?: Database["public"]["Enums"]["driver_status"]
          updated_at?: string | null
          vehicle_details?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_teams_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          accepted_terms_at: string | null
          approval_status: string
          availability_status: string
          created_at: string | null
          current_location: unknown
          has_police_clearance: boolean
          id: string
          online: boolean
          team_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accepted_terms_at?: string | null
          approval_status?: string
          availability_status?: string
          created_at?: string | null
          current_location?: unknown
          has_police_clearance?: boolean
          id?: string
          online?: boolean
          team_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accepted_terms_at?: string | null
          approval_status?: string
          availability_status?: string
          created_at?: string | null
          current_location?: unknown
          has_police_clearance?: boolean
          id?: string
          online?: boolean
          team_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      earning_rates: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean
          rate_per_unit: number
          rate_type: string
          unit_of_measure: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean
          rate_per_unit: number
          rate_type: string
          unit_of_measure: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean
          rate_per_unit?: number
          rate_type?: string
          unit_of_measure?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      pricing_configs: {
        Row: {
          active: boolean | null
          effective_from: string | null
          id: string
          initial_fee: number
          initial_fee_night: number
          per_km_rate: number
          return_distance_rate: number
          waiting_fee_per_min: number
        }
        Insert: {
          active?: boolean | null
          effective_from?: string | null
          id?: string
          initial_fee?: number
          initial_fee_night?: number
          per_km_rate?: number
          return_distance_rate?: number
          waiting_fee_per_min?: number
        }
        Update: {
          active?: boolean | null
          effective_from?: string | null
          id?: string
          initial_fee?: number
          initial_fee_night?: number
          per_km_rate?: number
          return_distance_rate?: number
          waiting_fee_per_min?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          phone_number: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      smart_queue: {
        Row: {
          booking_id: string
          created_at: string | null
          driver_team_id: string | null
          notified_at: string | null
          rank: number
          responded_at: string | null
          status: string
        }
        Insert: {
          booking_id: string
          created_at?: string | null
          driver_team_id?: string | null
          notified_at?: string | null
          rank: number
          responded_at?: string | null
          status?: string
        }
        Update: {
          booking_id?: string
          created_at?: string | null
          driver_team_id?: string | null
          notified_at?: string | null
          rank?: number
          responded_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "smart_queue_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smart_queue_driver_team_id_fkey"
            columns: ["driver_team_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          created_at: string | null
          customer_id: string
          driver_id: string | null
          dropoff_address: string | null
          dropoff_location: unknown
          estimated_fare_breakdown: Json | null
          final_fare: number | null
          id: string
          optional_stop_address: string | null
          optional_stop_location: unknown
          pickup_address: string | null
          pickup_location: unknown
          status: Database["public"]["Enums"]["trip_status"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          driver_id?: string | null
          dropoff_address?: string | null
          dropoff_location: unknown
          estimated_fare_breakdown?: Json | null
          final_fare?: number | null
          id?: string
          optional_stop_address?: string | null
          optional_stop_location?: unknown
          pickup_address?: string | null
          pickup_location: unknown
          status?: Database["public"]["Enums"]["trip_status"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          driver_id?: string | null
          dropoff_address?: string | null
          dropoff_location?: unknown
          estimated_fare_breakdown?: Json | null
          final_fare?: number | null
          id?: string
          optional_stop_address?: string | null
          optional_stop_location?: unknown
          pickup_address?: string | null
          pickup_location?: unknown
          status?: Database["public"]["Enums"]["trip_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trips_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "driver_teams"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_driver_atomic: {
        Args: { p_driver_id: string; p_trip_id: string }
        Returns: undefined
      }
      assign_driver_atomic_function: {
        Args: { p_booking_id: string }
        Returns: Json
      }
      claim_next_queued_trip: {
        Args: { p_driver_id: string }
        Returns: {
          trip_id: string
        }[]
      }
      find_nearest_vacant_driver: {
        Args: { origin: unknown }
        Returns: {
          dist_meters: number
          id: string
          lat: number
          lng: number
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      approval_status: "PENDING" | "APPROVED" | "REJECTED"
      compliance_type: "PASSENGER_LEGAL" | "DRIVER_TC"
      driver_status: "OFFLINE" | "VACANT" | "ENGAGED"
      trip_status:
        | "REQUESTED"
        | "QUEUED"
        | "HOLDING"
        | "ACCEPTED"
        | "EN_ROUTE_PICKUP"
        | "ARRIVED_PICKUP"
        | "DRIVING_CUSTOMER_VEHICLE"
        | "COMPLETED"
        | "PAYMENT_COLLECTED"
      user_role: "customer" | "driver_team" | "admin"
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
    Enums: {
      approval_status: ["PENDING", "APPROVED", "REJECTED"],
      compliance_type: ["PASSENGER_LEGAL", "DRIVER_TC"],
      driver_status: ["OFFLINE", "VACANT", "ENGAGED"],
      trip_status: [
        "REQUESTED",
        "QUEUED",
        "HOLDING",
        "ACCEPTED",
        "EN_ROUTE_PICKUP",
        "ARRIVED_PICKUP",
        "DRIVING_CUSTOMER_VEHICLE",
        "COMPLETED",
        "PAYMENT_COLLECTED",
      ],
      user_role: ["customer", "driver_team", "admin"],
    },
  },
} as const
