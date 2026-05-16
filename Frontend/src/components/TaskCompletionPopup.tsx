import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, X, Star, Zap, Trophy } from "lucide-react";
import { Task } from "../types";
import { cn } from "../lib/utils";

const CATEGORIES = [
  { name: "Study", icon: "📚" },
  { name: "Health", icon: "💪" },
  { name: "Personal", icon: "🌙" },
  { name: "General", icon: "📝" },
  { name: "Placement Prep", icon: "💼" },
  { name: "Design Practice", icon: "🎨" },
] as const;

const PRIORITY_STYLES = {
  low: { color: "text-emerald-500", bg: "bg-emerald-50", label: "Low Priority" },
  medium: { color: "text-amber-500", bg: "bg-amber-50", label: "Medium Priority" },
  high: { color: "text-rose-500", bg: "bg-rose-50", label: "High Priority" },
};

interface TaskCompletionPopupProps {
  task: Task | null;
  onClose: () => void;
}

export default function TaskCompletionPopup({ task, onClose }: TaskCompletionPopupProps) {
  if (!task) return null;

  const completedSubtasks = task.subtasks.filter(s => s.completed).length;
  const totalSubtasks = task.subtasks.length;
  const categoryInfo = CATEGORIES.find(c => c.name === task.category);
  const priorityStyle = PRIORITY_STYLES[task.priority];

  return (
    <AnimatePresence>
      {task && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 40 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-[2.5rem] shadow-2xl shadow-black/20 w-full max-w-md overflow-hidden"
          >
            {/* Top gradient banner */}
            <div className="relative bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] px-8 pt-10 pb-16 text-white text-center overflow-hidden">
              {/* Decorative blobs */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl translate-x-1/2 translate-y-1/2" />

              {/* Floating stars */}
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-yellow-300 opacity-70"
                  style={{
                    top: `${10 + Math.random() * 70}%`,
                    left: `${5 + i * 20}%`,
                    fontSize: `${10 + Math.random() * 10}px`,
                  }}
                  animate={{ y: [0, -8, 0], rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2 + i * 0.4, repeat: Infinity, delay: i * 0.2 }}
                >
                  ★
                </motion.div>
              ))}

              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
                className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 border border-white/30 shadow-xl"
              >
                <Trophy className="w-10 h-10 text-yellow-300 drop-shadow-lg" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold tracking-tight"
              >
                Task Completed! 🎉
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-sm text-white/70 mt-1 font-medium"
              >
                You crushed it. Keep the momentum going!
              </motion.p>
            </div>

            {/* Task card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mx-6 -mt-8 bg-white rounded-[1.5rem] border border-slate-100 shadow-lg shadow-slate-200/60 p-5 relative z-10"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[#111827] text-base leading-snug line-clamp-2">
                    {task.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {categoryInfo && (
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-50 text-slate-500 px-2 py-1 rounded-lg border border-slate-100">
                        {categoryInfo.icon} {task.category}
                      </span>
                    )}
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg",
                      priorityStyle.bg, priorityStyle.color
                    )}>
                      {priorityStyle.label}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats */}
            {totalSubtasks > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="mx-6 mt-4 grid grid-cols-2 gap-3"
              >
                <div className="bg-purple-50 rounded-2xl p-4 text-center border border-purple-100">
                  <p className="text-2xl font-bold text-[#7C3AED]">{completedSubtasks}</p>
                  <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mt-0.5">Subtasks Done</p>
                </div>
                <div className="bg-emerald-50 rounded-2xl p-4 text-center border border-emerald-100">
                  <p className="text-2xl font-bold text-emerald-500">100%</p>
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-0.5">Completed</p>
                </div>
              </motion.div>
            )}

            {/* Motivational quote */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="mx-6 mt-4 flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3"
            >
              <Zap className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="text-xs font-semibold text-amber-700 leading-snug">
                Every completed task is a step closer to your goal. Great work!
              </p>
            </motion.div>

            {/* Close button */}
            <div className="p-6 mt-2">
              <button
                onClick={onClose}
                className="w-full bg-[#7C3AED] text-white py-4 rounded-2xl font-bold text-sm hover:brightness-110 transition-all shadow-lg shadow-purple-200 active:scale-95"
              >
                Keep Going 🚀
              </button>
            </div>

            {/* Top-right close icon */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all"
            >
              <X size={14} />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}