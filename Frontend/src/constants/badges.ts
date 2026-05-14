import { BadgeConfig } from "../types";

export const BADGES: Omit<BadgeConfig, "condition">[] = [
  {
    id: "first-spark",
    name: "First Spark",
    description: "Complete 1 focus session",
    icon: "🔥"
  },
  {
    id: "week-warrior",
    name: "Week Warrior",
    description: "7-day streak",
    icon: "🗡️"
  },
  {
    id: "decade-driver",
    name: "Decade Driver",
    description: "Reach a 10-day streak",
    icon: "🚀"
  },
  {
    id: "habit-hero",
    name: "Habit Hero",
    description: "Complete all habits for 3 days",
    icon: "🦸"
  },
  {
    id: "focus-master",
    name: "Focus Master",
    description: "10 hours of total study time",
    icon: "🎯"
  },
  {
    id: "unstoppable",
    name: "Unstoppable",
    description: "30-day streak",
    icon: "💎"
  },
  {
    id: "early-bird",
    name: "Early Bird",
    description: "Start a session before 8 AM",
    icon: "🌅"
  },
  {
    id: "night-owl",
    name: "Night Owl",
    description: "Complete a session after 10 PM",
    icon: "🦉"
  },
  {
    id: "perfect-week",
    name: "Perfect Week",
    description: "All habits done for 7 days",
    icon: "⭐"
  }
];
