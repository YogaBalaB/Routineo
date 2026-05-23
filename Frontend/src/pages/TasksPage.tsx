import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { MouseEvent } from "react";
import {
  Plus,
  CheckCircle2,
  Circle,
  Calendar,
  Flag,
  Tag,
  Trash2,
  Search,
  X,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Task } from "../types";
import { cn } from "../lib/utils";
import { API_URL } from "../lib/api";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import TaskCompletionPopup from "../components/TaskCompletionPopup";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { name: "Study",           color: "bg-blue-50 text-blue-600 border-blue-100" },
  { name: "Health",          color: "bg-green-50 text-green-600 border-green-100" },
  { name: "Personal",        color: "bg-purple-50 text-purple-600 border-purple-100" },
  { name: "General",         color: "bg-slate-50 text-slate-600 border-slate-100" },
  { name: "Placement Prep",  color: "bg-amber-50 text-amber-600 border-amber-100" },
  { name: "Design Practice", color: "bg-rose-50 text-rose-600 border-rose-100" },
] as const;

const PRIORITIES = [
  { level: "low",    color: "bg-emerald-50 text-emerald-600 border-emerald-100", dot: "bg-emerald-500" },
  { level: "medium", color: "bg-amber-50 text-amber-600 border-amber-100",       dot: "bg-amber-500"   },
  { level: "high",   color: "bg-rose-50 text-rose-600 border-rose-100",          dot: "bg-rose-500"    },
] as const;

// ─── Date Helpers ─────────────────────────────────────────────────────────────

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseLocalDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(dateStr.endsWith("Z") || dateStr.includes("+") ? dateStr : dateStr + "Z");
}

function formatDate(
  dateStr: string | null | undefined,
  opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }
): string {
  const d = parseLocalDate(dateStr);
  if (!d || isNaN(d.getTime())) return "No date";
  return d.toLocaleDateString(undefined, opts);
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface DraftSubtask {
  id: string;
  title: string;
  dueDate: string;
}

interface NewTaskForm {
  title: string;
  priority: "low" | "medium" | "high";
  category: string;
  dueDate: string;
  notes: string;
}

const defaultForm = (): NewTaskForm => ({
  title: "",
  priority: "medium",
  category: "General",
  dueDate: "",
  notes: "",
});

// ─── Component ────────────────────────────────────────────────────────────────

export default function TasksPage() {
  const navigate = useNavigate();

  const [tasks,          setTasks]          = useState<Task[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [showModal,      setShowModal]      = useState(false);
  const [creating,       setCreating]       = useState(false);
  const [form,           setForm]           = useState<NewTaskForm>(defaultForm());

  const [draftSubtasks, setDraftSubtasks] = useState<DraftSubtask[]>([]);
  const [draftStTitle,  setDraftStTitle]  = useState("");
  const [draftStDate,   setDraftStDate]   = useState("");

  const [search,         setSearch]         = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus,   setFilterStatus]   = useState<"all" | "active" | "done">("all");
  const [completedTask,  setCompletedTask]  = useState<Task | null>(null);

  // ─── Fetch ──────────────────────────────────────────────────────────────────

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) { navigate("/login"); return; }

      const res = await fetch(`${API_URL}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 401) { navigate("/login"); return; }
        throw new Error(`Failed: ${res.status}`);
      }
      const data = await res.json();
      setTasks(Array.isArray(data) ? data.map((t: Task) => ({ ...t, subtasks: t.subtasks || [] })) : []);
    } catch (err) {
      console.error("fetchTasks:", err);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  // ─── Draft subtask helpers ───────────────────────────────────────────────────

  const addDraftSubtask = () => {
    if (!draftStTitle.trim()) return;
    setDraftSubtasks((prev) => [
      ...prev,
      { id: `st-${Date.now()}`, title: draftStTitle.trim(), dueDate: draftStDate },
    ]);
    setDraftStTitle("");
    setDraftStDate("");
  };

  const removeDraftSubtask = (id: string) =>
    setDraftSubtasks((prev) => prev.filter((s) => s.id !== id));

  const resetModal = () => {
    setForm(defaultForm());
    setDraftSubtasks([]);
    setDraftStTitle("");
    setDraftStDate("");
    setShowModal(false);
  };

  // ─── Create Task ────────────────────────────────────────────────────────────

  const createTask = async () => {
    if (!form.title.trim()) { toast.error("Task title is required"); return; }
    try {
      setCreating(true);
      const token = localStorage.getItem("token");

      // Backend (FastAPI) expects snake_case field names
      const subtasksPayload = draftSubtasks.map((s) => ({
        id:           s.id,
        title:        s.title,
        completed:    false,
        completed_at: null,
        due_date:     s.dueDate || null,
        created_at:   new Date().toISOString(),
      }));

      const payload = {
        title:     form.title.trim(),
        priority:  form.priority,
        category:  form.category,
        notes:     form.notes || "",
        completed: false,
        subtasks:  subtasksPayload,
        due_date:  form.dueDate || todayISO(), // required by backend, fallback to today
      };

      const res = await fetch(`${API_URL}/api/tasks`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        console.error("Create error:", JSON.stringify(errorBody, null, 2));
        throw new Error(`Create failed: ${res.status}`);
      }

      const newTask = await res.json();
      toast.success("Task created");
      resetModal();
      if (newTask?.id) navigate(`/tasks/${newTask.id}`);
      else await fetchTasks();
    } catch (err) {
      console.error("createTask:", err);
      toast.error("Failed to create task");
    } finally {
      setCreating(false);
    }
  };

  // ─── Toggle / Delete ────────────────────────────────────────────────────────

  const toggleComplete = async (task: Task, e: MouseEvent) => {
    e.stopPropagation();
    // Block completion if there are unfinished subtasks
    if (!task.completed && task.subtasks && task.subtasks.length > 0) {
      const remaining = task.subtasks.filter((st) => !st.completed).length;
      if (remaining > 0) {
        toast.error(`Finish all ${remaining} subtask${remaining > 1 ? "s" : ""} first!`);
        return;
      }
    }
    const completing = !task.completed;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ completed: completing }),
      });
      if (!res.ok) throw new Error("Update failed");
      if (completing) {
        confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 }, colors: ["#8B5CF6", "#3B82F6", "#10B981", "#F59E0B"] });
        setCompletedTask({ ...task, completed: true });
      }
      await fetchTasks();
    } catch { toast.error("Failed to update task"); }
  };

  const deleteTask = async (taskId: string, e: MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this task?")) return;
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      toast.success("Task deleted");
    } catch { toast.error("Failed to delete task"); }
  };

  const openTask = (task: Task) => {
    if (!task?.id) return;
    navigate(`/tasks/${task.id}`);
  };

  // ─── Filter ─────────────────────────────────────────────────────────────────

  const filtered = tasks.filter((t) => {
    const matchSearch   = t.title.toLowerCase().includes(search.toLowerCase());
    const matchPriority = filterPriority === "all" || t.priority === filterPriority;
    const matchCategory = filterCategory === "all" || t.category === filterCategory;
    const matchStatus   =
      filterStatus === "all"    ? true :
      filterStatus === "active" ? !t.completed : t.completed;
    return matchSearch && matchPriority && matchCategory && matchStatus;
  });

  const activeCount    = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  // ─── Loading ────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neon-purple" />
    </div>
  );

  // ─── UI ─────────────────────────────────────────────────────────────────────

  return (
    <div className="w-full mx-auto space-y-6 pb-24 md:pb-20 px-3 md:px-8 xl:px-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <TaskCompletionPopup task={completedTask} onClose={() => setCompletedTask(null)} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-display font-bold text-dark-navy">Tasks</h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            {activeCount} active · {completedCount} completed
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-dark-navy text-white px-6 py-3 rounded-2xl font-bold hover:brightness-110 shadow-lg transition-all text-sm w-fit"
        >
          <Plus size={18} /> New Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search tasks..."
            className="w-full bg-white border border-slate-100 pl-10 pr-4 py-3 rounded-2xl text-sm outline-none focus:border-neon-purple transition-all shadow-sm"
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="bg-white border border-slate-100 px-4 py-3 rounded-2xl text-xs font-bold text-slate-600 outline-none shadow-sm"
          value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as "all" | "active" | "done")}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="done">Completed</option>
        </select>
        <select
          className="bg-white border border-slate-100 px-4 py-3 rounded-2xl text-xs font-bold text-slate-600 outline-none shadow-sm"
          value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
          <option value="all">All Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select
          className="bg-white border border-slate-100 px-4 py-3 rounded-2xl text-xs font-bold text-slate-600 outline-none shadow-sm"
          value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
        </select>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {filtered.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/30">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No tasks found</p>
              <button onClick={() => setShowModal(true)} className="mt-4 text-neon-purple font-bold text-sm">
                Create your first task →
              </button>
            </div>
          ) : filtered.map((task, i) => {
            const cat           = CATEGORIES.find((c) => c.name === task.category);
            const pri           = PRIORITIES.find((p) => p.level === task.priority);
            const subtasksDone  = task.subtasks?.filter((s) => s.completed).length ?? 0;
            const subtasksTotal = task.subtasks?.length ?? 0;
            const hasUnfinishedSubtasks = !task.completed && subtasksTotal > 0 && subtasksDone < subtasksTotal;

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }} transition={{ delay: i * 0.03 }}
                onClick={() => openTask(task)}
                className={cn(
                  "group flex items-center gap-4 p-5 bg-white rounded-[2rem] border cursor-pointer transition-all hover:shadow-lg hover:shadow-slate-200/60",
                  task.completed ? "border-slate-100 opacity-60" : "border-slate-100 hover:border-neon-purple/20"
                )}
              >
                {/* Completion button with lock when subtasks pending */}
                <div className="relative shrink-0 group/check">
                  <button onClick={(e) => toggleComplete(task, e)}
                    className={cn("w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all",
                      task.completed
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : hasUnfinishedSubtasks
                          ? "bg-amber-50 border-amber-200 text-amber-400 cursor-not-allowed"
                          : "border-slate-200 hover:border-neon-purple hover:text-neon-purple text-slate-300")}>
                    {task.completed
                      ? <CheckCircle2 size={16} />
                      : hasUnfinishedSubtasks
                        ? <AlertCircle size={16} />
                        : <Circle size={16} />}
                  </button>
                  {/* Tooltip */}
                  {hasUnfinishedSubtasks && (
                    <div className="absolute top-[calc(100%+6px)] left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-[#111827] text-white text-[10px] rounded-lg whitespace-nowrap opacity-0 group-hover/check:opacity-100 transition-opacity pointer-events-none z-20 font-semibold shadow-xl">
                      {subtasksTotal - subtasksDone} subtask{subtasksTotal - subtasksDone > 1 ? "s" : ""} remaining
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <p className={cn("font-bold text-sm md:text-base truncate", task.completed ? "text-slate-400 line-through" : "text-dark-navy")}>
                    {task.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {cat && <span className={cn("px-2.5 py-1 rounded-xl text-[10px] font-bold border", cat.color)}>{cat.name}</span>}
                    {pri && (
                      <span className={cn("px-2.5 py-1 rounded-xl text-[10px] font-bold border flex items-center gap-1 uppercase", pri.color)}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", pri.dot)} />{pri.level}
                      </span>
                    )}
                    {task.dueDate && (
                      <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold border border-slate-100 bg-slate-50 text-slate-500 flex items-center gap-1">
                        <Calendar size={10} className="text-neon-purple" />
                        {formatDate(task.dueDate)}
                      </span>
                    )}
                    {subtasksTotal > 0 && (
                      <span className={cn("text-[10px] font-bold",
                        hasUnfinishedSubtasks ? "text-amber-500" : "text-slate-400")}>
                        {subtasksDone}/{subtasksTotal} subtasks
                      </span>
                    )}
                  </div>
                </div>

                {/* Delete — always visible at low opacity, full on hover */}
                <button onClick={(e) => deleteTask(task.id, e)}
                  className="shrink-0 opacity-30 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                  <Trash2 size={15} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* ── New Task Modal ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={resetModal} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[600px] max-h-[90vh] overflow-y-auto bg-white rounded-[2.5rem] shadow-2xl shadow-slate-300/50 p-8 z-50 space-y-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-xl text-dark-navy">New Task</h2>
                <button onClick={resetModal} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                  <X size={18} />
                </button>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Task Title *</label>
                <input autoFocus placeholder="What needs to be done?"
                  className="w-full bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl text-sm font-medium outline-none focus:border-neon-purple transition-all"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && createTask()} />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Tag size={11} /> Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button key={c.name} onClick={() => setForm((f) => ({ ...f, category: c.name }))}
                      className={cn("px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border",
                        form.category === c.name ? "bg-dark-navy text-white border-dark-navy" : "bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100")}>
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority & Due Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Flag size={11} /> Priority
                  </label>
                  <div className="flex bg-slate-100/60 p-1 rounded-xl border border-slate-200">
                    {PRIORITIES.map((p) => (
                      <button key={p.level} onClick={() => setForm((f) => ({ ...f, priority: p.level }))}
                        className={cn("flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                          form.priority === p.level ? p.color : "text-slate-400 hover:text-slate-600")}>
                        {p.level}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={11} /> Due Date
                  </label>
                  <input type="date"
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold text-dark-navy outline-none focus:border-neon-purple transition-all"
                    value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Notes (optional)</label>
                <textarea placeholder="Any details, links, or context..."
                  className="w-full bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl text-sm font-medium outline-none focus:border-neon-purple transition-all min-h-[80px] resize-none"
                  value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
              </div>

              {/* Subtasks */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Subtasks (optional)
                </label>
                <div className="flex gap-2">
                  <input
                    placeholder="Subtask title..."
                    className="flex-1 bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl text-sm font-medium outline-none focus:border-neon-purple transition-all"
                    value={draftStTitle}
                    onChange={(e) => setDraftStTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addDraftSubtask()}
                  />
                  <input
                    type="date"
                    title="Subtask due date"
                    className="bg-slate-50 border border-slate-100 px-3 py-3 rounded-2xl text-xs font-bold text-slate-500 outline-none focus:border-neon-purple transition-all w-32 shrink-0"
                    value={draftStDate}
                    onChange={(e) => setDraftStDate(e.target.value)}
                  />
                  <button onClick={addDraftSubtask}
                    className="bg-dark-navy text-white px-4 rounded-2xl hover:brightness-110 transition-all font-bold flex items-center justify-center shrink-0">
                    <Plus size={18} />
                  </button>
                </div>

                {draftSubtasks.length > 0 && (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                    {draftSubtasks.map((s) => (
                      <div key={s.id}
                        className="flex items-center gap-3 bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl group">
                        <Circle size={13} className="text-slate-300 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-dark-navy truncate">{s.title}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Calendar size={9} className={s.dueDate ? "text-neon-purple" : "text-slate-300"} />
                            <span className={cn("text-[10px] font-bold uppercase tracking-widest",
                              s.dueDate ? "text-slate-500" : "text-slate-300")}>
                              {s.dueDate
                                ? formatDate(s.dueDate, { day: "numeric", month: "short" })
                                : "No deadline"}
                            </span>
                          </div>
                        </div>
                        <button onClick={() => removeDraftSubtask(s.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0">
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button onClick={resetModal}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 px-4 uppercase tracking-widest">
                  Cancel
                </button>
                <button onClick={createTask} disabled={creating || !form.title.trim()}
                  className="flex-1 bg-neon-purple text-white py-3 rounded-2xl font-bold hover:brightness-110 shadow-xl shadow-neon-purple/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {creating
                    ? "Creating..."
                    : draftSubtasks.length > 0
                      ? `Create Task + ${draftSubtasks.length} subtask${draftSubtasks.length > 1 ? "s" : ""} →`
                      : "Create Task →"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
