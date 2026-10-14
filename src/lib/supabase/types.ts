/**
 * Database types, met de hand bijgehouden naast `supabase/migrations/`.
 *
 * De oude tabellen zonder `_new` (onderwerpen, opgaven en voortgang van
 * vóór de overstap) zijn weg sinds migratie 0033.
 */

/** `locked` is weg sinds migratie 0034 (het oude leerpad). */
export type ProgressStatus = 'in_progress' | 'mastered'
export type ProfileRole = 'student' | 'admin'
export type Difficulty = 1 | 2 | 3
export type Grade = 'vwo_4' | 'vwo_5' | 'vwo_6' | 'examen_training' | 'anders'

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          role: ProfileRole
          grade: Grade | null
          display_name: string | null
          tour_seen_at: string | null
          /** Alleen docent, youtube, klas, forum of proberen. Migratie 0057 en 0060. */
          herkomst: string | null
          created_at: string
        }
        Insert: {
          id: string
          username?: string | null
          role?: ProfileRole
          grade?: Grade | null
          display_name?: string | null
          tour_seen_at?: string | null
          herkomst?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
        Relationships: []
      }
      /** Eén rij per leerling die de welkomstmail krijgt. Migratie 0038. */
      welkomstmail_claim: {
        Row: {
          user_id: string
          geclaimd_op: string
        }
        Insert: {
          user_id: string
          geclaimd_op?: string
        }
        Update: Partial<Database['public']['Tables']['welkomstmail_claim']['Insert']>
        Relationships: []
      }
      // ── New shadow tables (migrations 0013 / 0014) ──────────────────
      chapters: {
        Row: {
          id: string
          slug: string
          title: string
          book_part: number
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          book_part: number
          order_index: number
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['chapters']['Insert']>
        Relationships: []
      }
      /** Boekparagrafen per hoofdstuk. Migratie 0053. */
      paragraphs: {
        Row: {
          id: string
          chapter_id: string
          slug: string
          label: string
          title: string
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          chapter_id: string
          slug: string
          label: string
          title: string
          order_index: number
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['paragraphs']['Insert']>
        Relationships: []
      }
      /** Theorieblok A, B, C binnen een paragraaf. Migratie 0053. */
      theory_blocks: {
        Row: {
          id: string
          paragraph_id: string
          slug: string
          letter: string
          title: string
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          paragraph_id: string
          slug: string
          letter: string
          title: string
          order_index: number
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['theory_blocks']['Insert']>
        Relationships: []
      }
      topics_new: {
        Row: {
          id: string
          slug: string
          title: string
          chapter_id: string
          order_index: number
          is_unlocked_by_default: boolean
          theory_block_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          chapter_id: string
          order_index: number
          is_unlocked_by_default?: boolean
          theory_block_id?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['topics_new']['Insert']>
        Relationships: []
      }
      topic_clusters_new: {
        Row: {
          id: string
          topic_id: string
          slug: string
          title: string
          order_index: number
          theory_block_id: string | null
        }
        Insert: {
          id?: string
          topic_id: string
          slug: string
          title: string
          order_index: number
          theory_block_id?: string | null
        }
        Update: Partial<Database['public']['Tables']['topic_clusters_new']['Insert']>
        Relationships: []
      }
      questions_new: {
        Row: {
          id: string
          topic_id: string
          cluster_id: string
          latex_body: string | null
          answer: string
          latex_answer: string | null
          answer_prefix: string | null
          answer_alternatives: string[]
          difficulty: Difficulty
          is_ai_generated: boolean
          order_index: number | null
          created_at: string
        }
        Insert: {
          id?: string
          topic_id: string
          cluster_id: string
          latex_body?: string | null
          answer: string
          latex_answer?: string | null
          answer_prefix?: string | null
          answer_alternatives?: string[]
          difficulty: Difficulty
          is_ai_generated?: boolean
          order_index?: number | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['questions_new']['Insert']>
        Relationships: []
      }
      question_steps_new: {
        Row: {
          id: string
          question_id: string
          step_order: number
          step_description: string
        }
        Insert: {
          id?: string
          question_id: string
          step_order: number
          step_description: string
        }
        Update: Partial<Database['public']['Tables']['question_steps_new']['Insert']>
        Relationships: []
      }
      // ── New user tables (migration 0018) ────────────────────────────
      user_progress_new: {
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
          is_skipped: boolean
        }
        Insert: {
          id?: string
          user_id: string
          topic_id: string
          cluster_id: string
          status?: ProgressStatus
          correct_streak?: number
          total_answered?: number
          total_correct?: number
          mastered_at?: string | null
          is_skipped?: boolean
        }
        Update: Partial<Database['public']['Tables']['user_progress_new']['Insert']>
        Relationships: []
      }
      user_sessions_new: {
        Row: {
          id: string
          user_id: string
          topic_id: string | null
          cluster_id: string | null
          session_type: 'practice' | 'custom_test'
          name: string | null
          show_answers: 'immediate' | 'end'
          started_at: string
          ended_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          topic_id?: string | null
          cluster_id?: string | null
          session_type?: 'practice' | 'custom_test'
          name?: string | null
          show_answers?: 'immediate' | 'end'
          started_at?: string
          ended_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['user_sessions_new']['Insert']>
        Relationships: []
      }
      custom_test_questions: {
        Row: {
          session_id: string
          question_id: string
          order_index: number
        }
        Insert: {
          session_id: string
          question_id: string
          order_index: number
        }
        Update: Partial<Database['public']['Tables']['custom_test_questions']['Insert']>
        Relationships: []
      }
      session_answers_new: {
        Row: {
          id: string
          session_id: string
          question_id: string
          user_answer: string | null
          is_correct: boolean | null
          hints_used: number
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
          time_spent_sec?: number | null
          answered_at?: string
        }
        Update: Partial<Database['public']['Tables']['session_answers_new']['Insert']>
        Relationships: []
      }
      question_flags_new: {
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
        Update: Partial<Database['public']['Tables']['question_flags_new']['Insert']>
        Relationships: []
      }
      known_wrong_answers_new: {
        Row: {
          id: string
          question_id: string
          wrong_answer: string
          error_explanation: string
          category: string | null
          seen_count: number
          created_at: string
        }
        Insert: {
          id?: string
          question_id: string
          wrong_answer: string
          error_explanation: string
          category?: string | null
          seen_count?: number
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['known_wrong_answers_new']['Insert']>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
