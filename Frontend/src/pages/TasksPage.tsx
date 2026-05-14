import { useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Search, 
  Filter as FilterIcon,
  MoreVertical, 
  Trash2, 
  Calendar,
  CheckCircle2,
  Circle,
  Flag,
  Pin,
  PinOff,
  ChevronDown,
  ChevronUp,
  Tag,
  AlertCircle,
  Menu,
  MoreHorizontal,
  X,
  Target,
  ArrowUpRight,
  CheckSquare,
  Square,
  MinusSquare
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import toast from "react-hot-toast";
import { Task, SubTask } from "../types";
import { cn } from "../lib/utils";
import PrimaryButton from "../components/PrimaryButton";
import BulkToolbar from "../components/BulkToolbar";
import ConfirmModal from "../components/ConfirmModal";

const CATEGORIES = [
  { name: "Study", icon: "📚", color: "bg-blue-50 text-blue-600 border-blue-100" },
  { name: "Health", icon: "💪", color: "bg-green-50 text-green-600 border-green-100" },
  { name: "Personal", icon: "🌙", color: "bg-purple-50 text-purple-600 border-purple-100" },
  { name: "General", icon: "📝", color: "bg-slate-50 text-slate-600 border-slate-100" },
  { name: "Placement Prep", icon: "💼", color: "bg-amber-50 text-amber-600 border-amber-100" },
  { name: "Design Practice", icon: "🎨", color: "bg-rose-50 text-rose-600 border-rose-100" }
] as const;

const PRIORITIES = [
  { level: "low", color: "bg-emerald-50 text-emerald-600 border-emerald-100", dot: "bg-emerald-500" },
  { level: "medium", color: "bg-amber-50 text-amber-600 border-amber-100", dot: "bg-amber-500" },
  { level: "high", color: "bg-rose-50 text-rose-600 border-rose-100", dot: "bg-rose-500" }
] as const;

export default function TasksPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form states for adding
  const [formTitle, setFormTitle] = useState("");
  const [formPriority, setFormPriority] = useState<"low" | "medium" | "high">("medium");
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formCategory, setFormCategory] = useState<Task["category"]>("General");
  const [formNotes, setFormNotes] = useState("");
  const [formSubtasks, setFormSubtasks] = useState<{ title: string; completed: boolean }[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [newSubtaskDate, setNewSubtaskDate] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"dueDate" | "priority" | "recent" | "name" | "completion">("recent");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsAdding(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [quickSubtaskTitle, setQuickSubtaskTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    taskId?: string;
    isBulk: boolean;
  }>({ isOpen: false, isBulk: false });

  const addQuickSubtask = async (taskId: string) => {
    if (!quickSubtaskTitle.trim()) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newSubtask: SubTask = {
      id: `st-${Date.now()}`,
      title: quickSubtaskTitle,
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString()
    };

    await updateTaskData(taskId, {
      subtasks: [...(task.subtasks || []), newSubtask]
    });
    setQuickSubtaskTitle("");
  };

  const fetchTasks = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/tasks", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (res.ok) {
      setTasks(await res.json());
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const resetForm = () => {
    setFormTitle("");
    setFormPriority("medium");
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormCategory("General");
    setFormNotes("");
    setFormSubtasks([]);
    setNewSubtaskTitle("");
    setNewSubtaskDate("");
  };

  const addTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          title: formTitle, 
          dueDate: formDate, 
          priority: formPriority,
          category: formCategory,
          notes: formNotes,
          subtasks: formSubtasks.map((st, i) => ({ 
            ...st, 
            id: `st-${Date.now()}-${i}`,
            completedAt: null,
            createdAt: new Date().toISOString()
          })),
          pinned: false
        })
      });

      if (res.ok) {
         resetForm();
         setIsAdding(false);
         fetchTasks();
      }
    } catch (err) {
      console.error("Failed to add task:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTaskData = async (id: string, data: Partial<Task>) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    if (res.ok) fetchTasks();
  };

  const toggleTask = async (id: string, completed: boolean) => {
    if (completed) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8B5CF6', '#3B82F6', '#10B981']
      });
    }
    updateTaskData(id, { completed });
  };

  const toggleSubtask = async (taskId: string, subtaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedSubtasks = (task.subtasks || []).map(st => {
      if (st.id === subtaskId) {
        const completed = !st.completed;
        return { 
          ...st, 
          completed, 
          completedAt: completed ? new Date().toISOString() : null 
        };
      }
      return st;
    });

    updateTaskData(taskId, { subtasks: updatedSubtasks });
  };

  const togglePin = async (id: string, pinned: boolean) => {
    updateTaskData(id, { pinned });
  };

  const toggleExpand = (taskId: string) => {
    setExpandedTasks(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  const deleteTask = async (id: string) => {
    setDeleteModal({ isOpen: true, taskId: id, isBulk: false });
  };

  const confirmDelete = async () => {
    const token = localStorage.getItem("token");
    setIsLoading(true);

    try {
      if (deleteModal.isBulk) {
        // Bulk Delete
        const res = await fetch("/api/tasks/bulk", {
          method: "DELETE",
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ ids: selectedTaskIds })
        });
        
        if (res.ok) {
          const count = selectedTaskIds.length;
          setTasks(prev => prev.filter(t => !selectedTaskIds.includes(t.id)));
          setSelectedTaskIds([]);
          toast.success(`${count} tasks deleted successfully`);
        }
      } else if (deleteModal.taskId) {
        // Individual Delete
        const id = deleteModal.taskId;
        const res = await fetch(`/api/tasks/${id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (res.ok) {
          setTasks(prev => prev.filter(t => t.id !== id));
          setSelectedTaskIds(prev => prev.filter(tid => tid !== id));
          toast.success("Task deleted successfully");
        }
      }
    } catch (err) {
      toast.error("Failed to delete tasks");
    } finally {
      setIsLoading(false);
      setDeleteModal({ isOpen: false, isBulk: false });
    }
  };

  const handleSelectTask = (id: string) => {
    setSelectedTaskIds(prev => 
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedTaskIds.length === filteredTasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(filteredTasks.map(t => t.id));
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all" ? true : filter === "completed" ? task.completed : !task.completed;
    const matchesCategory = categoryFilter === "all" ? true : task.category === categoryFilter;
    return matchesSearch && matchesFilter && matchesCategory;
  }).sort((a, b) => {
    // Pinned tasks always first
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;

    const pMap = { high: 3, medium: 2, low: 1 };
    
    if (sortBy === "dueDate") {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (sortBy === "priority") {
      return pMap[b.priority] - pMap[a.priority];
    }
    if (sortBy === "name") {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === "completion") {
      return getSubtaskProgress(b.subtasks) - getSubtaskProgress(a.subtasks);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const totalTasks = tasks.length;
  const completedTasksCount = tasks.filter(t => t.completed).length;
  const overdueTasksCount = tasks.filter(t => !t.completed && new Date(t.dueDate).setHours(0,0,0,0) < new Date().setHours(0,0,0,0)).length;

  const overdueTasks = filteredTasks.filter(t => !t.completed && new Date(t.dueDate).setHours(0,0,0,0) < new Date().setHours(0,0,0,0));
  const remainingTasks = filteredTasks.filter(t => t.completed || new Date(t.dueDate).setHours(0,0,0,0) >= new Date().setHours(0,0,0,0));

  const getSubtaskProgress = (subtasks: SubTask[] = []) => {
    if (!subtasks || subtasks.length === 0) return 0;
    const completed = subtasks.filter(st => st.completed).length;
    return Math.round((completed / subtasks.length) * 100);
  };

  const priorityColors = {
    low: "bg-blue-100 text-blue-600",
    medium: "bg-amber-100 text-amber-600",
    high: "bg-red-100 text-red-600"
  };

  const getDueDateInfo = (dateStr: string) => {
    const d = new Date(dateStr);
    d.setHours(0,0,0,0);
    const today = new Date();
    today.setHours(0,0,0,0);
    
    if (d.getTime() === today.getTime()) {
      return { color: "text-[#F59E0B]", badge: "Today", bg: "bg-[#FEF3C7]", text: "text-[#D97706]" };
    }
    if (d.getTime() < today.getTime()) {
      return { color: "text-[#EF4444]", badge: "Overdue", bg: "bg-[#FEE2E2]", text: "text-[#DC2626]" };
    }
    return { color: "text-slate-400", badge: null, bg: "", text: "" };
  };

  const renderTaskCard = (task: Task, isForcedOverdue: boolean = false) => {
    const dueDateInfo = getDueDateInfo(task.dueDate);
    const progress = getSubtaskProgress(task.subtasks);
    
    return (
      <motion.div
        key={task.id}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className={cn(
          "group relative bg-white rounded-[2.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:shadow-slate-200/50 overflow-hidden",
          task.completed && "opacity-75 grayscale-[0.5]"
        )}
      >
        {/* Status Bar */}
        <div className={cn(
          "absolute top-0 left-0 w-1.5 h-full transition-all",
          task.completed ? "bg-green-400" : (isForcedOverdue ? "bg-[#EF4444]" : PRIORITIES.find(p => p.level === task.priority)?.dot.replace('bg-', 'bg-'))
        )} />

         <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center gap-4 mt-1">
              <button 
                onClick={(e) => { e.stopPropagation(); handleSelectTask(task.id); }}
                className={cn(
                  "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0",
                  selectedTaskIds.includes(task.id) 
                    ? "bg-[#7C3AED] border-[#7C3AED] text-white shadow-lg shadow-purple-200" 
                    : "bg-white border-slate-100 text-transparent hover:border-[#7C3AED]/30"
                )}
              >
                <CheckCircle2 size={14} />
              </button>

              <button 
                onClick={(e) => { e.stopPropagation(); toggleTask(task.id, !task.completed); }}
                className={cn(
                  "w-6 h-6 rounded-lg flex items-center justify-center transition-all shrink-0",
                  task.completed ? "bg-green-100 text-green-600" : "bg-slate-50 text-slate-300 hover:bg-neon-purple/10 hover:text-neon-purple border border-slate-100"
                )}
              >
                {task.completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
              </button>
            </div>
            
            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/tasks/${task.id}`)}>
              <div className="flex items-center gap-2 mb-1">
                <h4 className={cn(
                  "font-display font-bold text-lg text-dark-navy truncate transition-all", 
                  task.completed && "line-through text-slate-400"
                )}>
                  {task.title}
                </h4>
                {task.pinned && <Pin size={12} className="text-neon-purple fill-neon-purple shrink-0" />}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                  {/* Category Tag */}
                  {task.category && (
                    <div className={cn(
                      "px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider border flex items-center gap-1.5",
                      CATEGORIES.find(c => c.name === task.category)?.color
                    )}>
                      <span>{CATEGORIES.find(c => c.name === task.category)?.icon}</span>
                      {task.category}
                    </div>
                  )}

                  {/* Priority Indicator */}
                  <div className={cn(
                    "px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider border flex items-center gap-1.5",
                    PRIORITIES.find(p => p.level === task.priority)?.color
                  )}>
                     <div className={cn("w-1.5 h-1.5 rounded-full", PRIORITIES.find(p => p.level === task.priority)?.dot)} />
                     {task.priority}
                  </div>

                  {/* Due Date with warning badges (Fix 4) */}
                  <div className={cn("flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest", dueDateInfo.color)}>
                    <Calendar size={12} className={task.completed ? "text-slate-300" : "opacity-70"} />
                    {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    {dueDateInfo.badge && !task.completed && (
                      <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] ml-1", dueDateInfo.bg, dueDateInfo.text)}>
                        {dueDateInfo.badge}
                      </span>
                    )}
                  </div>
              </div>

              {/* Subtask Progress Bar and Toggle (Fix 10) */}
              {task.subtasks && task.subtasks.length > 0 && (
                <div className="mt-4 space-y-1.5">
                   <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleExpand(task.id); }}
                        className="flex items-center gap-1.5 text-neon-purple hover:brightness-125 transition-all"
                      >
                         <motion.span
                           animate={{ rotate: expandedTasks.has(task.id) ? 180 : 0 }}
                           transition={{ duration: 0.2 }}
                         >
                           <ChevronDown size={12} />
                         </motion.span>
                         {task.subtasks.length} Subtasks
                      </button>
                      <span className="text-dark-navy">{progress}%</span>
                   </div>
                   <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-neon-purple transition-all"
                      />
                   </div>

                   <AnimatePresence>
                     {expandedTasks.has(task.id) && (
                       <motion.div 
                         initial={{ height: 0, opacity: 0 }}
                         animate={{ height: "auto", opacity: 1 }}
                         exit={{ height: 0, opacity: 0 }}
                         transition={{ duration: 0.2, ease: "easeInOut" }}
                         className="overflow-hidden pt-2"
                       >
                          <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 space-y-3">
                             {task.subtasks.map(st => (
                               <div key={st.id} className="flex items-center justify-between gap-3 group/sub">
                                  <div className="flex items-center gap-2">
                                     <button 
                                       onClick={(e) => { e.stopPropagation(); toggleSubtask(task.id, st.id); }}
                                       className={cn(
                                         "w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all",
                                         st.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-200 bg-white"
                                       )}
                                     >
                                        {st.completed && <CheckCircle2 size={12} />}
                                     </button>
                                     <span className={cn(
                                       "text-xs font-semibold tracking-tight",
                                       st.completed ? "text-slate-400 line-through" : "text-slate-700"
                                     )}>
                                       {st.title}
                                     </span>
                                  </div>
                                  {st.dueDate && (
                                    <span className="text-xs font-bold text-slate-400 uppercase bg-white px-1.5 py-0.5 rounded-md border border-slate-100">
                                      {new Date(st.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </span>
                                  )}
                               </div>
                             ))}
                          </div>
                       </motion.div>
                     )}
                   </AnimatePresence>
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-2">
               {/* Tooltips (Fix 5) */}
               <div className="relative group/tip">
                 <button
                   onClick={(e) => { e.stopPropagation(); togglePin(task.id, !task.pinned); }}
                   className={cn(
                     "p-2 rounded-xl transition-all",
                     task.pinned ? "text-neon-purple bg-neon-purple/5" : "text-slate-300 hover:text-slate-400 hover:bg-slate-50"
                   )}
                 >
                   {task.pinned ? <Pin size={16} /> : <PinOff size={16} />}
                 </button>
                 <div className="absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 px-2 py-1 bg-[#111827] text-white text-[11px] rounded-md whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-10">
                   {task.pinned ? "Unpin task" : "Pin task"}
                 </div>
               </div>

               <div className="relative group/tip">
                 <button
                   onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/tasks/${task.id}`);
                   }}
                   className="p-2 text-slate-300 hover:text-neon-purple hover:bg-neon-purple/5 rounded-xl transition-all"
                 >
                   <ArrowUpRight size={18} />
                 </button>
                 <div className="absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 px-2 py-1 bg-[#111827] text-white text-[11px] rounded-md whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-10">
                   Open task
                 </div>
               </div>

               <div className="relative group/tip">
                 <button
                   onClick={(e) => {
                      e.stopPropagation();
                      deleteTask(task.id);
                   }}
                   className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                 >
                   <Trash2 size={16} />
                 </button>
                 <div className="absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 px-2 py-1 bg-[#111827] text-white text-[11px] rounded-md whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-10">
                   Delete task
                 </div>
               </div>
            </div>
          </div>
         </div>
      </motion.div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 relative">
      <BulkToolbar 
        selectedCount={selectedTaskIds.length}
        onDelete={() => setDeleteModal({ isOpen: true, isBulk: true })}
        onClear={() => setSelectedTaskIds([])}
        itemName="task"
      />

      <ConfirmModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, isBulk: false })}
        onConfirm={confirmDelete}
        isLoading={isLoading}
        title={deleteModal.isBulk ? "Delete Multiple Tasks?" : "Delete this task?"}
        message={deleteModal.isBulk 
          ? `Are you sure you want to delete ${selectedTaskIds.length} tasks? This cannot be undone.` 
          : "Are you sure you want to delete this task? This cannot be undone."}
      />

      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div>
           <h1 className="text-2xl md:text-3xl font-display font-bold">Tasks</h1>
           <p className="text-[13px] text-slate-500 font-medium">
             {totalTasks} Tasks · {completedTasksCount} Completed · <span className={overdueTasksCount > 0 ? "text-[#EF4444]" : ""}>{overdueTasksCount} Overdue</span>
           </p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-neon-purple text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-lg shadow-neon-purple/20 w-full sm:w-auto"
        >
          <Plus size={20} />
          <span>New Task</span>
        </button>
      </header>

      {/* Toolbar */}
      <div className="flex flex-col gap-4 bg-white p-4 md:p-6 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 font-bold" />
             <input 
               type="text" 
               placeholder="Search tasks..." 
               className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-2xl border-transparent focus:bg-white focus:border-neon-purple focus:ring-0 transition-all text-sm font-medium"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
          </div>
          
          <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 overflow-x-auto no-scrollbar">
             {(["all", "active", "completed"] as const).map(f => (
               <button
                 key={f}
                 onClick={() => setFilter(f)}
                 className={cn(
                   "px-4 md:px-5 py-2 rounded-xl text-[10px] md:text-xs font-bold transition-all capitalize whitespace-nowrap",
                   filter === f ? "bg-white text-dark-navy shadow-md shadow-slate-200" : "text-slate-400 hover:text-slate-600"
                 )}
               >
                 {f}
               </button>
             ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
           <div className="flex items-center gap-4">
              <button 
                onClick={handleSelectAll}
                className="flex items-center gap-2 px-2 py-1 bg-slate-50 rounded-lg border border-slate-100 transition-colors hover:bg-slate-100"
                title="Select All"
              >
                {selectedTaskIds.length === 0 ? (
                  <Square size={16} className="text-slate-300" />
                ) : selectedTaskIds.length === filteredTasks.length ? (
                  <CheckSquare size={16} className="text-neon-purple" />
                ) : (
                  <MinusSquare size={16} className="text-neon-purple" />
                )}
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Select All</span>
              </button>

              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                <FilterIcon size={12} className="text-slate-400" />
                <select 
                  title="Filter by category"
                  className="bg-transparent border-none outline-none text-xs font-bold text-slate-500 appearance-none pr-4"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>
           </div>

           <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-widest hidden sm:inline">Sort:</span>
              <select 
                title="Sort tasks"
                className="bg-transparent border-none outline-none text-[13px] font-bold text-[#374151] cursor-pointer"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="recent">Recent</option>
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
                <option value="name">Name</option>
                <option value="completion">Completion %</option>
              </select>
           </div>
        </div>
      </div>

      {/* Create Task Modal Overlay */}
      <AnimatePresence>
        {isAdding && (
          <div 
            className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setIsAdding(false)}
          >
            <motion.form 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={addTask}
              className="bg-white p-8 rounded-[16px] border border-slate-100 shadow-2xl w-[860px] max-w-[95vw] max-h-[90vh] overflow-y-auto relative"
            >
               <button 
                 type="button" 
                 onClick={() => setIsAdding(false)}
                 className="absolute top-4 right-4 text-[#9CA3AF] hover:text-[#111827] transition-colors p-2"
               >
                 <X size={20} />
               </button>

               <div className="space-y-1 mb-8">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-widest ml-1">Task Title</label>
                  <input 
                    autoFocus
                    placeholder="E.g. Study Data Structures"
                    className="w-full text-xl md:text-2xl font-display font-bold border-none outline-none placeholder:text-slate-200 bg-transparent"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                  />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
                  <div className="space-y-6">
                     <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                           <Tag size={10} /> Category
                        </label>
                        <div className="flex flex-wrap gap-2">
                           {CATEGORIES.map(c => (
                             <button
                               key={c.name}
                               type="button"
                               onClick={() => setFormCategory(c.name)}
                               className={cn(
                                 "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border",
                                 formCategory === c.name 
                                  ? "bg-dark-navy text-white border-dark-navy shadow-lg" 
                                  : "bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100"
                               )}
                             >
                               {c.icon} {c.name}
                             </button>
                           ))}
                        </div>
                     </div>

                     <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                           <Flag size={10} /> Priority
                        </label>
                        <div className="flex bg-slate-50 p-1.5 rounded-xl border border-slate-100 w-fit">
                           {PRIORITIES.map(p => (
                             <button
                               key={p.level}
                               type="button"
                               onClick={() => setFormPriority(p.level)}
                               className={cn(
                                 "px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                                 formPriority === p.level ? p.color : "text-slate-400 hover:text-slate-600"
                               )}
                             >
                               {p.level}
                             </button>
                           ))}
                        </div>
                     </div>

                     <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                           <Calendar size={10} /> Due Date
                        </label>
                        <input 
                          type="date" 
                          value={formDate}
                          onChange={(e) => setFormDate(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl text-sm font-bold text-slate-600 outline-none focus:border-neon-purple transition-all"
                        />
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                           <Plus size={10} /> Subtasks
                        </label>
                        <div className="space-y-2">
                           {formSubtasks.map((st, i) => (
                             <div key={i} className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl group">
                                <Plus size={12} className="rotate-45 text-slate-300" />
                                 <div className="flex flex-col gap-1 flex-1">
                                    <span className="text-xs font-semibold text-slate-600">{st.title}</span>
                                    {/* @ts-ignore */}
                                    {st.dueDate && (
                                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                        <Calendar size={8} /> {st.dueDate}
                                      </span>
                                    )}
                                 </div>
                                <button 
                                  type="button" 
                                  onClick={() => setFormSubtasks(prev => prev.filter((_, idx) => idx !== i))}
                                  className="text-red-400 hover:text-red-500"
                                >
                                  <X size={14} />
                                </button>
                             </div>
                           ))}
                           <div className="flex flex-col gap-2 pt-2">
                              <input 
                                placeholder="Subtask title..."
                                className="w-full bg-slate-50 border border-slate-100 px-3 py-3 rounded-xl text-sm font-medium outline-none focus:border-neon-purple transition-all"
                                value={newSubtaskTitle}
                                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                              />
                              <div className="flex gap-2">
                                <input 
                                  type="date"
                                  title="Subtask due date"
                                  className="flex-1 bg-slate-50 border border-slate-100 px-3 py-3 rounded-xl text-sm font-bold text-slate-500 outline-none"
                                  value={newSubtaskDate}
                                  onChange={(e) => setNewSubtaskDate(e.target.value)}
                                />
                                <button 
                                  type="button"
                                  onClick={() => {
                                    if (newSubtaskTitle.trim()) {
                                      setFormSubtasks(prev => [...prev, { title: newSubtaskTitle, completed: false, dueDate: newSubtaskDate || null } as any]);
                                      setNewSubtaskTitle("");
                                      setNewSubtaskDate("");
                                    }
                                  }}
                                  className="bg-dark-navy text-white px-4 rounded-xl hover:brightness-110 transition-all font-bold"
                                >
                                  <Plus size={16} />
                                </button>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="space-y-3 pt-6">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <AlertCircle size={10} /> Notes
                  </label>
                  <textarea 
                    placeholder="Add extra details here..."
                    className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-[1.5rem] text-sm font-medium outline-none focus:border-neon-purple transition-all min-h-[100px]"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                  />
               </div>

               <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-8 mt-4 border-t border-slate-100">
                  <button 
                    type="button" 
                    onClick={() => setIsAdding(false)} 
                    className="w-full sm:w-auto px-8 py-3 rounded-lg border border-[#D1D5DB] text-[#6B7280] font-medium hover:border-[#9CA3AF] transition-colors order-2 sm:order-1"
                  >
                    Cancel
                  </button>
                  <PrimaryButton 
                    type="submit" 
                    className="w-full sm:w-auto order-1 sm:order-2"
                    label="Create Task" 
                    isLoading={isLoading} 
                  />
               </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>


          {tasks.length > 0 ? (
            <div className="space-y-12">
               {/* Overdue Section (Fix 7) */}
               {overdueTasks.length > 0 && (
                 <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[#EF4444] text-[12px] font-bold uppercase tracking-widest pl-2">
                       <AlertCircle size={14} />
                       <span>Overdue</span>
                    </div>
                    <div className="space-y-4">
                       {overdueTasks.map(task => renderTaskCard(task, true))}
                    </div>
                 </div>
               )}
               <div className="space-y-4">
                 {remainingTasks.map(task => renderTaskCard(task))}
               </div>
            </div>
          ) : !isAdding && (
             <div className="text-center py-24 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center">
                <CheckCircle2 size={48} className="mx-auto text-slate-200 mb-4" />
                <h3 className="text-xl font-bold text-dark-navy">Cleared for Takeoff</h3>
                <p className="text-slate-400 mt-2 max-w-xs mx-auto font-medium">Your task list is empty. Time to plan your next achievement!</p>
                <button 
                  onClick={() => setIsAdding(true)}
                  className="mt-8 bg-dark-navy text-white px-8 py-3 rounded-2xl font-bold hover:scale-105 transition-all shadow-xl shadow-slate-200"
                >
                  Create Your First Task
                </button>
             </div>
          )}
    </div>
  );
}
