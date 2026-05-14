import uuid
from datetime import date
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from models import Habit, HabitCreate, HabitUpdate
from database import get_db
from auth_utils import get_current_user
from utils import check_badges

router = APIRouter(prefix="/api/habits", tags=["Habits"])

@router.get("", response_model=List[Habit], response_model_by_alias=False)
async def get_habits(current_user: dict = Depends(get_current_user)):
    db = get_db()
    res = db.table("habits").select("*").eq("user_id", current_user['id']).execute().data
    return [Habit(**h) for h in res]

@router.post("", response_model=Habit)
async def create_habit(habit: HabitCreate, current_user: dict = Depends(get_current_user)):
    db = get_db()
    habit_id = str(uuid.uuid4())
    new_habit = {
        **habit.model_dump(by_alias=True),
        "id": habit_id,
        "user_id": current_user['id'],
        "streak": 0,
        "longest_streak": 0,
        "missed_days": 0,
        "history": []
    }
    db.table("habits").insert(new_habit).execute()
    return Habit(**new_habit)

@router.post("/{habit_id}/checkin")
async def checkin_habit(habit_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    habit = db.table("habits").select("*").eq("id", habit_id).eq("user_id", current_user['id']).execute().data
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    habit = habit[0]
    today = date.today().isoformat()
    history = habit.get('history', [])
    
    if today not in history:
        history.append(today)
        streak = habit['streak']
        last_check = habit.get('last_check_in')
        
        if last_check:
            last_date = date.fromisoformat(last_check)
            diff = (date.today() - last_date).days
            if diff == 1:
                streak += 1
            else:
                streak = 1
        else:
            streak = 1
            
        longest = max(streak, habit['longest_streak'])
        
        update = {
            "history": history,
            "streak": streak,
            "longest_streak": longest,
            "last_check_in": today
        }
        db.table("habits").update(update).eq("id", habit_id).execute()
        new_badges = check_badges(current_user['id'])
        return {**habit, **update, "newBadges": new_badges}
    
    return habit

from pydantic import BaseModel

class BulkDeleteRequest(BaseModel):
    ids: List[str]

@router.delete("/bulk")
async def delete_habits_bulk(request: BulkDeleteRequest, current_user: dict = Depends(get_current_user)):
    db = get_db()
    db.table("habits").delete().in_("id", request.ids).eq("user_id", current_user['id']).execute()
    return {"status": "success"}

@router.delete("/{habit_id}")
async def delete_habit(habit_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    db.table("habits").delete().eq("id", habit_id).eq("user_id", current_user['id']).execute()
    return {"status": "success"}
