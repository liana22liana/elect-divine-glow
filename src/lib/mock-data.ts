export interface Material {
  id: string;
  title: string;
  description: string;
  category: string;
  type: "video" | "audio";
  video_url: string;
  thumbnail_url: string;
  created_at: string;
  is_published: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  created_at: string;
  subscription_active: boolean;
}

export const CATEGORIES = [
  { id: "money", label: "Деньги", icon: "Gem" },
  { id: "relationships", label: "Отношения", icon: "Heart" },
  { id: "reality", label: "Управление реальностью", icon: "Sparkles" },
  { id: "mindset", label: "Мышление", icon: "Brain" },
  { id: "experts", label: "Приглашённые эксперты", icon: "Users" },
  { id: "body", label: "Тело", icon: "Flower2" },
  { id: "practices", label: "Практики и медитации", icon: "Moon" },
] as const;

export const mockMaterials: Material[] = [
  {
    id: "1",
    title: "Как выйти на новый уровень дохода",
    description: "В этом видео мы разберём ключевые блоки, которые мешают вам зарабатывать больше, и проработаем их через практические упражнения.",
    category: "money",
    type: "video",
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail_url: "",
    created_at: "2025-03-20",
    is_published: true,
  },
  {
    id: "2",
    title: "Медитация на изобилие",
    description: "Глубокая медитация для настройки на частоту изобилия и благодарности.",
    category: "practices",
    type: "audio",
    video_url: "",
    thumbnail_url: "",
    created_at: "2025-03-18",
    is_published: true,
  },
  {
    id: "3",
    title: "Энергия отношений: притяжение и отталкивание",
    description: "Разбираем энергетические паттерны в отношениях и учимся выстраивать гармоничные связи.",
    category: "relationships",
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
    category: "mindset",
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
    category: "experts",
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
    category: "body",
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
    category: "reality",
    type: "video",
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail_url: "",
    created_at: "2025-03-05",
    is_published: true,
  },
];

export const mockUser: UserProfile = {
  id: "1",
  email: "elena@example.com",
  name: "Елена",
  created_at: "2025-01-15",
  subscription_active: true,
};

export const mockUsers: UserProfile[] = [
  mockUser,
  { id: "2", email: "anna@example.com", name: "Анна", created_at: "2025-02-01", subscription_active: true },
  { id: "3", email: "maria@example.com", name: "Мария", created_at: "2025-02-15", subscription_active: false },
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

// Generate dates for the last 28 days
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
  // h1 - daily meditation, completed most days
  ...last28.filter((_, i) => i % 7 !== 3 && i % 5 !== 0).map((date, i) => ({
    id: `hl1-${i}`,
    habit_id: "h1",
    date,
    completed: true,
  })),
  // h2 - yoga 3x/week
  ...last28.filter((_, i) => i % 7 === 0 || i % 7 === 2 || i % 7 === 5).map((date, i) => ({
    id: `hl2-${i}`,
    habit_id: "h2",
    date,
    completed: true,
  })),
  // h3 - mindset course with deadline
  ...last28.filter((_, i) => i % 7 === 1 || i % 7 === 3 || i % 7 === 4 || i % 7 === 6).slice(0, 8).map((date, i) => ({
    id: `hl3-${i}`,
    habit_id: "h3",
    date,
    completed: true,
  })),
];
