-- SQL Schema for Supabase

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    due_date TEXT NOT NULL,
    priority TEXT DEFAULT 'medium',
    category TEXT DEFAULT 'General',
    notes TEXT,
    pinned BOOLEAN DEFAULT FALSE,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subtasks Table
CREATE TABLE IF NOT EXISTS subtasks (
    id TEXT PRIMARY KEY,
    task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TEXT,
    due_date TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habits Table
CREATE TABLE IF NOT EXISTS habits (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    icon TEXT DEFAULT 'Flame',
    category TEXT DEFAULT 'General',
    goal_days INTEGER DEFAULT 7,
    streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    missed_days INTEGER DEFAULT 0,
    last_check_in TEXT,
    history JSONB DEFAULT '[]'::jsonb
);

-- Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    duration INTEGER NOT NULL,
    type TEXT DEFAULT 'focus',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Moods Table
CREATE TABLE IF NOT EXISTS moods (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    mood TEXT NOT NULL,
    date TEXT NOT NULL,
    PRIMARY KEY (user_id, date)
);

-- Earned Badges Table
CREATE TABLE IF NOT EXISTS earned_badges (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    badge_id TEXT NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, badge_id)
);
