import uuid
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends
from models import Session, SessionCreate
from database import get_db
from auth_utils import get_current_user
from utils import check_badges

router = APIRouter(prefix="/api/sessions", tags=["Sessions"])

@router.get("", response_model=List[Session])
async def get_sessions(current_user: dict = Depends(get_current_user)):
    db = get_db()
    sessions = db.table("sessions").select("*").eq("user_id", current_user['id']).execute().data
    return sessions

@router.post("")
async def create_session(session: SessionCreate, current_user: dict = Depends(get_current_user)):
    db = get_db()
    session_id = str(uuid.uuid4())
    new_session = {
        **session.model_dump(by_alias=True),
        "id": session_id,
        "user_id": current_user['id'],
        "timestamp": datetime.utcnow().isoformat()
    }
    db.table("sessions").insert(new_session).execute()
    new_badges = check_badges(current_user['id'])
    return {**Session(**new_session).model_dump(), "newBadges": new_badges}
