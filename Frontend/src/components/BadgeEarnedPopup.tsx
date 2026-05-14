import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BADGES } from "../constants/badges";
import { PartyPopper, X } from "lucide-react";
import { BadgeConfig } from "../types";

// Simple event bus for badge notifications
export const badgeEmitter = {
  listeners: [] as ((badge: BadgeConfig) => void)[],
  emit(badgeId: string) {
    const badge = BADGES.find(b => b.id === badgeId);
    if (badge) {
      this.listeners.forEach(l => l(badge as BadgeConfig));
    }
  },
  subscribe(listener: (badge: BadgeConfig) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
};

export default function BadgeEarnedPopup() {
  const [activeBadge, setActiveBadge] = useState<BadgeConfig | null>(null);

  useEffect(() => {
    return badgeEmitter.subscribe((badge) => {
      setActiveBadge(badge);
      // Auto close after 5 seconds
      setTimeout(() => setActiveBadge(null), 5000);
    });
  }, []);

  return (
    <AnimatePresence>
      {activeBadge && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 50 }}
          className="fixed bottom-8 right-8 z-[100] w-full max-w-sm"
        >
          <div className="bg-dark-navy text-white p-6 rounded-[2.5rem] shadow-2xl shadow-neon-purple/20 border border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4">
              <button 
                onClick={() => setActiveBadge(null)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center text-5xl relative z-10">
                  {activeBadge.icon}
                </div>
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-4 border border-dashed border-neon-purple/30 rounded-full"
                />
                <div className="absolute inset-0 bg-neon-purple/40 blur-2xl rounded-full -z-0" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-neon-purple">
                  <PartyPopper size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">New Badge Earned!</span>
                </div>
                <h4 className="text-xl font-display font-bold">{activeBadge.name}</h4>
                <p className="text-sm text-white/60 leading-tight">{activeBadge.description}</p>
              </div>
            </div>
            
            {/* Background glow stuff */}
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-coral/20 blur-3xl rounded-full" />
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-neon-purple/20 blur-3xl rounded-full" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
