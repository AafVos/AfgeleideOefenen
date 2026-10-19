/**
 * Database types, met de hand bijgehouden naast `supabase/migrations/`.
 *
 * De oude tabellen zonder `_new` (onderwerpen, opgaven en voortgang van
 * vóór de overstap) zijn weg sinds migratie 0033.
 */

import type { SiteVariant } from '@/config/site'
import type {
  Gebeurtenis as MeetGebeurtenisRij,
  MeetApparaat,
  MeetSoort,
} from '@/lib/meten/gebeurtenis'

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
          /** Opt-in e-mailherinnering bij stilte. Migratie 0082. */
          herinnering_mail: boolean
          herinnering_aan_sinds: string | null
          /** Alleen de server schrijft deze drie; een trigger bewaakt dat. */
          herinnering_laatst_op: string | null
          herinnering_aantal: number
          herinnering_sleutel: string
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
          herinnering_mail?: boolean
          herinnering_aan_sinds?: string | null
          herinnering_laatst_op?: string | null
          herinnering_aantal?: number
          herinnering_sleutel?: string
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
      /** Boekparagrafen per hoofdstuk. Migratie 0053. `zichtbaar` sinds 0064. */
      paragraphs: {
        Row: {
          id: string
          chapter_id: string
          slug: string
          label: string
          title: string
          order_index: number
          zichtbaar: boolean
          created_at: string
        }
        Insert: {
          id?: string
          chapter_id: string
          slug: string
          label: string
          title: string
          order_index: number
          zichtbaar?: boolean
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
          source_label: string | null
          source_url: string | null
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
          source_label?: string | null
          source_url?: string | null
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
      /** Klikmeting zonder koekjes. Migratie 0072. Alleen de service-role schrijft hier. */
      site_gebeurtenissen: {
        Row: {
          id: number
          tijdstip: string
          sessie_id: string
          soort: MeetSoort
          pad: string
          doel: string | null
          waarde: number | null
          apparaat: MeetApparaat
          verwijzer: string | null
          ingelogd: boolean
          /** Plek binnen het tabblad, vanaf 1. Migratie 0073. */
          volgnummer: number | null
          /** Alleen bij een ingelogde leerling. Migratie 0073. */
          schuilnaam: string | null
          /** Welke site het bezoek binnenkreeg. Migratie 0081. */
          site: SiteVariant
        }
        Insert: {
          id?: never
          tijdstip?: string
          sessie_id: string
          soort: MeetSoort
          pad: string
          doel?: string | null
          waarde?: number | null
          apparaat: MeetApparaat
          verwijzer?: string | null
          ingelogd?: boolean
          volgnummer?: number | null
          schuilnaam?: string | null
          site?: SiteVariant
        }
        Update: Partial<Database['public']['Tables']['site_gebeurtenissen']['Insert']>
        Relationships: []
      }
      site_dagtotalen: {
        Row: {
          dag: string
          /** Welke site. Migratie 0081. */
          site: SiteVariant
          soort: MeetSoort
          apparaat: MeetApparaat
          pad: string
          doel: string
          aantal: number
          sessies: number
        }
        Insert: Database['public']['Tables']['site_dagtotalen']['Row']
        Update: Partial<Database['public']['Tables']['site_dagtotalen']['Row']>
        Relationships: []
      }
      /** Video-verzoeken bij een examenvraag. Migratie 0080. */
      video_aanvragen: {
        Row: {
          id: number
          aangevraagd_op: string
          site: SiteVariant
          jaar: number
          tijdvak: number
          vraagnummer: string
          toelichting: string | null
          /** Alleen als de leerling zelf bericht wil. */
          email: string | null
          mag_mailen: boolean
          afgehandeld: boolean
        }
        Insert: {
          id?: never
          aangevraagd_op?: string
          site?: SiteVariant
          jaar: number
          tijdvak: number
          vraagnummer: string
          toelichting?: string | null
          email?: string | null
          mag_mailen?: boolean
          afgehandeld?: boolean
        }
        Update: Partial<Database['public']['Tables']['video_aanvragen']['Insert']>
        Relationships: []
      }
    }
    Views: {
      /** Migratie 0080: hoe vaak elke examenvraag gevraagd is. */
      video_aanvragen_per_vraag: {
        Row: {
          jaar: number
          tijdvak: number
          vraagnummer: string
          aantal: number
          laatste: string
          afgehandeld: boolean
        }
        Relationships: []
      }
    }
    Functions: {
      laatste_antwoord_per_vraag: {
        Args: Record<string, never>
        Returns: Array<{
          question_id: string
          is_correct: boolean
        }>
      }
      /**
       * Migratie 0072, uitgebreid in 0073: gebeurtenissen wegschrijven, met
       * de grens per tabblad, het volgnummer binnen de sessie en de
       * schuilnaam van een ingelogde leerling.
       */
      meet_opslaan: {
        Args: {
          gebeurtenissen: MeetGebeurtenisRij[]
          schuilnaam?: string | null
          /** Welke site. Migratie 0081. */
          site?: SiteVariant
        }
        Returns: number
      }
      /** Migratie 0073: de schuilnaam van één leerling, voor de overzichten. */
      meet_schuilnaam: {
        Args: { gebruiker: string | null }
        Returns: string | null
      }
      /** Migratie 0072: dagtotalen bijwerken en alles ouder dan 90 dagen weg. */
      site_meting_onderhoud: {
        Args: Record<string, never>
        Returns: number
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
