/**
 * Database type definitions matching the Supabase schema in
 * `supabase/migrations/0001_init.sql`.
 *
 * These are hand-written for now. Once the schema stabilises you can replace
 * this file with the output of `supabase gen types typescript`.
 */

export type ProgressStatus = 'locked' | 'in_progress' | 'mastered'
export type ProfileRole = 'student' | 'admin'
export type Difficulty = 1 | 2 | 3
export type Grade = 'vwo_4' | 'vwo_5' | 'vwo_6' | 'examen_training' | 'anders'
export type LearningMode = 'guided' | 'topic_select' | 'diagnostic' | 'free'

export type Database = {
  public: {
    Tables: {
      topics: {
        Row: {
          id: string
          slug: string
          title: string
          order_index: number
          is_unlocked_by_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          order_index: number
          is_unlocked_by_default?: boolean
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['topics']['Insert']>
        Relationships: []
      }
      topic_clusters: {
        Row: {
          id: string
          topic_id: string
          slug: string
          title: string
          order_index: number
        }
        Insert: {
          id?: string
          topic_id: string
          slug: string
          title: string
          order_index: number
        }
        Update: Partial<Database['public']['Tables']['topic_clusters']['Insert']>
        Relationships: []
      }
      root_causes: {
        Row: {
          id: string
          topic_id: string
          slug: string
          description: string
        }
        Insert: {
          id?: string
          topic_id: string
          slug: string
          description: string
        }
        Update: Partial<Database['public']['Tables']['root_causes']['Insert']>
        Relationships: []
      }
      questions: {
        Row: {
          id: string
          topic_id: string
          cluster_id: string
          body: string
          latex_body: string | null
          answer: string
          latex_answer: string | null
          answer_alternatives: string[]
          difficulty: Difficulty
          root_cause_tags: string[]
          is_ai_generated: boolean
          order_index: number | null
          created_at: string
        }
        Insert: {
          id?: string
          topic_id: string
          cluster_id: string
          body: string
          latex_body?: string | null
          answer: string
          latex_answer?: string | null
          answer_alternatives?: string[]
          difficulty: Difficulty
          root_cause_tags?: string[]
          is_ai_generated?: boolean
          order_index?: number | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['questions']['Insert']>
        Relationships: []
      }
      question_steps: {
        Row: {
          id: string
          question_id: string
          step_order: number
          step_description: string
          root_cause_id: string | null
        }
        Insert: {
          id?: string
          question_id: string
          step_order: number
          step_description: string
          root_cause_id?: string | null
        }
        Update: Partial<Database['public']['Tables']['question_steps']['Insert']>
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          username: string | null
          role: ProfileRole
          grade: Grade | null
          display_name: string | null
          learning_mode: LearningMode | null
          onboarded_at: string | null
          created_at: string
        }
        Insert: {
          id: string
          username?: string | null
          role?: ProfileRole
          grade?: Grade | null
          display_name?: string | null
          learning_mode?: LearningMode | null
          onboarded_at?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
        Relationships: []
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          topic_id: string
          cluster_id: string
          status: ProgressStatus
          correct_streak: number
          total_answered: number
          total_correct: number
          mastered_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          topic_id: string
          cluster_id: string
          status: ProgressStatus
          correct_streak?: number
          total_answered?: number
          total_correct?: number
          mastered_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['user_progress']['Insert']>
        Relationships: []
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string
          topic_id: string
          cluster_id: string
          started_at: string
          ended_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          topic_id: string
          cluster_id: string
          started_at?: string
          ended_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['user_sessions']['Insert']>
        Relationships: []
      }
      session_answers: {
        Row: {
          id: string
          session_id: string
          question_id: string
          user_answer: string | null
          is_correct: boolean | null
          hints_used: number
          is_careless: boolean
          time_spent_sec: number | null
          answered_at: string
        }
        Insert: {
          id?: string
          session_id: string
          question_id: string
          user_answer?: string | null
          is_correct?: boolean | null
          hints_used?: number
          is_careless?: boolean
          time_spent_sec?: number | null
          answered_at?: string
        }
        Update: Partial<Database['public']['Tables']['session_answers']['Insert']>
        Relationships: []
      }
      step_mistakes: {
        Row: {
          id: string
          answer_id: string
          step_id: string
          is_careless: boolean
          created_at: string
        }
        Insert: {
          id?: string
          answer_id: string
          step_id: string
          is_careless?: boolean
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['step_mistakes']['Insert']>
        Relationships: []
      }
      known_wrong_answers: {
        Row: {
          id: string
          question_id: string
          wrong_answer: string
          error_explanation: string
          root_cause_slug: string
          seen_count: number
          created_at: string
        }
        Insert: {
          id?: string
          question_id: string
          wrong_answer: string
          error_explanation: string
          root_cause_slug: string
          seen_count?: number
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['known_wrong_answers']['Insert']>
        Relationships: []
      }
      question_flags: {
        Row: {
          id: string
          question_id: string
          user_id: string
          reason: string | null
          status: 'open' | 'resolved' | 'dismissed'
          created_at: string
          resolved_at: string | null
          resolved_by: string | null
        }
        Insert: {
          id?: string
          question_id: string
          user_id: string
          reason?: string | null
          status?: 'open' | 'resolved' | 'dismissed'
          created_at?: string
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Update: Partial<Database['public']['Tables']['question_flags']['Insert']>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
