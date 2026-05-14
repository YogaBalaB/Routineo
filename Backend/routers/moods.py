from datetime import date
from typing import List
from fastapi import APIRouter, Depends
from models import Mood, MoodCreate
from database import get_db
from auth_utils import get_current_user

router = APIRouter(prefix="/api/moods", tags=["Moods"])

@router.get("", response_model=List[Mood])
async def get_moods(current_user: dict = Depends(get_current_user)):
    db = get_db()
    moods = db.table("moods").select("*").eq("user_id", current_user['id']).execute().data
    return moods

@router.post("", response_model=Mood)
async def create_mood(mood: MoodCreate, current_user: dict = Depends(get_current_user)):
    db = get_db()
    today = date.today().isoformat()
    
    # Upsert mood
    db.table("moods").delete().eq("user_id", current_user['id']).eq("date", today).execute()
    
    new_mood = {
        "user_id": current_user['id'],
        "mood": mood.mood,
        "date": today
    }
    db.table("moods").insert(new_mood).execute()
    return new_mood
