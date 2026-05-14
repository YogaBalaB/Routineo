import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Calendar, 
  Flag, 
  Tag, 
  AlertCircle, 
  Trash2, 
  Plus, 
  X, 
  CheckCircle2, 
  Circle,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Task, SubTask } from "../types";
import { cn } from "../lib/utils";
import confetti from "canvas-confetti";

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

export default function TaskDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Edit form states
  const [formTitle, setFormTitle] = useState("");
  const [formPriority, setFormPriority] = useState<Task["priority"]>("medium");
  const [formDate, setFormDate] = useState("");
  const [formCategory, setFormCategory] = useState<Task["category"]>("General");
  const [formNotes, setFormNotes] = useState("");
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [newSubtaskDate, setNewSubtaskDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchTask = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/tasks/${id}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setTask(data);
      setFormTitle(data.title);
      setFormPriority(data.priority);
      setFormDate(data.dueDate);
      setFormCategory(data.category);
      setFormNotes(data.notes || "");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTask();
  }, [id]);

  const updateTask = async (data: Partial<Task>) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    if (res.ok) fetchTask();
  };

  const toggleSubtask = async (subtaskId: string) => {
    if (!task) return;
    const updatedSubtasks = task.subtasks.map(st => {
      if (st.id === subtaskId) {
        const completed = !st.completed;
        if (completed) {
           confetti({
             particleCount: 50,
             spread: 50,
             origin: { y: 0.7 },
             colors: ['#8B5CF6', '#3B82F6']
           });
        }
        return { 
          ...st, 
          completed, 
          completedAt: completed ? new Date().toISOString() : null 
        };
      }
      return st;
    });
    await updateTask({ subtasks: updatedSubtasks });
  };

  const addSubtask = async () => {
    if (!newSubtaskTitle.trim() || !task) return;
    const newSubtask: SubTask = {
      id: `st-${Date.now()}`,
      title: newSubtaskTitle,
      completed: false,
      completedAt: null,
      dueDate: newSubtaskDate || null,
      createdAt: new Date().toISOString()
    };
    await updateTask({ subtasks: [...task.subtasks, newSubtask] });
    setNewSubtaskTitle("");
    setNewSubtaskDate(new Date().toISOString().split('T')[0]);
  };

  const updateSubtaskDate = async (subtaskId: string, dueDate: string) => {
    if (!task) return;
    const updatedSubtasks = task.subtasks.map(st => 
      st.id === subtaskId ? { ...st, dueDate } : st
    );
    await updateTask({ subtasks: updatedSubtasks });
  };

  const deleteSubtask = async (subtaskId: string) => {
    if (!task) return;
    await updateTask({ 
      subtasks: task.subtasks.filter(st => st.id !== subtaskId) 
    });
  };

  const handleSaveEdit = async () => {
    await updateTask({
      title: formTitle,
      priority: formPriority,
      dueDate: formDate,
      category: formCategory,
      notes: formNotes
    });
    setIsEditing(false);
  };

  const deleteTask = async () => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    const token = localStorage.getItem("token");
    await fetch(`/api/tasks/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    navigate("/tasks");
  };

  if (loading) return (
    <div className="min-h-[50vh] flex items-center justify-center">
       <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neon-purple"></div>
    </div>
  );

  if (!task) return (
    <div className="text-center py-20">
       <AlertCircle className="w-16 h-16 text-slate-200 mx-auto mb-4" />
       <h3 className="text-xl font-bold text-dark-navy">Task not found</h3>
       <button onClick={() => navigate("/tasks")} className="mt-4 text-neon-purple font-bold">Back to Tasks</button>
    </div>
  );

  return (
    <div className="w-full mx-auto space-y-4 md:space-y-6 pb-24 md:pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500 px-3 md:px-8 xl:px-12">
      {/* Navigation & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button 
          onClick={() => navigate("/tasks")}
          className="group flex items-center gap-2 text-slate-400 hover:text-dark-navy transition-all font-bold text-[10px] md:text-xs uppercase tracking-widest bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-100 shadow-sm w-fit"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Tasks
        </button>
        
        <div className="flex items-center justify-end gap-2">
          {!isEditing && (
            <>
              <button 
                onClick={() => setIsEditing(true)} 
                className="flex-1 sm:flex-none bg-dark-navy text-white px-6 py-2.5 rounded-2xl font-bold hover:brightness-110 shadow-lg shadow-slate-200 transition-all text-xs md:text-sm"
              >
                Edit Details
              </button>
              <button 
                onClick={deleteTask} 
                className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                title="Delete Task"
              >
                <Trash2 className="w-[18px] h-[18px] md:w-5 md:h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Identity Card */}
      <div className="bg-white rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-neon-purple/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="p-6 md:p-12 space-y-6 md:space-y-8 relative">
           {isEditing ? (
             <div className="space-y-4">
               <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest ml-1">Task Title</label>
               <input 
                 autoFocus
                 className="w-full text-2xl md:text-5xl font-display font-bold border-none outline-none text-dark-navy bg-transparent"
                 value={formTitle}
                 onChange={(e) => setFormTitle(e.target.value)}
               />
             </div>
           ) : (
              <div className="flex items-start gap-4 md:gap-6">
                 <button 
                   onClick={() => updateTask({ completed: !task.completed })}
                   className={cn(
                     "mt-1 w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-all shrink-0 border-2",
                     task.completed 
                      ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                      : "bg-white border-slate-200 text-slate-300 hover:border-neon-purple hover:text-neon-purple"
                   )}
                 >
                   {task.completed ? <CheckCircle2 className="w-6 h-6 md:w-7 md:h-7" /> : <Circle className="w-6 h-6 md:w-7 md:h-7" />}
                 </button>
                 <h1 className={cn(
                   "text-xl md:text-5xl font-display font-bold transition-all tracking-tight leading-tight",
                   task.completed ? "text-slate-400 line-through" : "text-dark-navy"
                 )}>
                   {task.title}
                 </h1>
              </div>
           )}

           {/* Quick Stats Banner */}
           <div className="flex flex-wrap items-center gap-2 md:gap-3 pt-2">
              {isEditing ? (
                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                        <Tag size={12} /> Category
                     </label>
                     <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map(c => (
                          <button
                            key={c.name}
                            onClick={() => setFormCategory(c.name)}
                            className={cn(
                              "px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border",
                              formCategory === c.name 
                               ? "bg-dark-navy text-white border-dark-navy" 
                               : "bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100"
                            )}
                          >
                            {c.icon} {c.name}
                          </button>
                        ))}
                     </div>
                   </div>

                   <div className="space-y-2">
                     <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                        <Flag size={12} /> Priority
                     </label>
                     <div className="flex bg-slate-100/50 p-1 rounded-xl border border-slate-200 w-fit">
                        {PRIORITIES.map(p => (
                          <button
                            key={p.level}
                            onClick={() => setFormPriority(p.level)}
                            className={cn(
                              "px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                              formPriority === p.level ? p.color : "text-slate-400 hover:text-slate-600"
                            )}
                          >
                            {p.level}
                          </button>
                        ))}
                     </div>
                   </div>

                   <div className="space-y-2">
                     <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                        <Calendar size={12} /> Due Date
                     </label>
                     <input 
                       type="date"
                       className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold text-dark-navy"
                       value={formDate}
                       onChange={(e) => setFormDate(e.target.value)}
                     />
                   </div>
                </div>
              ) : (
                <>
                   <div className={cn(
                     "px-4 py-2 rounded-2xl text-xs font-bold border flex items-center gap-2",
                     CATEGORIES.find(c => c.name === task.category)?.color
                   )}>
                      <span>{CATEGORIES.find(c => c.name === task.category)?.icon}</span>
                      {task.category}
                   </div>
                   <div className={cn(
                     "px-4 py-2 rounded-2xl text-xs font-bold border flex items-center gap-2 uppercase tracking-widest",
                     PRIORITIES.find(p => p.level === task.priority)?.color
                   )}>
                      <div className={cn("w-1.5 h-1.5 rounded-full", PRIORITIES.find(p => p.level === task.priority)?.dot)} />
                      {task.priority}
                   </div>
                   <div className="px-4 py-2 rounded-2xl text-xs font-bold border border-slate-100 bg-slate-50 text-slate-500 flex items-center gap-2">
                      <Calendar size={12} className="text-neon-purple" />
                      {new Date(task.dueDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                   </div>
                   {task.completed && (
                     <div className="px-4 py-2 rounded-2xl text-xs font-bold border border-emerald-100 bg-emerald-50 text-emerald-600 flex items-center gap-2 uppercase tracking-widest">
                        <CheckCircle2 size={12} /> Completed
                     </div>
                   )}
                </>
              )}
           </div>

           {isEditing && (
             <div className="flex items-center gap-4 pt-4">
                <button onClick={() => setIsEditing(false)} className="text-xs font-bold text-slate-400 hover:text-slate-600 px-4 uppercase tracking-widest">Cancel</button>
                <button onClick={handleSaveEdit} className="bg-neon-purple text-white px-8 py-3 rounded-2xl font-bold hover:brightness-110 shadow-xl shadow-neon-purple/20 transition-all">Save Changes</button>
             </div>
           )}
        </div>
      </div>

      {/* Body Content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left: Subtasks (3/5) */}
        <div className="lg:col-span-3 space-y-6">
           <div className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 rounded-xl md:rounded-2xl flex items-center justify-center text-emerald-500 shadow-inner">
                       <Plus size={24} />
                    </div>
                    <div>
                       <h3 className="font-display font-bold text-lg md:text-xl text-dark-navy">Subtasks</h3>
                       <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{task.subtasks.length} items total</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 bg-slate-50 px-5 md:px-6 py-2 md:py-3 rounded-2xl md:rounded-[1.5rem] border border-slate-100 self-end sm:self-auto min-w-[140px]">
                    <div className="text-right">
                       <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progress</p>
                       <p className="text-sm md:text-lg font-display font-bold text-emerald-500">
                          {task.subtasks.length > 0 ? Math.round((task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100) : 0}%
                       </p>
                    </div>
                    <div className="w-10 h-10 md:w-12 md:h-12 relative flex items-center justify-center">
                       <svg className="w-full h-full transform -rotate-90" viewBox="0 0 48 48">
                          <circle cx="24" cy="24" r="20" className="stroke-slate-100" strokeWidth="4" fill="transparent" />
                          <circle 
                            cx="24" cy="24" r="20" 
                            className="stroke-emerald-500 transition-all duration-1000" 
                            strokeWidth="4" 
                            fill="transparent"
                            strokeDasharray={126}
                            strokeDashoffset={126 - (126 * (task.subtasks.length > 0 ? (task.subtasks.filter(s => s.completed).length / task.subtasks.length) : 0))}
                          />
                       </svg>
                    </div>
                 </div>
              </div>

              {/* Subtask Input */}
              <div className="flex flex-col sm:flex-row gap-3">
                 <input 
                   placeholder="Add a new subtask step..."
                   className="flex-1 bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl text-sm font-medium outline-none focus:border-neon-purple transition-all shadow-inner"
                   value={newSubtaskTitle}
                   onChange={(e) => setNewSubtaskTitle(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && addSubtask()}
                 />
                 <div className="flex gap-2">
                    <input 
                      type="date"
                      title="Subtask deadline"
                      className="bg-slate-50 border border-slate-100 px-4 py-4 rounded-2xl text-xs font-bold text-slate-500 outline-none focus:border-neon-purple transition-all shadow-inner w-36"
                      value={newSubtaskDate}
                      onChange={(e) => setNewSubtaskDate(e.target.value)}
                    />
                    <button 
                      onClick={addSubtask}
                      className="bg-dark-navy text-white px-8 rounded-2xl hover:brightness-110 transition-all shadow-xl font-bold flex items-center justify-center shrink-0"
                    >
                      <Plus size={20} />
                    </button>
                 </div>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
                 {task.subtasks.map((st) => (
                   <motion.div 
                     key={st.id}
                     layout
                     className={cn(
                       "group flex flex-col p-5 rounded-[2rem] border transition-all relative overflow-hidden",
                       st.completed ? "bg-slate-50/50 border-transparent" : "bg-white border-slate-100 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5"
                     )}
                   >
                     <div className="flex items-center gap-4">
                        <button 
                          onClick={() => toggleSubtask(st.id)}
                          className={cn(
                            "w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all shrink-0",
                            st.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-200"
                          )}
                        >
                          {st.completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                        </button>
                        
                        <div className="flex-1 min-w-0">
                           <p className={cn(
                             "text-sm font-bold truncate",
                             st.completed ? "text-slate-400 line-through font-medium" : "text-dark-navy"
                           )}>
                             {st.title}
                           </p>
                        </div>

                        <button 
                          onClick={() => deleteSubtask(st.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-red-300 hover:text-red-500 transition-all rounded-lg hover:bg-red-50"
                        >
                           <X size={16} />
                        </button>
                     </div>

                     <div className="mt-4 flex flex-wrap items-center gap-6 border-t border-slate-100/50 pt-4">
                        <div className="flex items-center gap-2">
                           <Clock size={11} className="text-slate-300" />
                           <span className="text-[10px] font-bold text-slate-400">Added {new Date(st.createdAt || task.createdAt).toLocaleDateString()}</span>
                        </div>

                        <div className={cn(
                          "flex items-center gap-3 group/date relative bg-slate-50 px-3 py-1.5 rounded-xl border transition-all cursor-pointer",
                          st.dueDate 
                            ? "border-slate-100 hover:border-neon-purple/30" 
                            : "border-amber-200 bg-amber-50/50 animate-pulse hover:animate-none"
                        )}>
                           <Calendar size={11} className={cn("transition-colors", st.dueDate ? "text-neon-purple" : "text-amber-500")} />
                           <div className="relative">
                              <span className={cn(
                                "text-[10px] font-bold uppercase tracking-widest",
                                st.dueDate ? "text-slate-600" : "text-amber-600"
                              )}>
                                 {st.dueDate ? new Date(st.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "Set Deadline"}
                              </span>
                              <input 
                                type="date"
                                title="Set subtask due date"
                                className="absolute inset-0 opacity-0 cursor-pointer w-full"
                                value={st.dueDate || ""}
                                onChange={(e) => updateSubtaskDate(st.id, e.target.value)}
                              />
                           </div>
                        </div>

                        {st.completed && st.completedAt && (
                          <div className="flex items-center gap-1.5 ml-auto bg-emerald-50 px-3 py-1 rounded-full">
                            <CheckCircle2 size={12} className="text-emerald-500" />
                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest leading-none">
                              {new Date(st.completedAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                     </div>
                   </motion.div>
                 ))}

                 {task.subtasks.length === 0 && (
                   <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/30">
                      <Plus className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No subtasks defined yet</p>
                   </div>
                 )}
              </div>
           </div>
        </div>

        {/* Right: Notes & Extra Info (2/5) */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-12 h-12 bg-neon-purple/5 rounded-2xl flex items-center justify-center text-neon-purple shadow-inner">
                    <AlertCircle size={24} />
                 </div>
                 <div>
                    <h3 className="font-display font-bold text-xl text-dark-navy">Notes</h3>
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Project Details</p>
                 </div>
              </div>

              {isEditing ? (
                <textarea 
                  placeholder="Elaborate on the task objectives..."
                  className="w-full bg-slate-50 border border-slate-100 p-6 rounded-[2rem] text-sm font-medium outline-none focus:border-neon-purple min-h-[250px] shadow-inner"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                />
              ) : (
                <div className="relative group">
                   <div className="absolute -inset-2 bg-gradient-to-br from-neon-purple/5 to-blue-500/5 rounded-[2.5rem] blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                   <div className="relative bg-slate-50/50 border border-slate-100/50 p-8 rounded-[2.5rem] min-h-[200px]">
                      <p className="text-slate-500 font-medium leading-relaxed italic text-sm">
                         {task.notes || "This assignment doesn't have any detailed notes. You can add them to capture requirements, links, or ideas."}
                      </p>
                   </div>
                </div>
              )}
           </div>

           {/* Stats Widget */}
           <div className="bg-dark-navy p-8 rounded-[3rem] text-white overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-neon-purple rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="relative z-10 space-y-6">
                 <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time Summary</h4>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <p className="text-[9px] font-bold text-slate-400 uppercase">Created</p>
                       <p className="text-sm font-display font-medium text-white">{new Date(task.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[9px] font-bold text-slate-400 uppercase">Due In</p>
                       <p className="text-sm font-display font-medium text-neon-purple">
                          {Math.max(0, Math.ceil((new Date(task.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} Days
                       </p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
