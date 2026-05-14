export interface User {
  id: string;
  email: string;
  name: string;
  earnedBadges?: EarnedBadge[];
}

export interface EarnedBadge {
  badgeId: string;
  earnedAt: string;
}

export interface BadgeConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (data: { tasks: Task[], habits: Habit[], sessions: Session[] }) => boolean;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string | null;
  dueDate?: string | null;
  createdAt?: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  dueDate: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
  createdAt: string;
  category: "Study" | "Health" | "Personal" | "General" | "Placement Prep" | "Design Practice";
  notes?: string;
  subtasks: SubTask[];
  pinned: boolean;
}

export interface Habit {
  id: string;
  userId: string;
  title: string;
  icon: string;
  category: "Health" | "Study" | "Fitness" | "Wellbeing" | "General";
  goalDays: 7 | 10 | 30;
  streak: number;
  longestStreak: number;
  missedDays: number;
  lastCheckIn: string | null;
  history: string[];
}

export interface Session {
  id: string;
  userId: string;
  duration: number; // in minutes
  type: "focus" | "break";
  timestamp: string;
}

export interface Mood {
  userId: string;
  mood: string;
  date: string;
}
