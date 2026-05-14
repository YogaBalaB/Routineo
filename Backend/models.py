from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import List, Optional
from datetime import datetime

# --- Common Config ---
class AppModel(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        serialize_by_alias=False
    )

# --- Auth Models ---
class UserBase(AppModel):
    email: EmailStr = Field(..., description="The user's email address")
    name: str = Field(..., description="The user's full name")

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, description="User password (min 6 chars)")

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: str
    earnedBadges: List[dict] = Field(default_factory=list)

class Token(BaseModel):
    token: str
    token_type: str = "bearer"
    user: UserResponse

# --- Task Models ---
class SubTaskBase(AppModel):
    title: str = Field(..., min_length=1)
    completed: bool = False

class SubTaskCreate(SubTaskBase):
    pass

class SubTaskUpdate(AppModel):
    title: Optional[str] = None
    completed: Optional[bool] = None

class SubTask(SubTaskBase):
    id: str
    taskId: str = Field(..., alias="task_id")

class TaskBase(AppModel):
    title: str = Field(..., min_length=1)
    dueDate: str = Field(..., alias="due_date")
    priority: str = Field("medium", pattern="^(low|medium|high)$")
    category: str = "General"
    notes: Optional[str] = ""
    pinned: bool = False
    completed: bool = False

class TaskCreate(TaskBase):
    subtasks: Optional[List[SubTaskCreate]] = Field(default_factory=list)

class TaskUpdate(AppModel):
    title: Optional[str] = None
    dueDate: Optional[str] = Field(None, alias="due_date")
    priority: Optional[str] = None
    category: Optional[str] = None
    notes: Optional[str] = None
    subtasks: Optional[List[SubTask]] = None
    pinned: Optional[bool] = None
    completed: Optional[bool] = None

class Task(TaskBase):
    id: str
    userId: str = Field(..., alias="user_id")
    createdAt: str = Field(..., alias="created_at")
    subtasks: List[SubTask] = Field(default_factory=list)

# --- Habit Models ---
class HabitBase(AppModel):
    title: str = Field(..., min_length=1)
    icon: str = "Flame"
    category: str = "General"
    goalDays: int = Field(7, alias="goal_days", ge=1)

class HabitCreate(HabitBase):
    pass

class HabitUpdate(AppModel):
    title: Optional[str] = None
    icon: Optional[str] = None
    category: Optional[str] = None
    goalDays: Optional[int] = Field(None, alias="goal_days")
    streak: Optional[int] = None
    longestStreak: Optional[int] = Field(None, alias="longest_streak")
    missedDays: Optional[int] = Field(None, alias="missed_days")
    lastCheckIn: Optional[str] = Field(None, alias="last_check_in")
    history: Optional[List[str]] = None

class Habit(HabitBase):
    id: str
    userId: str = Field(..., alias="user_id")
    streak: int = 0
    longestStreak: int = Field(0, alias="longest_streak")
    missedDays: int = Field(0, alias="missed_days")
    lastCheckIn: Optional[str] = Field(None, alias="last_check_in")
    history: List[str] = Field(default_factory=list)

# --- Session Models ---
class SessionBase(AppModel):
    duration: int = Field(..., ge=1, description="Duration in minutes")
    type: str = Field("focus", pattern="^(focus|break)$")

class SessionCreate(SessionBase):
    pass

class Session(SessionBase):
    id: str
    userId: str = Field(..., alias="user_id")
    timestamp: str

# --- Mood Models ---
class MoodBase(AppModel):
    mood: str = Field(..., description="Emoji or mood label")

class MoodCreate(MoodBase):
    pass

class Mood(MoodBase):
    userId: str = Field(..., alias="user_id")
    date: str

# --- Badge Models ---
class BadgeEarned(AppModel):
    userId: str = Field(..., alias="user_id")
    badgeId: str = Field(..., alias="badge_id")
    earnedAt: str = Field(..., alias="earned_at")
