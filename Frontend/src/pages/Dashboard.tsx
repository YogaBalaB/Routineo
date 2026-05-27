import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
   Flame,
   CheckCircle2,
   Clock,
   ArrowUpRight,
   ChevronRight,
   Timer,
   Play,
   Pause,
   RotateCcw,
   Trophy,
   Frown,
   Meh,
   Smile,
   Laugh,
} from "lucide-react";

import { motion } from "motion/react";
import { User, Task, Habit, Session, EarnedBadge } from "../types";
import { API_URL } from "../lib/api";
import { cn } from "../lib/utils";
import { formatDate } from "../lib/dateUtils";
import { badgeEmitter } from "../components/BadgeEarnedPopup";
import BadgeGrid from "../components/BadgeGrid";

interface Props {
   user: User;
}

const MOODS = [
   {
      icon: Frown,
      label: "Terrible",
      value: "terrible",
      color: "text-red-500 bg-red-50",
   },
   {
      icon: Meh,
      label: "Okay",
      value: "okay",
      color: "text-amber-500 bg-amber-50",
   },
   {
      icon: Smile,
      label: "Good",
      value: "good",
      color: "text-blue-500 bg-blue-50",
   },
   {
      icon: Laugh,
      label: "Great",
      value: "great",
      color: "text-green-500 bg-green-50",
   },
];

export default function Dashboard({ user }: Props) {
   const [tasks, setTasks] = useState<Task[]>([]);
   const [habits, setHabits] = useState<Habit[]>([]);
   const [sessions, setSessions] = useState<Session[]>([]);
   const [earnedBadges, setEarnedBadges] = useState<EarnedBadge[]>([]);
   const [currentMood, setCurrentMood] = useState<string | null>(null);

   const navigate = useNavigate();

   // Timer State
   const [timerTime, setTimerTime] = useState(25 * 60);
   const [isActive, setIsActive] = useState(false);
   const [mode, setMode] = useState<"focus" | "break">("focus");

   useEffect(() => {
      const fetchData = async () => {
         const token = localStorage.getItem("token");

         const headers = {
            Authorization: `Bearer ${token}`,
         };

         const [tRes, hRes, sRes, mRes] = await Promise.all([
            fetch(`${API_URL}/api/tasks`, { headers }),
            fetch(`${API_URL}/api/habits`, { headers }),
            fetch(`${API_URL}/api/sessions`, { headers }),
            fetch(`${API_URL}/api/moods`, { headers }),
         ]);

         setTasks(await tRes.json());
         setHabits(await hRes.json());
         setSessions(await sRes.json());

         const [badgesRes, moodsData] = await Promise.all([
            fetch(`${API_URL}/api/badges`, { headers }),
            mRes.json(),
         ]);

         setEarnedBadges(await badgesRes.json());

         const today = new Date().toISOString().split("T")[0];

         const todayMood = moodsData.find(
            (m: any) => m.date === today
         );

         if (todayMood) {
            setCurrentMood(todayMood.mood);
         }
      };

      fetchData();
   }, []);

   // Timer Logic
   useEffect(() => {
      let interval: any = null;

      if (isActive && timerTime > 0) {
         interval = setInterval(() => {
            setTimerTime((prev) => prev - 1);
         }, 1000);
      } else if (timerTime === 0) {
         setIsActive(false);
         handleSessionComplete();
      } else {
         clearInterval(interval);
      }

      return () => clearInterval(interval);
   }, [isActive, timerTime]);

   const handleSessionComplete = async () => {
      const token = localStorage.getItem("token");

      const duration = mode === "focus" ? 25 : 5;

      const sRes = await fetch(`${API_URL}/api/sessions`, {
         method: "POST",
         headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
         },
         body: JSON.stringify({
            duration,
            type: mode,
         }),
      });

      const resJson = await sRes.json();

      setSessions(
         await (
            await fetch(`${API_URL}/api/sessions`, {
               headers: {
                  Authorization: `Bearer ${token}`,
               },
            })
         ).json()
      );

      if (resJson.newBadges?.length > 0) {
         resJson.newBadges.forEach((id: string) =>
            badgeEmitter.emit(id)
         );

         setEarnedBadges((prev) => [
            ...prev,
            ...resJson.newBadges.map((id: string) => ({
               badgeId: id,
               earnedAt: new Date().toISOString(),
            })),
         ]);
      }

      setMode(mode === "focus" ? "break" : "focus");

      setTimerTime(
         mode === "focus" ? 5 * 60 : 25 * 60
      );
   };

   const setMood = async (mood: string) => {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/moods`, {
         method: "POST",
         headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
         },
         body: JSON.stringify({ mood }),
      });

      if (res.ok) {
         setCurrentMood(mood);
      }
   };

   const toggleTask = async (
      id: string,
      completed: boolean
   ) => {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/tasks/${id}`, {
         method: "PATCH",
         headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
         },
         body: JSON.stringify({ completed }),
      });

      if (res.ok) {
         setTasks(
            tasks.map((t) =>
               t.id === id
                  ? { ...t, completed }
                  : t
            )
         );
      }
   };

   const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;

      return `${m}:${s < 10 ? "0" : ""}${s}`;
   };

   const todayTasks = tasks.filter(
      (t) => !t.completed
   );

   const todayDate = new Date()
      .toISOString()
      .split("T")[0];

   const pendingHabits = habits.filter(
      (h) =>
         !(h.history || []).includes(todayDate)
   );

   const totalStudyTime = sessions
      .filter((s) => s.type === "focus")
      .reduce((acc, s) => acc + s.duration, 0);

   return (
      <div className="space-y-6 md:space-y-8 pb-12">

         {/* Header */}
         <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">

            <div className="space-y-1">
               <h1 className="text-2xl md:text-3xl font-display font-bold">
                  Good morning, {user.name.split(" ")[0]}
               </h1>

               <p className="text-sm md:text-base text-slate-500">
                  You have {todayTasks.length} tasks and{" "}
                  {pendingHabits.length} habits remaining today.
               </p>
            </div>

            {/* Mood Buttons */}
            <div className="flex gap-2 bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm w-fit">

               {MOODS.map((m) => {
                  const Icon = m.icon;

                  return (
                     <button
                        key={m.label}
                        onClick={() =>
                           setMood(m.value)
                        }
                        className={cn(
                           "p-2.5 md:p-3 rounded-2xl transition-all hover:scale-110",
                           currentMood === m.value
                              ? `${m.color} ring-2 ring-inset ring-current`
                              : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                        )}
                        title={m.label}
                     >
                        <Icon className="w-5 h-5 md:w-6 md:h-6" />
                     </button>
                  );
               })}
            </div>
         </header>

         <div className="grid lg:grid-cols-3 gap-8">

            {/* Left Section */}
            <div className="lg:col-span-2 space-y-8">

               {/* Stats */}
               <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6">

                  {/* Streak */}
                  <div className="bg-white p-5 md:p-6 rounded-[2rem] border border-slate-100 shadow-sm">

                     <div className="w-12 h-12 bg-coral/10 rounded-2xl flex items-center justify-center mb-4">
                        <Flame className="w-6 h-6 text-coral" />
                     </div>

                     <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                        Top Streak
                     </p>

                     <p className="text-3xl font-bold text-dark-navy">
                        {Math.max(
                           ...habits.map((h) => h.streak),
                           0
                        )}

                        <span className="text-sm text-slate-400 ml-1">
                           Days
                        </span>
                     </p>
                  </div>

                  {/* Study Hours */}
                  <div className="bg-white p-5 md:p-6 rounded-[2rem] border border-slate-100 shadow-sm">

                     <div className="w-12 h-12 bg-neon-purple/10 rounded-2xl flex items-center justify-center mb-4">
                        <Clock className="w-6 h-6 text-neon-purple" />
                     </div>

                     <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                        Study Hours
                     </p>

                     <p className="text-3xl font-bold text-dark-navy">
                        {(totalStudyTime / 60).toFixed(1)}

                        <span className="text-sm text-slate-400 ml-1">
                           h
                        </span>
                     </p>
                  </div>

                  {/* Completed */}
                  <div className="bg-white p-5 md:p-6 rounded-[2rem] border border-slate-100 shadow-sm">

                     <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-6 h-6 text-blue-500" />
                     </div>

                     <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                        Completed
                     </p>

                     <p className="text-3xl font-bold text-dark-navy">
                        {
                           tasks.filter(
                              (t) => t.completed
                           ).length
                        }

                        <span className="text-sm text-slate-400 ml-1">
                           Tasks
                        </span>
                     </p>
                  </div>
               </div>

               {/* Tasks */}
               <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">

                  <div className="p-8 border-b border-slate-100 flex items-center justify-between">

                     <h3 className="text-xl font-display font-bold">
                        Today's Focus
                     </h3>

                     <Link
                        to="/tasks"
                        className="text-neon-purple font-semibold flex items-center gap-1 hover:underline"
                     >
                        View All
                        <ArrowUpRight size={18} />
                     </Link>
                  </div>

                  <div className="p-2">

                     {todayTasks.length > 0 ? (
                        todayTasks
                           .slice(0, 5)
                           .map((task) => (
                              <div
                                 key={task.id}
                                 className="group flex items-center gap-4 p-4 hover:bg-slate-50 rounded-3xl transition-all"
                              >

                                 <button
                                    onClick={() =>
                                       toggleTask(
                                          task.id,
                                          true
                                       )
                                    }
                                    className="w-6 h-6 rounded-lg border-2 border-slate-200 flex items-center justify-center group-hover:border-neon-purple transition-all"
                                 >
                                    <div className="w-2.5 h-2.5 bg-neon-purple rounded-sm opacity-0 group-hover:opacity-20 transition-all" />
                                 </button>

                                 <div className="flex-1">

                                    <div className="flex items-center gap-2 mb-1">
                                       <p className="font-semibold text-dark-navy">
                                          {task.title}
                                       </p>

                                       {task.priority ===
                                          "high" && (
                                             <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                          )}
                                    </div>

                                    <p className="text-sm text-slate-400">
                                       {formatDate(
                                          task.dueDate
                                       )}
                                    </p>
                                 </div>

                                 <button
                                    onClick={() =>
                                       navigate(
                                          `/tasks/${task.id}`
                                       )
                                    }
                                    className="p-1.5 text-slate-300 hover:text-neon-purple hover:bg-neon-purple/5 rounded-lg transition-all"
                                 >
                                    <ArrowUpRight size={14} />
                                 </button>
                              </div>
                           ))
                     ) : (
                        <div className="p-12 text-center">

                           <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                              <CheckCircle2 className="text-slate-300 w-8 h-8" />
                           </div>

                           <p className="font-bold text-slate-400">
                              All caught up
                           </p>

                           <p className="text-sm text-slate-400">
                              Go enjoy some free time.
                           </p>
                        </div>
                     )}
                  </div>
               </div>

               {/* Achievements */}
               <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">

                  <div className="flex items-center justify-between mb-8">

                     <div>
                        <h3 className="text-xl font-bold flex items-center gap-2">
                           <Trophy className="text-amber-500 w-6 h-6" />
                           Achievements
                        </h3>

                        <p className="text-sm text-slate-400">
                           Collect badges by maintaining focus and habits
                        </p>
                     </div>

                     <div className="bg-slate-50 px-4 py-2 rounded-2xl">
                        <span className="text-lg font-bold">
                           {earnedBadges.length}
                        </span>
                     </div>
                  </div>

                  <BadgeGrid
                     earnedBadges={earnedBadges}
                     columns={3}
                  />
               </div>
            </div>

            {/* Right Side */}
            <div className="space-y-8">

               {/* Timer */}
               <div className="bg-dark-navy text-white rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">

                  <div className="relative z-10">

                     <div className="flex items-center justify-between mb-8">

                        <div className="flex items-center gap-2">
                           <Timer className="text-neon-purple w-5 h-5" />

                           <span className="font-bold uppercase tracking-widest text-xs opacity-60">
                              {mode === "focus"
                                 ? "Focus Session"
                                 : "Short Break"}
                           </span>
                        </div>

                        <button
                           onClick={() => {
                              setIsActive(false);

                              setTimerTime(
                                 mode === "focus"
                                    ? 25 * 60
                                    : 5 * 60
                              );
                           }}
                           className="opacity-60 hover:opacity-100 transition-opacity"
                        >
                           <RotateCcw size={18} />
                        </button>
                     </div>

                     <div className="text-center mb-8">
                        <span className="text-7xl font-bold tracking-tighter tabular-nums">
                           {formatTime(timerTime)}
                        </span>
                     </div>

                     <div className="flex justify-center">

                        <button
                           onClick={() =>
                              setIsActive(!isActive)
                           }
                           className={cn(
                              "w-16 h-16 rounded-2xl flex items-center justify-center transition-all",
                              isActive
                                 ? "bg-white text-dark-navy"
                                 : "bg-neon-purple text-white hover:scale-105"
                           )}
                        >
                           {isActive ? (
                              <Pause fill="currentColor" />
                           ) : (
                              <Play fill="currentColor" />
                           )}
                        </button>
                     </div>
                  </div>

                  {isActive && (
                     <motion.div
                        initial={{
                           scale: 0,
                           opacity: 0,
                        }}
                        animate={{
                           scale: 4,
                           opacity: 0,
                        }}
                        transition={{
                           repeat: Infinity,
                           duration: 2,
                           ease: "easeOut",
                        }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-neon-purple/20 rounded-full"
                     />
                  )}
               </div>

               {/* Habits */}
               <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">

                  <div className="flex items-center justify-between mb-6">

                     <h3 className="text-xl font-bold">
                        Daily Habits
                     </h3>

                     <Link to="/habits">
                        <ChevronRight className="text-slate-300 hover:text-dark-navy transition-colors" />
                     </Link>
                  </div>

                  <div className="space-y-4">

                     {habits
                        .slice(0, 3)
                        .map((habit) => (
                           <div
                              key={habit.id}
                              className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl"
                           >

                              <div className="flex items-center gap-3">

                                 <div
                                    className={cn(
                                       "w-10 h-10 rounded-xl flex items-center justify-center",
                                       habit.history.includes(
                                          new Date()
                                             .toISOString()
                                             .split(
                                                "T"
                                             )[0]
                                       )
                                          ? "bg-neon-purple text-white"
                                          : "bg-white text-slate-300"
                                    )}
                                 >
                                    <Flame size={20} />
                                 </div>

                                 <div>
                                    <p className="font-bold text-sm text-dark-navy">
                                       {habit.title}
                                    </p>

                                    <p className="text-xs text-slate-400 font-medium">
                                       {
                                          habit.streak
                                       }{" "}
                                       DAY STREAK
                                    </p>
                                 </div>
                              </div>
                           </div>
                        ))}

                     {habits.length === 0 && (
                        <button
                           onClick={() =>
                              navigate("/habits")
                           }
                           className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold"
                        >
                           Add your first habit
                        </button>
                     )}
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}