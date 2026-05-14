import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { Trophy, Target, Star, PartyPopper, X } from "lucide-react";
import { BadgeConfig } from "../types";
import { badgeEmitter } from "./BadgeEarnedPopup";

const MILESTONES = ["week-warrior", "decade-driver", "unstoppable", "perfect-week"];

export default function MilestoneCelebration() {
  const [activeMilestone, setActiveMilestone] = useState<BadgeConfig | null>(null);

  useEffect(() => {
    return badgeEmitter.subscribe((badge) => {
      if (MILESTONES.includes(badge.id)) {
        setActiveMilestone(badge);
        
        // Trigger massive confetti
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 200 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function() {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 50 * (timeLeft / duration);
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
      }
    });
  }, []);

  if (!activeMilestone) return null;

  return (
    <AnimatePresence>
      {activeMilestone && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-dark-navy/80 backdrop-blur-md"
            onClick={() => setActiveMilestone(null)}
          />
          
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 100 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 100 }}
            className="relative bg-white rounded-[3rem] p-8 md:p-12 max-w-lg w-full text-center shadow-2xl overflow-hidden border-4 border-neon-purple/20"
          >
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-neon-purple via-coral to-neon-blue" />
            
            <div className="relative z-10 space-y-8">
              <div className="relative inline-block">
                <motion.div 
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-24 h-24 md:w-32 md:h-32 bg-slate-50 rounded-[2rem] flex items-center justify-center text-6xl shadow-inner border border-slate-100"
                >
                  {activeMilestone.icon}
                </motion.div>
                <div className="absolute -top-4 -right-4 bg-neon-purple text-white p-3 rounded-2xl shadow-lg animate-bounce">
                  <Trophy size={24} />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-neon-purple">
                  <PartyPopper size={20} />
                  <span className="text-sm font-bold uppercase tracking-[0.2em]">New Milestone Reached</span>
                  <PartyPopper size={20} />
                </div>
                <h2 className="text-4xl md:text-5xl font-display font-bold text-dark-navy tracking-tight">
                  {activeMilestone.name}
                </h2>
                <p className="text-lg text-slate-500 leading-relaxed max-w-xs mx-auto">
                  Outstanding work! You've maintained a consistency that puts you in the top 1% of focusers.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 py-6 border-y border-slate-100">
                <div className="space-y-1">
                   <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-neon-purple mx-auto mb-2">
                     <Target size={18} />
                   </div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Consistency</p>
                   <p className="text-lg font-display font-bold">100%</p>
                </div>
                <div className="space-y-1 border-x border-slate-100">
                   <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-coral mx-auto mb-2">
                     <Star size={18} fill="currentColor" />
                   </div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Growth</p>
                   <p className="text-lg font-display font-bold">+24%</p>
                </div>
                <div className="space-y-1">
                   <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-neon-blue mx-auto mb-2">
                     <Trophy size={18} />
                   </div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Focus Level</p>
                   <p className="text-lg font-display font-bold">Expert</p>
                </div>
              </div>

              <button
                onClick={() => setActiveMilestone(null)}
                className="w-full bg-dark-navy text-white py-5 rounded-[1.5rem] font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-dark-navy/20 flex items-center justify-center gap-3"
              >
                <span>Continue Journey</span>
                <Target size={20} />
              </button>
            </div>

            {/* Decorative background blur */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-neon-purple/10 blur-[80px] rounded-full" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-coral/10 blur-[80px] rounded-full" />
          </motion.div>

          <button 
            onClick={() => setActiveMilestone(null)}
            className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors"
          >
            <X size={32} />
          </button>
        </div>
      )}
    </AnimatePresence>
  );
}
