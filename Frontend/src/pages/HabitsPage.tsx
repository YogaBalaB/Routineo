import { useState, useEffect, FormEvent } from "react";
import {
  Flame,
  Plus,
  Trash2,
  TrendingUp,
  RotateCcw,
  Calendar,
  CheckCircle2,
  Book,
  Heart,
  Dumbbell,
  Brain,
  Coffee,
  Moon,
  Wind,
  Target,
  Trophy,
  AlertCircle,
  CheckSquare,
  Square,
  MinusSquare
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import toast from "react-hot-toast";
import { Habit, EarnedBadge } from "../types";
import { API_URL } from "../lib/api";
import { cn } from "../lib/utils";
import { badgeEmitter } from "../components/BadgeEarnedPopup";
import PrimaryButton from "../components/PrimaryButton";
import BulkToolbar from "../components/BulkToolbar";
import ConfirmModal from "../components/ConfirmModal";

const ICONS = {
  Flame: Flame,
  Book: Book,
  Heart: Heart,
  Dumbbell: Dumbbell,
  Brain: Brain,
  Coffee: Coffee,
  Moon: Moon,
  Wind: Wind,
  Target: Target,
};

const CATEGORIES = [
  { name: "Health", color: "text-red-500 bg-red-50" },
  { name: "Study", color: "text-blue-500 bg-blue-50" },
  { name: "Fitness", color: "text-green-500 bg-green-50" },
  { name: "Wellbeing", color: "text-purple-500 bg-purple-50" },
  { name: "General", color: "text-slate-500 bg-slate-50" },
] as const;

// ─── Enhanced Delete Modal ────────────────────────────────────────────────────
interface DeleteModalProps {
  isOpen: boolean;
  isBulk: boolean;
  count?: number;
  habitTitle?: string;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteModal({ isOpen, isBulk, count, habitTitle, isLoading, onClose, onConfirm }: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        // Backdrop
        <motion.div
          key="delete-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          onClick={onClose}
        >
          {/* Modal Panel */}
          <motion.div
            key="delete-panel"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            {/* Red danger header strip */}
            <div className="bg-gradient-to-r from-red-500 to-rose-600 px-6 pt-6 pb-8 text-white">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                <Trash2 size={22} />
              </div>
              <h2 className="text-xl font-bold tracking-tight">
                {isBulk ? `Delete ${count} habits?` : "Delete this habit?"}
              </h2>
              <p className="text-red-100 text-sm mt-1">
                {isBulk
                  ? `You're about to permanently delete ${count} habits and all their streak data.`
                  : `You're about to permanently delete "${habitTitle}".`}
              </p>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              {/* Warning notice */}
              <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl p-4">
                <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700 leading-relaxed">
                  This action <strong>cannot be undone</strong>. All check-in history,
                  streaks, and progress will be permanently erased.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 rounded-2xl border-2 border-slate-100 text-slate-600 font-semibold text-sm hover:border-slate-200 hover:bg-slate-50 transition-all disabled:opacity-50"
                >
                  Keep it
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold text-sm hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-red-200 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Trash2 size={15} />
                  )}
                  {isLoading ? "Deleting…" : isBulk ? `Delete ${count} habits` : "Yes, delete"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);

  const [lastCheckedHabitId, setLastCheckedHabitId] = useState<string | null>(null);
  const [celebratingId, setCelebratingId] = useState<string | null>(null);
  const [selectedHabitIds, setSelectedHabitIds] = useState<string[]>([]);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    habitId?: string;
    habitTitle?: string;
    isBulk: boolean;
  }>({ isOpen: false, isBulk: false });

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formIcon, setFormIcon] = useState<keyof typeof ICONS>("Flame");
  const [formCategory, setFormCategory] = useState<typeof CATEGORIES[number]["name"]>("General");
  const [formGoal, setFormGoal] = useState<7 | 10 | 30>(7);

  const fetchHabits = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/habits`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (res.ok) setHabits(await res.json());
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const resetForm = () => {
    setFormTitle("");
    setFormIcon("Flame");
    setFormCategory("General");
    setFormGoal(7);
  };

  const addHabit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/habits`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: formTitle,
          icon: formIcon,
          category: formCategory,
          goalDays: formGoal
        })
      });

      if (res.ok) {
        resetForm();
        setIsAdding(false);
        fetchHabits();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // FIX 3: updateHabit no longer requires a FormEvent — works from both
  // form onSubmit and the inline Save button's onClick.
  const updateHabit = async (e?: FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!editingHabitId || !formTitle.trim()) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/habits/${editingHabitId}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: formTitle,
          icon: formIcon,
          category: formCategory,
          goalDays: formGoal
        })
      });

      if (res.ok) {
        const resJson = await res.json();
        setEditingHabitId(null);
        resetForm();
        fetchHabits();
        if (resJson.newBadges && resJson.newBadges.length > 0) {
          resJson.newBadges.forEach((id: string) => badgeEmitter.emit(id));
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // FIX 2: open enhanced delete modal with title for context
  const deleteHabit = (id: string, title?: string) => {
    setDeleteModal({ isOpen: true, habitId: id, habitTitle: title, isBulk: false });
  };

  const confirmDelete = async () => {
    const token = localStorage.getItem("token");
    setIsLoading(true);

    try {
      if (deleteModal.isBulk) {
        const res = await fetch(`${API_URL}/api/habits/bulk`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ ids: selectedHabitIds })
        });

        if (res.ok) {
          const count = selectedHabitIds.length;
          setHabits(prev => prev.filter(h => !selectedHabitIds.includes(h.id)));
          setSelectedHabitIds([]);
          toast.success(`${count} habits deleted successfully`);
        }
      } else if (deleteModal.habitId) {
        const id = deleteModal.habitId;
        const res = await fetch(`${API_URL}/api/habits/${id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.ok) {
          setHabits(prev => prev.filter(h => h.id !== id));
          setSelectedHabitIds(prev => prev.filter(hid => hid !== id));
          toast.success("Habit deleted successfully");
          if (editingHabitId === id) setEditingHabitId(null);
        }
      }
    } catch (err) {
      toast.error("Failed to delete habits");
    } finally {
      setIsLoading(false);
      setDeleteModal({ isOpen: false, isBulk: false });
    }
  };

  const handleSelectHabit = (id: string) => {
    setSelectedHabitIds(prev =>
      prev.includes(id) ? prev.filter(hid => hid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedHabitIds.length === habits.length) {
      setSelectedHabitIds([]);
    } else {
      setSelectedHabitIds(habits.map(h => h.id));
    }
  };

  const resetStreak = async (id: string) => {
    if (!confirm("Start streak over from day 1?")) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/habits/${id}/reset-streak`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (res.ok) fetchHabits();
  };

  const checkIn = async (id: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/habits/${id}/checkin`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (res.ok) {
      const resJson = await res.json();
      setCelebratingId(id);
      setLastCheckedHabitId(id);
      fetchHabits();

      if (resJson.newBadges && resJson.newBadges.length > 0) {
        resJson.newBadges.forEach((id: string) => badgeEmitter.emit(id));
      }

      setTimeout(() => setCelebratingId(null), 2000);
      setTimeout(() => setLastCheckedHabitId(prev => prev === id ? null : prev), 8000);
    }
  };

  const undoCheckIn = async (id: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/habits/${id}/undo-checkin`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (res.ok) {
      setLastCheckedHabitId(null);
      fetchHabits();
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 relative">
      <BulkToolbar
        selectedCount={selectedHabitIds.length}
        onDelete={() => setDeleteModal({ isOpen: true, isBulk: true })}
        onClear={() => setSelectedHabitIds([])}
        itemName="habit"
      />

      {/* FIX 2: Replace ConfirmModal with our new DeleteModal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        isBulk={deleteModal.isBulk}
        count={selectedHabitIds.length}
        habitTitle={deleteModal.habitTitle}
        isLoading={isLoading}
        onClose={() => setDeleteModal({ isOpen: false, isBulk: false })}
        onConfirm={confirmDelete}
      />

      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Habits</h1>
          <p className="text-sm md:text-base text-slate-500">Consistency is key. Build long-term results.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-neon-purple text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-lg shadow-neon-purple/20 w-full sm:w-auto"
        >
          <Plus size={20} />
          <span>New Habit</span>
        </button>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-dark-navy p-5 md:p-6 rounded-[2rem] md:rounded-[2.5rem] text-white flex items-center justify-between">
          <div>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Total Streaks</p>
            <p className="text-2xl md:text-4xl font-display font-bold">{habits.reduce((acc, h) => acc + h.streak, 0)}</p>
          </div>
          <TrendingUp className="text-neon-purple w-10 h-10 md:w-12 md:h-12" />
        </div>
        <div className="bg-white p-5 md:p-6 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Active Habits</p>
            <p className="text-2xl md:text-4xl font-display font-bold text-dark-navy">{habits.length}</p>
          </div>
          <Flame className="text-coral w-10 h-10 md:w-12 md:h-12" />
        </div>
      </div>

      <div className="flex items-center justify-between px-2">
        <button
          onClick={handleSelectAll}
          className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-slate-100 transition-all hover:shadow-md"
          title="Select All"
        >
          {selectedHabitIds.length === 0 ? (
            <Square size={16} className="text-slate-300" />
          ) : selectedHabitIds.length === habits.length ? (
            <CheckSquare size={16} className="text-neon-purple" />
          ) : (
            <MinusSquare size={16} className="text-neon-purple" />
          )}
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select All Habits</span>
        </button>
      </div>

      {/* Habit Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {isAdding && (
            <motion.form
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onSubmit={addHabit}
              className="md:col-span-2 bg-white p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border-2 border-neon-purple shadow-xl shadow-neon-purple/5 space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Habit Name</label>
                    <input
                      autoFocus
                      placeholder="e.g. Read 10 pages"
                      className="w-full text-xl md:text-2xl font-display font-bold border-none outline-none placeholder:text-slate-200 bg-transparent"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Select Category</label>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat.name}
                          type="button"
                          onClick={() => setFormCategory(cat.name)}
                          className={cn(
                            "px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                            formCategory === cat.name ? cat.color + " ring-2 ring-current" : "bg-slate-50 text-slate-400"
                          )}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="hidden md:block">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Streak Goal</label>
                    <div className="flex gap-2">
                      {[7, 10, 30].map(goal => (
                        <button
                          key={goal}
                          type="button"
                          onClick={() => setFormGoal(goal as any)}
                          className={cn(
                            "flex-1 py-3 rounded-xl text-sm font-bold transition-all border",
                            formGoal === goal ? "bg-neon-purple border-neon-purple text-white shadow-lg shadow-neon-purple/20" : "bg-white border-slate-100 text-slate-400"
                          )}
                        >
                          {goal} Days
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Select Icon</label>
                    <div className="grid grid-cols-5 gap-3">
                      {Object.entries(ICONS).map(([name, Icon]) => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => setFormIcon(name as any)}
                          className={cn(
                            "aspect-square rounded-xl md:rounded-2xl flex items-center justify-center transition-all border",
                            formIcon === name ? "bg-neon-purple border-neon-purple text-white" : "bg-slate-50 border-transparent text-slate-300 hover:border-slate-200"
                          )}
                        >
                          <Icon size={18} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="md:hidden">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Streak Goal</label>
                    <div className="flex gap-2">
                      {[7, 10, 30].map(goal => (
                        <button
                          key={goal}
                          type="button"
                          onClick={() => setFormGoal(goal as any)}
                          className={cn(
                            "flex-1 py-3 rounded-xl text-sm font-bold transition-all border",
                            formGoal === goal ? "bg-neon-purple border-neon-purple text-white shadow-lg shadow-neon-purple/20" : "bg-white border-slate-100 text-slate-400"
                          )}
                        >
                          {goal} Days
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                    <PrimaryButton
                      type="submit"
                      className="w-full sm:flex-1 order-1 sm:order-2"
                      label="Create Habit"
                      isLoading={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="w-full sm:w-auto px-8 py-3 rounded-lg border border-[#D1D5DB] text-[#6B7280] font-medium hover:border-[#9CA3AF] transition-colors order-2 sm:order-1 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </motion.form>
          )}

          {habits.map((habit) => {
            const isChecked = habit.history.includes(today);
            const isEditing = editingHabitId === habit.id;
            const IconComponent = ICONS[habit.icon as keyof typeof ICONS] || Flame;
            const categoryInfo = CATEGORIES.find(c => c.name === habit.category) || CATEGORIES[4];
            const progress = Math.min((habit.streak / (habit.goalDays || 7)) * 100, 100);

            const last7Days = Array.from({ length: 7 }, (_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - (6 - i));
              const dateStr = d.toISOString().split('T')[0];
              return {
                day: d.toLocaleDateString(undefined, { weekday: 'narrow' }),
                date: dateStr,
                isActive: habit.history.includes(dateStr),
                isToday: dateStr === today
              };
            });

            return (
              <motion.div
                key={habit.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "group bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between min-h-[360px] hover:shadow-xl hover:shadow-slate-200/50 transition-all relative overflow-hidden",
                  isEditing && "border-neon-purple ring-4 ring-neon-purple/5"
                )}
              >
                {/* Action buttons — top-right, no category badge here anymore */}
                {!isEditing && (
                  <div className="absolute top-4 right-4 opacity-40 group-hover:opacity-100 transition-all duration-200 flex items-center gap-2 z-50">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleSelectHabit(habit.id); }}
                      className={cn(
                        "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0",
                        selectedHabitIds.includes(habit.id)
                          ? "bg-[#7C3AED] border-[#7C3AED] text-white shadow-lg shadow-purple-200"
                          : "bg-white border-slate-100 text-transparent hover:border-[#7C3AED]/30"
                      )}
                    >
                      <CheckCircle2 size={14} />
                    </button>

                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingHabitId(habit.id);
                          setFormTitle(habit.title);
                          setFormIcon(habit.icon as any);
                          setFormCategory(habit.category as any);
                          setFormGoal(habit.goalDays as any);
                        }}
                        className="p-2 bg-white shadow-lg border border-slate-100 rounded-xl text-slate-400 hover:text-neon-purple hover:scale-110 transition-all cursor-pointer"
                        title="Edit Habit"
                      >
                        <Plus size={16} className="rotate-45" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          resetStreak(habit.id);
                        }}
                        className="p-2 bg-white shadow-lg border border-slate-100 rounded-xl text-slate-400 hover:text-amber-500 hover:scale-110 transition-all cursor-pointer"
                        title="Reset Streak"
                      >
                        <RotateCcw size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          // FIX 2: pass habit title for context in the delete modal
                          deleteHabit(habit.id, habit.title);
                        }}
                        className="p-2 bg-white shadow-lg border border-slate-100 rounded-xl text-slate-400 hover:text-red-500 hover:scale-110 transition-all cursor-pointer"
                        title="Delete Habit"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Header Information */}
                <div className="relative z-10">
                  {/* FIX 1: Icon and category badge separated — icon top-left, category badge below title */}
                  <div className="flex items-start mb-4">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg",
                      isChecked ? "bg-neon-purple text-white shadow-neon-purple/20" : "bg-slate-50 text-slate-400 border border-slate-100"
                    )}>
                      <motion.div animate={celebratingId === habit.id ? { scale: [1, 1.4, 1], rotate: [0, 10, -10, 0] } : {}}>
                        <IconComponent size={28} fill={isChecked ? "currentColor" : "none"} />
                      </motion.div>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="bg-slate-50 p-4 rounded-3xl border border-neon-purple/20 space-y-4">
                      <input
                        autoFocus
                        className="w-full text-lg font-display font-bold bg-transparent border-none outline-none"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                      />

                      {/* Category selector inside edit panel */}
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Category</p>
                        <div className="flex flex-wrap gap-1.5">
                          {CATEGORIES.map(cat => (
                            <button
                              key={cat.name}
                              type="button"
                              onClick={() => setFormCategory(cat.name)}
                              className={cn(
                                "px-3 py-1 rounded-lg text-xs font-bold transition-all",
                                formCategory === cat.name ? cat.color + " ring-2 ring-current" : "bg-white text-slate-400 border border-slate-100"
                              )}
                            >
                              {cat.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 items-center">
                        <div className="flex bg-white p-1 rounded-xl border border-slate-100 shadow-inner">
                          {[7, 10, 30].map(g => (
                            <button
                              key={g}
                              type="button"
                              onClick={() => setFormGoal(g as any)}
                              className={cn(
                                "px-3 py-1 rounded-lg text-xs font-bold transition-all",
                                formGoal === g ? "bg-neon-purple text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
                              )}
                            >
                              {g}d
                            </button>
                          ))}
                        </div>
                        <div className="flex-1" />
                        {/* FIX 3: onClick calls updateHabit directly — no form wrapping needed */}
                        <PrimaryButton
                          className="px-4 py-2 text-xs rounded-xl"
                          label="Save"
                          isLoading={isLoading}
                          onClick={(e: React.MouseEvent) => updateHabit(e)}
                        />
                        <button
                          type="button"
                          onClick={() => { setEditingHabitId(null); resetForm(); }}
                          className="ml-1 px-4 py-2 rounded-xl border border-[#D1D5DB] text-[#6B7280] font-medium hover:border-[#9CA3AF] transition-colors text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteHabit(habit.id, habit.title)}
                          className="ml-1 text-red-500 font-bold text-xs hover:text-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <h3 className="text-2xl font-display font-bold text-dark-navy mt-2 mb-1 tracking-tight line-clamp-1">
                        {habit.title}
                      </h3>

                      {/* FIX 1: Category badge now sits directly below the title — fully visible */}
                      <div className={cn("inline-flex self-start px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-widest shadow-sm mb-4", categoryInfo.color)}>
                        {habit.category}
                      </div>

                      {/* Consistency Pulse (Last 7 Days) */}
                      <div className="flex items-center gap-1.5 mb-6">
                        {last7Days.map((day, idx) => (
                          <div key={idx} className="flex flex-col items-center gap-1">
                            <div
                              className={cn(
                                "w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all",
                                day.isActive
                                  ? "bg-neon-purple text-white shadow-sm"
                                  : day.isToday
                                    ? "border-2 border-dashed border-neon-purple/30 text-neon-purple"
                                    : "bg-slate-50 text-slate-300 border border-slate-100"
                              )}
                              title={day.date}
                            >
                              {day.day}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-6 md:gap-8">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current</p>
                          <div className="flex items-center gap-1.5">
                            <p className="text-2xl font-display font-bold text-neon-purple leading-none">{habit.streak}</p>
                            <Flame size={18} className="text-coral" fill="currentColor" />
                          </div>
                        </div>
                        <div className="w-px h-8 bg-slate-100" />
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Best</p>
                          <div className="flex items-center gap-1.5">
                            <p className="text-2xl font-display font-bold text-dark-navy leading-none">{habit.longestStreak || habit.streak}</p>
                            <Trophy size={18} className="text-amber-400 opacity-50" />
                          </div>
                        </div>
                        <div className="w-px h-8 bg-slate-100" />
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Missed</p>
                          <div className="flex items-center gap-1.5">
                            <p className="text-2xl font-display font-bold text-red-500 leading-none">{habit.missedDays || 0}</p>
                            <AlertCircle size={16} className="text-red-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress Bar & Actions */}
                <div className="relative z-10">
                  <div className="my-6 space-y-2.5">
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                      <span className="text-slate-400">Goal: {habit.goalDays || 7} Days</span>
                      <span className="text-neon-purple font-display">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50 p-0.5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className={cn(
                          "h-full rounded-full shadow-sm",
                          progress >= 100 ? "bg-green-500" : "bg-gradient-to-r from-neon-purple to-neon-blue"
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex items-end justify-between gap-4">
                    <div className="flex gap-2 mb-1">
                      <div className="flex items-center gap-1.5 bg-slate-50 text-slate-400 px-2.5 py-1.5 rounded-xl border border-slate-100" title="Total checkins">
                        <Calendar size={14} />
                        <span className="text-xs font-bold">{habit.history.length} Total</span>
                      </div>
                    </div>

                    {!isEditing && (
                      <div className="flex flex-col items-end gap-2">
                        <AnimatePresence mode="wait">
                          {lastCheckedHabitId === habit.id ? (
                            <motion.button
                              key="undo-btn"
                              initial={{ opacity: 0, scale: 0.8, y: 10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                undoCheckIn(habit.id);
                              }}
                              className="text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase tracking-widest flex items-center gap-1 mb-1 transition-colors"
                            >
                              <RotateCcw size={10} />
                              Undo
                            </motion.button>
                          ) : null}
                        </AnimatePresence>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            checkIn(habit.id);
                          }}
                          disabled={isChecked}
                          className={cn(
                            "px-8 py-3.5 rounded-2xl font-bold flex items-center gap-3 transition-all group/btn shadow-lg active:scale-95 relative overflow-hidden",
                            isChecked
                              ? "bg-green-50 text-green-600 shadow-none pointer-events-none"
                              : "bg-dark-navy text-white hover:bg-slate-800 hover:scale-[1.02] shadow-dark-navy/20"
                          )}
                        >
                          {celebratingId === habit.id && (
                            <motion.div
                              initial={{ scale: 0.5, opacity: 0 }}
                              animate={{ scale: 2.5, opacity: [0, 1, 0] }}
                              className="absolute inset-0 bg-neon-purple/30 rounded-full"
                            />
                          )}
                          {isChecked ? <CheckCircle2 size={18} /> : <Target size={18} className="group-hover/btn:rotate-12 transition-transform" />}
                          <span className="text-xs">{isChecked ? "Done" : "Check-in"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {habits.length === 0 && !isAdding && (
        <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Flame className="text-slate-200 w-10 h-10" />
          </div>
          <h3 className="text-xl font-display font-bold text-slate-400">No habits yet</h3>
          <p className="text-slate-400 mt-2">Successful students are built on consistent habits.</p>
          <button
            onClick={() => setIsAdding(true)}
            className="mt-6 text-neon-purple font-bold hover:underline"
          >
            + Create your first habit
          </button>
        </div>
      )}
    </div>
  );
}