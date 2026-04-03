// ── Library Structure ──

export interface LibrarySection {
  id: string;
  name: string;
  icon: string;
  order_index: number;
  subsections: LibrarySubsection[];
}

export interface LibrarySubsection {
  id: string;
  section_id: string;
  name: string;
  order_index: number;
}

export interface AdditionalMaterial {
  id: string;
  content_id: string;
  title: string;
  type: "video" | "audio";
  url: string;
  order_index: number;
}

export interface Material {
  id: string;
  title: string;
  description: string;
  section_id: string;
  subsection_id: string | null;
  type: "video" | "audio";
  video_url: string;
  thumbnail_url: string;
  created_at: string;
  is_published: boolean;
  additional_materials?: AdditionalMaterial[];
}

export type SubscriptionStatus = "active" | "paused" | "cancelled";
export type AmbassadorStatus = "rising" | "becoming" | "transformed" | "reborn";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  created_at: string;
  subscription_active: boolean;
  subscription_status: SubscriptionStatus;
  subscription_start_date: string;
  subscription_end_date: string | null;
  ambassador_status: AmbassadorStatus | null;
  ambassador_status_override: boolean;
  delivery_form_submitted: boolean;
  avatar_url: string | null;
}

export interface AmbassadorGift {
  id: string;
  user_id: string;
  milestone_months: 2 | 3 | 6 | 12;
  unlocked_at: string;
  gift_type: "telegram" | "content" | "physical";
  content_id: string | null;
  claimed: boolean;
}

export interface LockedContent {
  id: string;
  content_id: string;
  required_status: AmbassadorStatus;
}

export interface AmbassadorMilestone {
  months: number;
  status: AmbassadorStatus;
  label: string;
  gift_description: string;
  gift_type: "telegram" | "content" | "physical";
}

export const AMBASSADOR_MILESTONES: AmbassadorMilestone[] = [
  { months: 2, status: "rising", label: "Муза", gift_description: "Доступ к закрытому ТГ-каналу", gift_type: "telegram" },
  { months: 3, status: "becoming", label: "Богиня", gift_description: "Закрытый материал из библиотеки", gift_type: "content" },
  { months: 6, status: "transformed", label: "Звезда", gift_description: "Блокнот от Даши", gift_type: "physical" },
  { months: 12, status: "reborn", label: "Икона", gift_description: "Эксклюзивный подарок от Даши", gift_type: "physical" },
];

// ── Habit Tracker ──

export interface HabitTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  source_content_id: string | null;
  created_by_admin: boolean;
  created_at: string;
  adopted_count: number;
}

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  template_id: string | null;
  frequency_type: "daily" | "weekly";
  frequency_count: number;
  deadline: string | null;
  total_target: number | null;
  created_at: string;
  category?: string;
  source_content_id?: string | null;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  date: string;
  completed: boolean;
}
