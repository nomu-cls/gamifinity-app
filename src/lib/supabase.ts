import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface UserStory {
  id: string;
  user_id?: string;
  line_user_id?: string;
  name?: string;
  device_id?: string;
  email: string;
  day1_field1: string;
  day1_field2: string;
  day1_field3: string;
  day2_field1: string;
  day2_field2: string;
  day2_field3: string;
  day3_field1: string;
  day3_field2: string;
  day3_field3: string;
  day3_field4: string;
  day3_field5: string;
  day3_field6: string;
  story_data?: Record<number, Record<string, string>>;
  unlocked_days: number[];
  is_gift_sent: boolean;
  is_gift_viewed: boolean;
  progress: number;
  google_sheets_url: string;
  submitted_at?: string;
  submission_deadline?: string;
  is_locked: boolean;
  revival_requested: boolean;
  day1_archive_url?: string;
  day1_archive_expires_at?: string;
  day2_archive_url?: string;
  day2_archive_expires_at?: string;
  day3_archive_url?: string;
  day3_archive_expires_at?: string;
  day1_reward_viewed: boolean;
  day2_reward_viewed: boolean;
  day3_reward_viewed: boolean;
  is_session_booked?: boolean;
  booked_at?: string;
  // UTAGE Integration
  event_schedule?: string;
  event_url?: string;
  event_password?: string;
  // Daily Navigation System
  user_phase?: 'passenger' | 'training' | 'commander';
  intro_progress?: number; // 0, 1, 2
  daily_logs?: Record<string, any>; // JSONB
  brain_type?: 'left_3d' | 'left_2d' | 'right_3d' | 'right_2d';
  // 21 Day Program
  program_enrolled_at?: string;
  program_day?: number;
  program_status?: 'not_started' | 'active' | 'completed' | 'paused';
  total_miles?: number;
  // DreamMaker Ego Stats (compatible)
  ego_observation?: number;
  ego_control?: number;
  ego_efficacy?: number;
  ego_affirmation?: number;
  stress_tolerance?: number;
  created_at: string;
  updated_at: string;
}

export interface VisionBoardImage {
  id: string;
  story_id: string;
  image_url: string;
  display_order: number;
  created_at: string;
}

export interface GiftContent {
  id: string;
  title: string;
  message: string;
  audio_url?: string;
  image_url?: string;
  reward_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DayReward {
  id: string;
  day: number;
  title: string;
  message: string;
  image_url?: string;
  reward_url?: string;
  created_at: string;
}

export interface SiteSettings {
  id: string;
  active_days?: number[];
  day1_archive_deadline?: string;
  day2_archive_deadline?: string;
  day3_archive_deadline?: string;
  day1_assignment_deadline?: string;
  day2_assignment_deadline?: string;
  day3_assignment_deadline?: string;
  default_submission_time?: string;
  enable_revival_system?: boolean;
  site_title?: string;
  site_subtitle?: string;
  app_title?: string;
  banner_text?: string;
  banner_subtext?: string;
  banner_button_text?: string;
  banner_image_url?: string;
  banner_link_url?: string;
  morning_audio_url?: string;
  night_audio_url?: string;
  footer_line1?: string;
  footer_line2?: string;
  admin_users?: string | string[];
  created_at: string;
  updated_at: string;
}

export interface QuestionConfig {
  fieldName: string;
  label: string;
  placeholder: string;
  type?: 'textarea' | 'radio' | 'rating';
  options?: string[];
}

export interface DaySetting {
  id: string;
  day: number;
  subtitle: string;
  title: string;
  date: string;
  description: string;
  questions: QuestionConfig[];
  bg_color: string;
  zoom_link?: string;
  zoom_passcode?: string;
  zoom_meeting_time?: string;
  preview_text?: string;
  preview_image_url?: string;
  youtube_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LineSetting {
  id: string;
  channel_access_token: string;
  channel_secret: string;
  liff_url: string;
  admin_password: string;
  bot_basic_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LineMessageTemplate {
  id: string;
  template_key: string;
  template_name: string;
  message_content: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
