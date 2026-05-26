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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      adjustments: {
        Row: {
          adjustment_type: string
          amount: number
          created_at: string
          created_by: string
          id: string
          job_id: string
          notes: string
          operational_date: string
          reference_invoice_id: string | null
          reference_time_entry_id: string | null
          tenant_id: string
          updated_at: string
          updated_by: string
        }
        Insert: {
          adjustment_type: string
          amount: number
          created_at?: string
          created_by: string
          id?: string
          job_id: string
          notes: string
          operational_date: string
          reference_invoice_id?: string | null
          reference_time_entry_id?: string | null
          tenant_id?: string
          updated_at?: string
          updated_by: string
        }
        Update: {
          adjustment_type?: string
          amount?: number
          created_at?: string
          created_by?: string
          id?: string
          job_id?: string
          notes?: string
          operational_date?: string
          reference_invoice_id?: string | null
          reference_time_entry_id?: string | null
          tenant_id?: string
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "adjustments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adjustments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adjustments_reference_invoice_id_fkey"
            columns: ["reference_invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adjustments_reference_time_entry_id_fkey"
            columns: ["reference_time_entry_id"]
            isOneToOne: false
            referencedRelation: "time_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adjustments_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      client_contacts: {
        Row: {
          client_id: string
          created_at: string
          created_by: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean
          is_primary: boolean
          phone: string | null
          role: string | null
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          created_by?: string | null
          email: string
          full_name: string
          id?: string
          is_active?: boolean
          is_primary?: boolean
          phone?: string | null
          role?: string | null
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          created_by?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          is_primary?: boolean
          phone?: string | null
          role?: string | null
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_cc_client"
            columns: ["tenant_id", "client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_cc_created_by"
            columns: ["tenant_id", "created_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_cc_updated_by"
            columns: ["tenant_id", "updated_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      clients: {
        Row: {
          billing_address: Json | null
          created_at: string
          created_by: string | null
          id: string
          industry: string | null
          name: string
          status: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
          website: string | null
        }
        Insert: {
          billing_address?: Json | null
          created_at?: string
          created_by?: string | null
          id?: string
          industry?: string | null
          name: string
          status?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
          website?: string | null
        }
        Update: {
          billing_address?: Json | null
          created_at?: string
          created_by?: string | null
          id?: string
          industry?: string | null
          name?: string
          status?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_clients_created_by"
            columns: ["tenant_id", "created_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_clients_updated_by"
            columns: ["tenant_id", "updated_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      disciplines: {
        Row: {
          active: boolean
          code: string
          created_at: string
          default_hourly_rate: number
          description: string | null
          id: string
          name: string
          requires_cpeng: boolean
          sort_order: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          default_hourly_rate: number
          description?: string | null
          id?: string
          name: string
          requires_cpeng?: boolean
          sort_order: number
          tenant_id?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          default_hourly_rate?: number
          description?: string | null
          id?: string
          name?: string
          requires_cpeng?: boolean
          sort_order?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      domain_events: {
        Row: {
          actor_id: string | null
          entity_id: string
          entity_type: string
          event_type: string
          id: string
          occurred_at: string
          payload: Json
          tenant_id: string
        }
        Insert: {
          actor_id?: string | null
          entity_id: string
          entity_type: string
          event_type: string
          id?: string
          occurred_at?: string
          payload?: Json
          tenant_id?: string
        }
        Update: {
          actor_id?: string | null
          entity_id?: string
          entity_type?: string
          event_type?: string
          id?: string
          occurred_at?: string
          payload?: Json
          tenant_id?: string
        }
        Relationships: []
      }
      domain_events_2026: {
        Row: {
          actor_id: string | null
          entity_id: string
          entity_type: string
          event_type: string
          id: string
          occurred_at: string
          payload: Json
          tenant_id: string
        }
        Insert: {
          actor_id?: string | null
          entity_id: string
          entity_type: string
          event_type: string
          id?: string
          occurred_at?: string
          payload?: Json
          tenant_id?: string
        }
        Update: {
          actor_id?: string | null
          entity_id?: string
          entity_type?: string
          event_type?: string
          id?: string
          occurred_at?: string
          payload?: Json
          tenant_id?: string
        }
        Relationships: []
      }
      invoice_line_items: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          invoice_id: string
          job_phase_id: string | null
          quantity: number
          tenant_id: string
          unit_price: number
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          job_phase_id?: string | null
          quantity?: number
          tenant_id?: string
          unit_price?: number
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          job_phase_id?: string | null
          quantity?: number
          tenant_id?: string
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_line_items_job_phase_id_fkey"
            columns: ["job_phase_id"]
            isOneToOne: false
            referencedRelation: "job_phases"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string
          created_by: string
          due_date: string | null
          id: string
          invoice_number: string | null
          issued_at: string | null
          job_id: string
          notes: string | null
          paid_at: string | null
          status: string
          subtotal: number
          tax_total: number
          tenant_id: string
          total_amount: number
          updated_at: string
          updated_by: string
        }
        Insert: {
          created_at?: string
          created_by: string
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          issued_at?: string | null
          job_id: string
          notes?: string | null
          paid_at?: string | null
          status?: string
          subtotal?: number
          tax_total?: number
          tenant_id?: string
          total_amount?: number
          updated_at?: string
          updated_by: string
        }
        Update: {
          created_at?: string
          created_by?: string
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          issued_at?: string | null
          job_id?: string
          notes?: string | null
          paid_at?: string | null
          status?: string
          subtotal?: number
          tax_total?: number
          tenant_id?: string
          total_amount?: number
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      job_analytical_snapshots: {
        Row: {
          created_at: string
          id: string
          job_id: string
          profit_margin_percentage: number
          profit_margin_value: number
          realized_revenue: number
          temporal_date: string
          tenant_id: string
          total_approved_hours: number
          total_operational_cost: number
          unbilled_wip_value: number
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          profit_margin_percentage?: number
          profit_margin_value?: number
          realized_revenue?: number
          temporal_date: string
          tenant_id?: string
          total_approved_hours?: number
          total_operational_cost?: number
          unbilled_wip_value?: number
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          profit_margin_percentage?: number
          profit_margin_value?: number
          realized_revenue?: number
          temporal_date?: string
          tenant_id?: string
          total_approved_hours?: number
          total_operational_cost?: number
          unbilled_wip_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "job_analytical_snapshots_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_components: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          estimated_hours: number
          id: string
          is_billable: boolean
          name: string
          scope_id: string
          sort_order: number
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          estimated_hours?: number
          id?: string
          is_billable?: boolean
          name: string
          scope_id: string
          sort_order: number
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          estimated_hours?: number
          id?: string
          is_billable?: boolean
          name?: string
          scope_id?: string
          sort_order?: number
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_jc_created_by"
            columns: ["tenant_id", "created_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_jc_scope"
            columns: ["tenant_id", "scope_id"]
            isOneToOne: false
            referencedRelation: "job_scopes"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_jc_updated_by"
            columns: ["tenant_id", "updated_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      job_disciplines: {
        Row: {
          created_at: string
          discipline_id: string
          job_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          discipline_id: string
          job_id: string
          tenant_id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          discipline_id?: string
          job_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_jd_discipline"
            columns: ["tenant_id", "discipline_id"]
            isOneToOne: false
            referencedRelation: "disciplines"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_jd_job"
            columns: ["tenant_id", "job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      job_offices: {
        Row: {
          created_at: string
          is_primary: boolean
          job_id: string
          office_location_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          is_primary?: boolean
          job_id: string
          office_location_id: string
          tenant_id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          is_primary?: boolean
          job_id?: string
          office_location_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_jo_job"
            columns: ["tenant_id", "job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_jo_office"
            columns: ["tenant_id", "office_location_id"]
            isOneToOne: false
            referencedRelation: "office_locations"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      job_phases: {
        Row: {
          created_at: string
          created_by: string | null
          estimated_hours: number
          fee_amount: number
          id: string
          job_id: string
          name: string
          planned_end_date: string | null
          planned_start_date: string | null
          sort_order: number
          status: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          estimated_hours?: number
          fee_amount?: number
          id?: string
          job_id: string
          name: string
          planned_end_date?: string | null
          planned_start_date?: string | null
          sort_order: number
          status?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          estimated_hours?: number
          fee_amount?: number
          id?: string
          job_id?: string
          name?: string
          planned_end_date?: string | null
          planned_start_date?: string | null
          sort_order?: number
          status?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_jp_created_by"
            columns: ["tenant_id", "created_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_jp_job"
            columns: ["tenant_id", "job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_jp_updated_by"
            columns: ["tenant_id", "updated_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      job_scopes: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_included: boolean
          name: string
          phase_id: string
          sort_order: number
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_included?: boolean
          name: string
          phase_id: string
          sort_order: number
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_included?: boolean
          name?: string
          phase_id?: string
          sort_order?: number
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_js_created_by"
            columns: ["tenant_id", "created_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_js_phase"
            columns: ["tenant_id", "phase_id"]
            isOneToOne: false
            referencedRelation: "job_phases"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_js_updated_by"
            columns: ["tenant_id", "updated_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      job_statuses: {
        Row: {
          active: boolean
          code: string
          created_at: string
          description: string | null
          id: string
          is_terminal: boolean
          name: string
          sort_order: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_terminal?: boolean
          name: string
          sort_order: number
          tenant_id?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_terminal?: boolean
          name?: string
          sort_order?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      job_types: {
        Row: {
          active: boolean
          code: string
          created_at: string
          description: string | null
          id: string
          name: string
          sort_order: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          sort_order: number
          tenant_id?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          sort_order?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          actual_completion_date: string | null
          client_id: string
          created_at: string
          created_by: string | null
          description: string | null
          design_manager_id: string | null
          dp_number: string | null
          fee_value: number
          id: string
          job_number: string
          job_type_id: string
          lot_number: string | null
          name: string
          opened_date: string
          primary_office_id: string
          project_director_id: string
          project_risk_value: number
          risk_tier_id: string
          site_address: Json | null
          status_id: string
          target_completion_date: string | null
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          actual_completion_date?: string | null
          client_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          design_manager_id?: string | null
          dp_number?: string | null
          fee_value?: number
          id?: string
          job_number: string
          job_type_id: string
          lot_number?: string | null
          name: string
          opened_date?: string
          primary_office_id: string
          project_director_id: string
          project_risk_value?: number
          risk_tier_id: string
          site_address?: Json | null
          status_id: string
          target_completion_date?: string | null
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          actual_completion_date?: string | null
          client_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          design_manager_id?: string | null
          dp_number?: string | null
          fee_value?: number
          id?: string
          job_number?: string
          job_type_id?: string
          lot_number?: string | null
          name?: string
          opened_date?: string
          primary_office_id?: string
          project_director_id?: string
          project_risk_value?: number
          risk_tier_id?: string
          site_address?: Json | null
          status_id?: string
          target_completion_date?: string | null
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_jobs_client"
            columns: ["tenant_id", "client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_jobs_created_by"
            columns: ["tenant_id", "created_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_jobs_dm"
            columns: ["tenant_id", "design_manager_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_jobs_office"
            columns: ["tenant_id", "primary_office_id"]
            isOneToOne: false
            referencedRelation: "office_locations"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_jobs_pd"
            columns: ["tenant_id", "project_director_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_jobs_risk_tier"
            columns: ["tenant_id", "risk_tier_id"]
            isOneToOne: false
            referencedRelation: "risk_tiers"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_jobs_status"
            columns: ["tenant_id", "status_id"]
            isOneToOne: false
            referencedRelation: "job_statuses"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_jobs_type"
            columns: ["tenant_id", "job_type_id"]
            isOneToOne: false
            referencedRelation: "job_types"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_jobs_updated_by"
            columns: ["tenant_id", "updated_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      office_locations: {
        Row: {
          active: boolean
          code: string
          country_code: string
          created_at: string
          description: string | null
          id: string
          name: string
          sort_order: number
          tenant_id: string
          timezone: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          code: string
          country_code: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          sort_order: number
          tenant_id?: string
          timezone: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          code?: string
          country_code?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          sort_order?: number
          tenant_id?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      risk_tiers: {
        Row: {
          active: boolean
          code: string
          created_at: string
          description: string | null
          id: string
          max_fee_value: number | null
          min_fee_value: number
          name: string
          requires_director_signoff: boolean
          requires_peer_review: boolean
          requires_pi_insurance_check: boolean
          sort_order: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          description?: string | null
          id?: string
          max_fee_value?: number | null
          min_fee_value: number
          name: string
          requires_director_signoff?: boolean
          requires_peer_review?: boolean
          requires_pi_insurance_check?: boolean
          sort_order: number
          tenant_id?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          max_fee_value?: number | null
          min_fee_value?: number
          name?: string
          requires_director_signoff?: boolean
          requires_peer_review?: boolean
          requires_pi_insurance_check?: boolean
          sort_order?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      staff: {
        Row: {
          auth_user_id: string | null
          created_at: string
          created_by: string | null
          email: string
          full_name: string
          hourly_bill_rate: number | null
          hourly_cost_rate: number | null
          id: string
          is_active: boolean
          manager_id: string | null
          preferred_name: string | null
          primary_discipline_id: string | null
          primary_office_id: string
          role: string
          signature_url: string | null
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          created_by?: string | null
          email: string
          full_name: string
          hourly_bill_rate?: number | null
          hourly_cost_rate?: number | null
          id?: string
          is_active?: boolean
          manager_id?: string | null
          preferred_name?: string | null
          primary_discipline_id?: string | null
          primary_office_id: string
          role: string
          signature_url?: string | null
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          created_by?: string | null
          email?: string
          full_name?: string
          hourly_bill_rate?: number | null
          hourly_cost_rate?: number | null
          id?: string
          is_active?: boolean
          manager_id?: string | null
          preferred_name?: string | null
          primary_discipline_id?: string | null
          primary_office_id?: string
          role?: string
          signature_url?: string | null
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_staff_created_by"
            columns: ["tenant_id", "created_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_staff_discipline"
            columns: ["tenant_id", "primary_discipline_id"]
            isOneToOne: false
            referencedRelation: "disciplines"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_staff_manager"
            columns: ["tenant_id", "manager_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_staff_office"
            columns: ["tenant_id", "primary_office_id"]
            isOneToOne: false
            referencedRelation: "office_locations"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_staff_updated_by"
            columns: ["tenant_id", "updated_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      staff_analytical_snapshots: {
        Row: {
          contracted_hours: number
          created_at: string
          id: string
          staff_id: string
          temporal_date: string
          tenant_id: string
          total_billable_hours: number
          total_internal_hours: number
          utilisation_percentage: number
        }
        Insert: {
          contracted_hours?: number
          created_at?: string
          id?: string
          staff_id: string
          temporal_date: string
          tenant_id?: string
          total_billable_hours?: number
          total_internal_hours?: number
          utilisation_percentage?: number
        }
        Update: {
          contracted_hours?: number
          created_at?: string
          id?: string
          staff_id?: string
          temporal_date?: string
          tenant_id?: string
          total_billable_hours?: number
          total_internal_hours?: number
          utilisation_percentage?: number
        }
        Relationships: [
          {
            foreignKeyName: "staff_analytical_snapshots_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_rate_periods: {
        Row: {
          created_at: string
          created_by: string
          effective_from: string
          effective_to: string | null
          hourly_bill_rate: number
          hourly_cost_rate: number
          id: string
          notes: string | null
          staff_id: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          effective_from: string
          effective_to?: string | null
          hourly_bill_rate: number
          hourly_cost_rate: number
          id?: string
          notes?: string | null
          staff_id: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          effective_from?: string
          effective_to?: string | null
          hourly_bill_rate?: number
          hourly_cost_rate?: number
          id?: string
          notes?: string | null
          staff_id?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_srp_created_by"
            columns: ["tenant_id", "created_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_srp_staff"
            columns: ["tenant_id", "staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_srp_updated_by"
            columns: ["tenant_id", "updated_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      tenant_sequences: {
        Row: {
          created_at: string
          entity_type: string
          next_value: number
          tenant_id: string
          updated_at: string
          year: number
        }
        Insert: {
          created_at?: string
          entity_type: string
          next_value?: number
          tenant_id?: string
          updated_at?: string
          year: number
        }
        Update: {
          created_at?: string
          entity_type?: string
          next_value?: number
          tenant_id?: string
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      tenants: {
        Row: {
          active: boolean
          country_code: string
          created_at: string
          currency_code: string
          id: string
          name: string
          slug: string
          tenant_id: string
          timezone: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          country_code: string
          created_at?: string
          currency_code?: string
          id?: string
          name: string
          slug: string
          tenant_id?: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          country_code?: string
          created_at?: string
          currency_code?: string
          id?: string
          name?: string
          slug?: string
          tenant_id?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      time_entries: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          created_by: string
          hours: number
          id: string
          is_billable: boolean
          job_id: string
          job_phase_id: string | null
          linked_invoice_id: string | null
          notes: string | null
          operational_date: string
          snapshot_bill_rate: number
          snapshot_cost_rate: number
          staff_id: string
          status: string
          tenant_id: string
          updated_at: string
          updated_by: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by: string
          hours: number
          id?: string
          is_billable?: boolean
          job_id: string
          job_phase_id?: string | null
          linked_invoice_id?: string | null
          notes?: string | null
          operational_date: string
          snapshot_bill_rate: number
          snapshot_cost_rate: number
          staff_id: string
          status?: string
          tenant_id?: string
          updated_at?: string
          updated_by: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string
          hours?: number
          id?: string
          is_billable?: boolean
          job_id?: string
          job_phase_id?: string | null
          linked_invoice_id?: string | null
          notes?: string | null
          operational_date?: string
          snapshot_bill_rate?: number
          snapshot_cost_rate?: number
          staff_id?: string
          status?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_job_phase_id_fkey"
            columns: ["job_phase_id"]
            isOneToOne: false
            referencedRelation: "job_phases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_linked_invoice_id_fkey"
            columns: ["linked_invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bootstrap_tenant: {
        Args: {
          p_discipline_name: string
          p_email: string
          p_full_name: string
          p_hourly_bill_rate: number
          p_hourly_cost_rate: number
          p_office_name: string
          p_role: string
          p_tenant_name: string
          p_tenant_slug: string
          p_user_id: string
        }
        Returns: string
      }
      current_tenant_id: { Args: never; Returns: string }
      generate_next_sequence: {
        Args: { p_entity_type: string; p_tenant_id: string; p_year?: number }
        Returns: string
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
