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
