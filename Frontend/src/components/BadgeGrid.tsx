import { motion } from "motion/react";
import { Lock } from "lucide-react";
import { BADGES } from "../constants/badges";
import { EarnedBadge } from "../types";
import { cn } from "../lib/utils";

interface BadgeGridProps {
  earnedBadges: EarnedBadge[];
  columns?: 2 | 3;
}

export default function BadgeGrid({ earnedBadges, columns = 3 }: BadgeGridProps) {
  const earnedIds = new Set(earnedBadges.map(b => b.badgeId));

  return (
    <div className={cn(
      "grid gap-4 md:gap-6",
      columns === 3 ? "grid-cols-2 md:grid-cols-3" : "grid-cols-2"
    )}>
      {BADGES.map((badge, index) => {
        const earned = earnedBadges.find(b => b.badgeId === badge.id);
        const isEarned = !!earned;

        return (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              "relative p-6 rounded-[2rem] border transition-all duration-500",
              isEarned 
                ? "bg-white border-slate-100 shadow-sm hover:shadow-xl hover:shadow-neon-purple/5 group" 
                : "bg-slate-50/50 border-slate-100/50 grayscale opacity-80"
            )}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className={cn(
                "w-16 h-16 md:w-20 md:h-20 rounded-3xl flex items-center justify-center text-4xl md:text-5xl transition-all duration-500",
                isEarned 
                  ? "bg-gradient-to-br from-neon-purple/10 to-coral/10 group-hover:scale-110 shadow-inner" 
                  : "bg-slate-200/50"
              )}>
                {badge.icon}
                
                {isEarned && (
                   <div className="absolute inset-0 bg-neon-purple/20 blur-2xl rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>

              <div>
                <h4 className={cn(
                  "font-display font-bold text-sm md:text-base",
                  isEarned ? "text-dark-navy" : "text-slate-400"
                )}>
                  {badge.name}
                </h4>
                <p className="text-[10px] md:text-xs text-slate-400 font-medium px-2">
                  {badge.description}
                </p>
              </div>

              {isEarned ? (
                <div className="pt-1">
                  <span className="text-[9px] font-bold text-neon-purple bg-neon-purple/5 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Earned {new Date(earned.earnedAt).toLocaleDateString()}
                  </span>
                </div>
              ) : (
                <div className="absolute top-4 right-4 text-slate-300">
                  <Lock size={14} />
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
