import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "focus-flow-secret-key";
const DB_PATH = path.join(process.cwd(), "db.json");

// Initialize database if it doesn't exist
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({
    users: [],
    tasks: [],
    habits: [],
    sessions: [],
    moods: [],
    earnedBadges: [] // Format: { userId, badgeId, earnedAt }
  }, null, 2));
}

const getDb = () => {
  const db = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
  // Ensure all tables exist
  db.users = db.users || [];
  db.tasks = db.tasks || [];
  db.habits = db.habits || [];
  db.sessions = db.sessions || [];
  db.moods = db.moods || [];
  db.earnedBadges = db.earnedBadges || [];

  // Sanitize data
  db.tasks.forEach((t: any) => {
    if (!t.subtasks) t.subtasks = [];
  });
  db.habits.forEach((h: any) => {
    if (!h.history) h.history = [];
    if (h.streak === undefined) h.streak = 0;
  });

  return db;
};
const saveDb = (db: any) => fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());



  // Helper for auth middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Access denied" });

    try {
      const verified = jwt.verify(token, JWT_SECRET);
      req.user = verified;
      next();
    } catch (err) {
      res.status(403).json({ error: "Invalid token" });
    }
  };

  // --- Auth Routes ---
  app.post("/api/auth/register", async (req, res) => {
    const { email, password, name } = req.body;
    const db = getDb();

    if (db.users.find((u: any) => u.email === email)) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: Date.now().toString(), email, password: hashedPassword, name };
    db.users.push(newUser);
    saveDb(db);

    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET);
    res.json({ token, user: { id: newUser.id, email: newUser.email, name: newUser.name } });
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const db = getDb();
    const user = db.users.find((u: any) => u.email === email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  });

  app.get("/api/auth/me", authenticateToken, (req: any, res: any) => {
    const db = getDb();
    const user = db.users.find((u: any) => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    const userBadges = db.earnedBadges.filter((b: any) => b.userId === req.user.id);
    res.json({ id: user.id, email: user.email, name: user.name, earnedBadges: userBadges });
  });

  // --- Badge Routes ---
  app.get("/api/badges", authenticateToken, (req: any, res: any) => {
    const db = getDb();
    const userBadges = db.earnedBadges.filter((b: any) => b.userId === req.user.id);
    res.json(userBadges);
  });

  const checkBadges = (userId: string) => {
    const db = getDb();
    const userTasks = db.tasks.filter((t: any) => t.userId === userId);
    const userHabits = db.habits.filter((h: any) => h.userId === userId);
    const userSessions = db.sessions.filter((s: any) => s.userId === userId);
    const userBadges = db.earnedBadges.filter((b: any) => b.userId === userId);

    const newBadges: string[] = [];
    const earnedIds = new Set(userBadges.map((b: any) => b.badgeId));

    const checkAndAdd = (id: string, condition: boolean) => {
      if (condition && !earnedIds.has(id)) {
        const earnedAt = new Date().toISOString();
        db.earnedBadges.push({ userId, badgeId: id, earnedAt });
        newBadges.push(id);
      }
    };

    // 1. First Spark: Complete 1 focus session
    checkAndAdd("first-spark", userSessions.some((s: any) => s.type === "focus"));

    // 2. Week Warrior: 7-day streak
    checkAndAdd("week-warrior", userHabits.some((h: any) => h.streak >= 7));

    // 3. Habit Hero: Complete all habits for 3 days
    if (userHabits.length > 0) {
      const dates = new Set<string>();
      userHabits.forEach((h: any) => h.history.forEach((d: string) => dates.add(d)));
      const sortedDates = Array.from(dates).sort();
      let consecutiveDays = 0;
      let maxConsecutive = 0;

      for (let i = 0; i < sortedDates.length; i++) {
        const allDone = userHabits.every((h: any) => h.history.includes(sortedDates[i]));
        if (allDone) {
          if (i > 0) {
            const prev = new Date(sortedDates[i - 1]);
            const curr = new Date(sortedDates[i]);
            const diff = (curr.getTime() - prev.getTime()) / (1000 * 3600 * 24);
            if (diff === 1) consecutiveDays++;
            else consecutiveDays = 1;
          } else {
            consecutiveDays = 1;
          }
        } else {
          consecutiveDays = 0;
        }
        maxConsecutive = Math.max(maxConsecutive, consecutiveDays);
      }
      checkAndAdd("habit-hero", maxConsecutive >= 3);
    }

    // 4. Focus Master: 10 hours total
    const totalMinutes = userSessions.filter((s: any) => s.type === "focus").reduce((acc: number, s: any) => acc + s.duration, 0);
    checkAndAdd("focus-master", totalMinutes >= 600);

    // 5. Unstoppable: 30-day streak
    checkAndAdd("unstoppable", userHabits.some((h: any) => h.streak >= 30));

    // 6. Early Bird: Start before 8 AM
    checkAndAdd("early-bird", userSessions.some((s: any) => {
      const hour = new Date(s.timestamp).getHours();
      return hour < 8;
    }));

    // 7. Night Owl: After 10 PM
    checkAndAdd("night-owl", userSessions.some((s: any) => {
      const hour = new Date(s.timestamp).getHours();
      return hour >= 22;
    }));

    // 8. Perfect Week: All habits for 7 days
    if (userHabits.length > 0) {
      const dates = new Set<string>();
      userHabits.forEach((h: any) => h.history.forEach((d: string) => dates.add(d)));
      const sortedDates = Array.from(dates).sort();
      let consecutiveDays = 0;
      let maxConsecutive = 0;

      for (let i = 0; i < sortedDates.length; i++) {
        const allDone = userHabits.every((h: any) => h.history.includes(sortedDates[i]));
        if (allDone) {
          if (i > 0) {
            const prev = new Date(sortedDates[i - 1]);
            const curr = new Date(sortedDates[i]);
            const diff = (curr.getTime() - prev.getTime()) / (1000 * 3600 * 24);
            if (diff === 1) consecutiveDays++;
            else consecutiveDays = 1;
          } else {
            consecutiveDays = 1;
          }
        } else {
          consecutiveDays = 0;
        }
        maxConsecutive = Math.max(maxConsecutive, consecutiveDays);
      }
      checkAndAdd("perfect-week", maxConsecutive >= 7);
    }

    if (newBadges.length > 0) {
      saveDb(db);
    }
    return newBadges;
  };

  // --- Task Routes ---
  app.get("/api/tasks", authenticateToken, (req: any, res: any) => {
    const db = getDb();
    const userTasks = db.tasks.filter((t: any) => t.userId === req.user.id);
    res.json(userTasks);
  });

  app.get("/api/tasks/:id", authenticateToken, (req: any, res: any) => {
    const db = getDb();
    const task = db.tasks.find((t: any) => t.id === req.params.id && t.userId === req.user.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  });

  app.post("/api/tasks", authenticateToken, (req: any, res: any) => {
    const db = getDb();
    const newTask = {
      id: Date.now().toString(),
      userId: req.user.id,
      title: req.body.title,
      dueDate: req.body.dueDate,
      priority: req.body.priority || "medium",
      category: req.body.category || "General",
      notes: req.body.notes || "",
      subtasks: req.body.subtasks || [],
      pinned: req.body.pinned || false,
      completed: false,
      createdAt: new Date().toISOString()
    };
    db.tasks.push(newTask);
    saveDb(db);
    res.json(newTask);
  });

  app.patch("/api/tasks/:id", authenticateToken, (req: any, res: any) => {
    const db = getDb();
    const taskIndex = db.tasks.findIndex((t: any) => t.id === req.params.id && t.userId === req.user.id);
    if (taskIndex === -1) return res.status(404).json({ error: "Task not found" });

    db.tasks[taskIndex] = { ...db.tasks[taskIndex], ...req.body };
    saveDb(db);
    res.json(db.tasks[taskIndex]);
  });

  app.delete("/api/tasks/bulk", authenticateToken, (req: any, res: any) => {
    const db = getDb();
    const ids = req.body.ids;
    if (!Array.isArray(ids)) return res.status(400).json({ error: "Ids must be an array" });
    db.tasks = db.tasks.filter((t: any) => !(ids.includes(t.id) && t.userId === req.user.id));
    saveDb(db);
    res.status(204).send();
  });

  app.delete("/api/tasks/:id", authenticateToken, (req: any, res: any) => {
    const db = getDb();
    db.tasks = db.tasks.filter((t: any) => !(t.id === req.params.id && t.userId === req.user.id));
    saveDb(db);
    res.status(204).send();
  });

  // --- Habit Routes ---
  app.get("/api/habits", authenticateToken, (req: any, res: any) => {
    const db = getDb();
    const userHabits = db.habits.filter((h: any) => h.userId === req.user.id);
    res.json(userHabits);
  });

  app.post("/api/habits", authenticateToken, (req: any, res: any) => {
    const db = getDb();
    const newHabit = {
      id: Date.now().toString(),
      userId: req.user.id,
      title: req.body.title,
      icon: req.body.icon || "Flame",
      category: req.body.category || "General",
      goalDays: req.body.goalDays || 7,
      streak: 0,
      longestStreak: 0,
      missedDays: 0,
      lastCheckIn: null,
      history: [] // Array of dates
    };
    db.habits.push(newHabit);
    saveDb(db);
    res.json(newHabit);
  });

  app.patch("/api/habits/:id", authenticateToken, (req: any, res: any) => {
    const db = getDb();
    const habitIndex = db.habits.findIndex((h: any) => h.id === req.params.id && h.userId === req.user.id);
    if (habitIndex === -1) return res.status(404).json({ error: "Habit not found" });

    db.habits[habitIndex] = { ...db.habits[habitIndex], ...req.body };
    saveDb(db);
    const newBadges = checkBadges(req.user.id);
    res.json({ ...db.habits[habitIndex], newBadges });
  });

  app.delete("/api/habits/bulk", authenticateToken, (req: any, res: any) => {
    const db = getDb();
    const ids = req.body.ids;
    if (!Array.isArray(ids)) return res.status(400).json({ error: "Ids must be an array" });
    db.habits = db.habits.filter((h: any) => !(ids.includes(h.id) && h.userId === req.user.id));
    saveDb(db);
    res.status(204).send();
  });

  app.delete("/api/habits/:id", authenticateToken, (req: any, res: any) => {
    const db = getDb();
    db.habits = db.habits.filter((h: any) => !(h.id === req.params.id && h.userId === req.user.id));
    saveDb(db);
    res.status(204).send();
  });

  app.post("/api/habits/:id/checkin", authenticateToken, (req: any, res: any) => {
    const db = getDb();
    const habit = db.habits.find((h: any) => h.id === req.params.id && h.userId === req.user.id);
    if (!habit) return res.status(404).json({ error: "Habit not found" });

    const today = new Date().toISOString().split('T')[0];
    if (!habit.history.includes(today)) {
      habit.history.push(today);

      const lastCheck = habit.lastCheckIn;
      if (lastCheck) {
        const lastDate = new Date(lastCheck);
        const diff = Math.floor((new Date(today).getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

        if (diff === 1) {
          habit.streak += 1;
        } else if (diff > 1) {
          habit.missedDays += (diff - 1);
          habit.streak = 1;
        }
      } else {
        habit.streak = 1;
      }

      if (habit.streak > (habit.longestStreak || 0)) {
        habit.longestStreak = habit.streak;
      }

      habit.lastCheckIn = today;
      saveDb(db);
      const newBadges = checkBadges(req.user.id);
      res.json({ ...habit, newBadges });
    } else {
      res.json(habit);
    }
  });

  app.post("/api/habits/:id/reset-streak", authenticateToken, (req: any, res: any) => {
    const db = getDb();
    const habit = db.habits.find((h: any) => h.id === req.params.id && h.userId === req.user.id);
    if (!habit) return res.status(404).json({ error: "Habit not found" });

    habit.streak = 0;
    habit.lastCheckIn = null;
    saveDb(db);
    res.json(habit);
  });

  app.post("/api/habits/:id/undo-checkin", authenticateToken, (req: any, res: any) => {
    const db = getDb();
    const habit = db.habits.find((h: any) => h.id === req.params.id && h.userId === req.user.id);
    if (!habit) return res.status(404).json({ error: "Habit not found" });

    const today = new Date().toISOString().split('T')[0];
    if (habit.history.includes(today)) {
      habit.history = habit.history.filter((d: string) => d !== today);
      if (habit.lastCheckIn === today) {
        // Simple streak decrement
        habit.streak = Math.max(0, habit.streak - 1);

        // Find the previous check-in date in history to restore lastCheckIn
        const previousCheckIns = habit.history
          .filter((d: string) => d < today)
          .sort((a: string, b: string) => b.localeCompare(a));

        habit.lastCheckIn = previousCheckIns.length > 0 ? previousCheckIns[0] : null;
      }
      saveDb(db);
    }
    res.json(habit);
  });

  // --- Session (Study Timer) Routes ---
  app.get("/api/sessions", authenticateToken, (req: any, res: any) => {
    const db = getDb();
    const userSessions = db.sessions.filter((s: any) => s.userId === req.user.id);
    res.json(userSessions);
  });

  app.post("/api/sessions", authenticateToken, (req: any, res: any) => {
    const db = getDb();
    const newSession = {
      id: Date.now().toString(),
      userId: req.user.id,
      duration: req.body.duration, // in minutes
      type: req.body.type || "focus",
      timestamp: new Date().toISOString()
    };
    db.sessions.push(newSession);
    saveDb(db);
    const newBadges = checkBadges(req.user.id);
    res.json({ ...newSession, newBadges });
  });

  // --- Mood Routes ---
  app.get("/api/moods", authenticateToken, (req: any, res: any) => {
    const db = getDb();
    const userMoods = db.moods.filter((m: any) => m.userId === req.user.id);
    res.json(userMoods);
  });

  app.post("/api/moods", authenticateToken, (req: any, res: any) => {
    const db = getDb();
    const today = new Date().toISOString().split('T')[0];

    // Replace today's mood if it exists
    db.moods = db.moods.filter((m: any) => !(m.userId === req.user.id && m.date === today));

    const newMood = {
      userId: req.user.id,
      mood: req.body.mood, // emoji or label
      date: today
    };
    db.moods.push(newMood);
    saveDb(db);
    res.json(newMood);
  });

  // --- Proxy Routes for Swagger API Docs ---
  app.get("/docs", async (req, res) => {
    const backendUrl = process.env.VITE_API_URL || "http://localhost:8000";
    try {
      const response = await fetch(`${backendUrl}/docs`);
      const body = await response.text();
      res.send(body);
    } catch (err: any) {
      res.status(500).send("Error proxying docs: " + err.message);
    }
  });

  app.get("/openapi.json", async (req, res) => {
    const backendUrl = process.env.VITE_API_URL || "http://localhost:8000";
    try {
      const response = await fetch(`${backendUrl}/openapi.json`);
      const body = await response.json();
      res.json(body);
    } catch (err: any) {
      res.status(500).send("Error proxying openapi.json: " + err.message);
    }
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
