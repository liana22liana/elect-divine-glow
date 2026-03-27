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
  { months: 2, status: "rising", label: "Восходящая", gift_description: "Доступ к закрытому ТГ-каналу", gift_type: "telegram" },
  { months: 3, status: "becoming", label: "Становящаяся", gift_description: "Закрытый материал из библиотеки", gift_type: "content" },
  { months: 6, status: "transformed", label: "Трансформированная", gift_description: "Блокнот от Даши", gift_type: "physical" },
  { months: 12, status: "reborn", label: "Возрождённая", gift_description: "Эксклюзивный подарок от Даши", gift_type: "physical" },
];

export const LIBRARY_SECTIONS: LibrarySection[] = [
  { id: "money", name: "Деньги", icon: "Gem", order_index: 0, subsections: [] },
  { id: "relationships", name: "Отношения", icon: "Heart", order_index: 1, subsections: [] },
  { id: "reality", name: "Управление реальностью", icon: "Sparkles", order_index: 2, subsections: [] },
  { id: "mindset", name: "Мышление", icon: "Brain", order_index: 3, subsections: [] },
  { id: "experts", name: "Приглашённые эксперты", icon: "Users", order_index: 4, subsections: [] },
  {
    id: "body",
    name: "Тело",
    icon: "Flower2",
    order_index: 5,
    subsections: [
      { id: "body-streams", section_id: "body", name: "Эфиры", order_index: 0 },
      { id: "body-kundalini", section_id: "body", name: "Кундалини", order_index: 1 },
      { id: "body-workouts", section_id: "body", name: "Тренировки", order_index: 2 },
      { id: "body-nutrition", section_id: "body", name: "Питание", order_index: 3 },
    ],
  },
  {
    id: "practices",
    name: "Практики и медитации",
    icon: "Moon",
    order_index: 6,
    subsections: [
      { id: "practices-meditations", section_id: "practices", name: "Медитации", order_index: 0 },
      { id: "practices-practices", section_id: "practices", name: "Практики", order_index: 1 },
    ],
  },
];

// Backward-compatible helper: flat list of {id, label, icon} for components that need it
export const CATEGORIES = LIBRARY_SECTIONS.map((s) => ({
  id: s.id,
  label: s.name,
  icon: s.icon,
}));

export const mockMaterials: Material[] = [
  {
    id: "1",
    title: "Как выйти на новый уровень дохода",
    description: "В этом видео мы разберём ключевые блоки, которые мешают вам зарабатывать больше, и проработаем их через практические упражнения.",
    section_id: "money",
    subsection_id: null,
    type: "video",
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail_url: "",
    created_at: "2025-03-20",
    is_published: true,
    additional_materials: [
      { id: "am1", content_id: "1", title: "Рабочая тетрадь: Денежные блоки", type: "video", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", order_index: 0 },
      { id: "am2", content_id: "1", title: "Аффирмации на изобилие", type: "audio", url: "", order_index: 1 },
    ],
  },
  {
    id: "2",
    title: "Медитация на изобилие",
    description: "Глубокая медитация для настройки на частоту изобилия и благодарности.",
    section_id: "practices",
    subsection_id: "practices-meditations",
    type: "audio",
    video_url: "",
    thumbnail_url: "",
    created_at: "2025-03-18",
    is_published: true,
    additional_materials: [
      { id: "am3", content_id: "2", title: "Гайд по медитации (аудио)", type: "audio", url: "", order_index: 0 },
    ],
  },
  {
    id: "3",
    title: "Энергия отношений: притяжение и отталкивание",
    description: "Разбираем энергетические паттерны в отношениях и учимся выстраивать гармоничные связи.",
    section_id: "relationships",
    subsection_id: null,
    type: "video",
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail_url: "",
    created_at: "2025-03-15",
    is_published: true,
  },
  {
    id: "4",
    title: "Трансформация мышления за 21 день",
    description: "Программа по изменению привычных паттернов мышления. Включает ежедневные практики и задания.",
    section_id: "mindset",
    subsection_id: null,
    type: "video",
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail_url: "",
    created_at: "2025-03-12",
    is_published: true,
  },
  {
    id: "5",
    title: "Интервью с нутрициологом: питание и энергия",
    description: "Приглашённый эксперт — нутрициолог Мария Иванова — рассказывает о том, как питание влияет на нашу энергию.",
    section_id: "experts",
    subsection_id: null,
    type: "video",
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail_url: "",
    created_at: "2025-03-10",
    is_published: true,
  },
  {
    id: "6",
    title: "Йога для женского здоровья",
    description: "Мягкая практика йоги, направленная на поддержание женского здоровья и гормонального баланса.",
    section_id: "body",
    subsection_id: "body-workouts",
    type: "video",
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail_url: "",
    created_at: "2025-03-08",
    is_published: true,
  },
  {
    id: "7",
    title: "Манифестация: как создавать свою реальность",
    description: "Пошаговая техника манифестации желаемой реальности через визуализацию и аффирмации.",
    section_id: "reality",
    subsection_id: null,
    type: "video",
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail_url: "",
    created_at: "2025-03-05",
    is_published: true,
  },
  {
    id: "8",
    title: "Кундалини йога: пробуждение энергии",
    description: "Практика кундалини йоги для активации внутренней энергии и раскрытия потенциала.",
    section_id: "body",
    subsection_id: "body-kundalini",
    type: "video",
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail_url: "",
    created_at: "2025-03-03",
    is_published: true,
  },
  {
    id: "9",
    title: "Эфир: Ответы на вопросы о теле",
    description: "Прямой эфир с ответами на вопросы участниц о здоровье и теле.",
    section_id: "body",
    subsection_id: "body-streams",
    type: "video",
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail_url: "",
    created_at: "2025-03-01",
    is_published: true,
  },
  {
    id: "10",
    title: "Практика осознанного дыхания",
    description: "Дыхательная практика для снятия стресса и восстановления энергии.",
    section_id: "practices",
    subsection_id: "practices-practices",
    type: "audio",
    video_url: "",
    thumbnail_url: "",
    created_at: "2025-02-28",
    is_published: true,
  },
  {
    id: "11",
    title: "Правильное питание для энергии",
    description: "Основы питания, которые помогут поддерживать высокий уровень энергии в течение дня.",
    section_id: "body",
    subsection_id: "body-nutrition",
    type: "video",
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail_url: "",
    created_at: "2025-02-25",
    is_published: true,
  },
];

export const mockUser: UserProfile = {
  id: "1",
  email: "elena@example.com",
  name: "Елена",
  created_at: "2025-01-15",
  subscription_active: true,
  subscription_status: "active",
  subscription_start_date: "2025-01-15",
  subscription_end_date: null,
  ambassador_status: "becoming",
  ambassador_status_override: false,
  delivery_form_submitted: false,
  avatar_url: null,
};

export const mockUsers: UserProfile[] = [
  mockUser,
  {
    id: "2", email: "anna@example.com", name: "Анна", created_at: "2025-02-01",
    subscription_active: true, subscription_status: "active",
    subscription_start_date: "2025-02-01", subscription_end_date: null,
    ambassador_status: "rising", ambassador_status_override: false,
    delivery_form_submitted: false, avatar_url: null,
  },
  {
    id: "3", email: "maria@example.com", name: "Мария", created_at: "2025-02-15",
    subscription_active: false, subscription_status: "cancelled",
    subscription_start_date: "2025-02-15", subscription_end_date: "2025-04-15",
    ambassador_status: null, ambassador_status_override: false,
    delivery_form_submitted: false, avatar_url: null,
  },
];

export const mockAmbassadorGifts: AmbassadorGift[] = [
  { id: "ag1", user_id: "1", milestone_months: 2, unlocked_at: "2025-03-15", gift_type: "telegram", content_id: null, claimed: true },
  { id: "ag2", user_id: "1", milestone_months: 3, unlocked_at: "2025-04-15", gift_type: "content", content_id: "3", claimed: false },
];

export const mockLockedContent: LockedContent[] = [
  { id: "lc1", content_id: "3", required_status: "becoming" },
  { id: "lc2", content_id: "7", required_status: "transformed" },
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

export const mockHabitTemplates: HabitTemplate[] = [
  {
    id: "ht1",
    title: "Утренняя медитация",
    description: "Начинайте каждый день с 10-минутной медитации осознанности.",
    category: "practices",
    source_content_id: "2",
    created_by_admin: true,
    created_at: "2025-03-01",
    adopted_count: 18,
  },
  {
    id: "ht2",
    title: "Практика благодарности",
    description: "Записывайте 3 вещи, за которые вы благодарны, каждый вечер.",
    category: "mindset",
    source_content_id: "4",
    created_by_admin: true,
    created_at: "2025-03-05",
    adopted_count: 24,
  },
  {
    id: "ht3",
    title: "Йога для тела",
    description: "Мягкая йога-практика 3 раза в неделю для поддержания тонуса.",
    category: "body",
    source_content_id: "6",
    created_by_admin: true,
    created_at: "2025-03-10",
    adopted_count: 12,
  },
  {
    id: "ht4",
    title: "Работа с денежными установками",
    description: "Ежедневная проработка ограничивающих убеждений о деньгах.",
    category: "money",
    source_content_id: "1",
    created_by_admin: true,
    created_at: "2025-03-12",
    adopted_count: 9,
  },
];

function generateDates(daysBack: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = daysBack; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

const last28 = generateDates(27);

export const mockHabits: Habit[] = [
  {
    id: "h1",
    user_id: "1",
    title: "Утренняя медитация",
    template_id: "ht1",
    frequency_type: "daily",
    frequency_count: 1,
    deadline: null,
    total_target: null,
    created_at: "2025-03-01",
    category: "practices",
    source_content_id: "2",
  },
  {
    id: "h2",
    user_id: "1",
    title: "Йога для тела",
    template_id: "ht3",
    frequency_type: "weekly",
    frequency_count: 3,
    deadline: null,
    total_target: null,
    created_at: "2025-03-10",
    category: "body",
    source_content_id: "6",
  },
  {
    id: "h3",
    user_id: "1",
    title: "Курс по трансформации мышления",
    template_id: null,
    frequency_type: "weekly",
    frequency_count: 4,
    deadline: "2025-04-30",
    total_target: 12,
    created_at: "2025-03-05",
    category: "mindset",
    source_content_id: "4",
  },
];

export const mockHabitLogs: HabitLog[] = [
  ...last28.filter((_, i) => i % 7 !== 3 && i % 5 !== 0).map((date, i) => ({
    id: `hl1-${i}`,
    habit_id: "h1",
    date,
    completed: true,
  })),
  ...last28.filter((_, i) => i % 7 === 0 || i % 7 === 2 || i % 7 === 5).map((date, i) => ({
    id: `hl2-${i}`,
    habit_id: "h2",
    date,
    completed: true,
  })),
  ...last28.filter((_, i) => i % 7 === 1 || i % 7 === 3 || i % 7 === 4 || i % 7 === 6).slice(0, 8).map((date, i) => ({
    id: `hl3-${i}`,
    habit_id: "h3",
    date,
    completed: true,
  })),
];
