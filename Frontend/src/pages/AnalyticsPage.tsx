import { useState, useEffect } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line
} from "recharts";
import { TrendingUp, Clock, Calendar, Zap, Download } from "lucide-react";
import { Session, Task, Habit } from "../types";
import { motion } from "motion/react";

export default function AnalyticsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      const headers = { "Authorization": `Bearer ${token}` };
      
      const [sRes, tRes, hRes] = await Promise.all([
        fetch("/api/sessions", { headers }),
        fetch("/api/tasks", { headers }),
        fetch("/api/habits", { headers }),
      ]);

      setSessions(await sRes.json());
      setTasks(await tRes.json());
      setHabits(await hRes.json());
    };

    fetchData();
  }, []);

  // Process data for charts
  const getStudyTimeByDay = () => {
     const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
     const data = days.map(day => ({ name: day, hours: 0 }));
     
     sessions.forEach(session => {
        if (session.type === "focus") {
           const dayIndex = new Date(session.timestamp).getDay();
           data[dayIndex].hours += session.duration / 60;
        }
     });
     
     // Rotate to start from Monday
     return [...data.slice(1), data[0]];
  };

  const getTaskCompletionRate = () => {
     const completed = tasks.filter(t => t.completed).length;
     const total = tasks.length || 1;
     return Math.round((completed / total) * 100);
  };

  const studyData = getStudyTimeByDay();

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-display font-bold">Analytics</h1>
           <p className="text-slate-500">Analyze your patterns and improve your flow.</p>
        </div>
        <button className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-colors">
           <Download size={16} /> Export Data
        </button>
      </header>

      {/* Top Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: "Total Focus Time", value: (sessions.filter(s=>s.type==="focus").reduce((a,b)=>a+b.duration,0) / 60).toFixed(1) + "h", icon: Clock, color: "text-blue-600 bg-blue-50" },
           { label: "Task Velocity", value: getTaskCompletionRate() + "%", icon: Zap, color: "text-coral bg-coral-50" },
           { label: "Check-ins", value: habits.reduce((a,b)=>a+b.history.length,0), icon: TrendingUp, color: "text-neon-purple bg-neon-purple-50" },
           { label: "Sessions", value: sessions.length, icon: Calendar, color: "text-emerald-600 bg-emerald-50" }
         ].map((stat, i) => (
           <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${stat.color}`}>
                 <stat.icon size={20} />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">{stat.label}</p>
              <p className="text-3xl font-display font-bold text-dark-navy">{stat.value}</p>
           </div>
         ))}
      </div>

      {/* Main Charts */}
      <div className="grid lg:grid-cols-3 gap-8">
         
         {/* Study Hours Chart */}
         <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-display font-bold mb-8">Study Hours Recap</h3>
            <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={studyData}>
                     <defs>
                        <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#C084FC" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#C084FC" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                     <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }}
                        dy={10}
                     />
                     <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }}
                     />
                     <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1E1B4B', 
                          borderRadius: '16px', 
                          border: 'none',
                          color: '#fff',
                          fontWeight: 'bold',
                          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                        }}
                        itemStyle={{ color: '#fff' }}
                     />
                     <Area 
                        type="monotone" 
                        dataKey="hours" 
                        stroke="#C084FC" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorHours)" 
                     />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Tasks Breakdown */}
         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
            <h3 className="text-xl font-display font-bold mb-8">Consistency</h3>
            <div className="flex-1 flex flex-col items-center justify-center space-y-6">
               <div className="relative w-48 h-48 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90">
                     <circle 
                        cx="96" cy="96" r="70" 
                        className="fill-none stroke-slate-100" 
                        strokeWidth="20"
                     />
                     <motion.circle 
                        cx="96" cy="96" r="70" 
                        className="fill-none stroke-neon-purple" 
                        strokeWidth="20"
                        strokeDasharray={440}
                        initial={{ strokeDashoffset: 440 }}
                        animate={{ strokeDashoffset: 440 - (440 * getTaskCompletionRate()) / 100 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        strokeLinecap="round"
                     />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                     <span className="text-4xl font-display font-bold text-dark-navy">{getTaskCompletionRate()}%</span>
                     <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tasks Done</span>
                  </div>
               </div>
               
               <div className="w-full space-y-4">
                  <div className="flex items-center justify-between">
                     <span className="text-sm font-bold text-slate-500">Active Tasks</span>
                     <span className="text-sm font-bold text-dark-navy">{tasks.filter(t=>!t.completed).length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-sm font-bold text-slate-500">Completed</span>
                     <span className="text-sm font-bold text-dark-navy">{tasks.filter(t=>t.completed).length}</span>
                  </div>
               </div>
            </div>
         </div>

      </div>
    </div>
  );
}
