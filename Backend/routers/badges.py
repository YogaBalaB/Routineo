from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from database import get_db
from auth_utils import get_current_user

router = APIRouter(prefix="/api/badges", tags=["Badges"])


# ─── Models ───────────────────────────────────────────────────────────────────

class EarnedBadge(BaseModel):
    id: str
    badgeId: str
    userId: str
    earnedAt: str


class BadgeAwardRequest(BaseModel):
    badgeId: str


# ─── Routes ───────────────────────────────────────────────────────────────────

@router.get("", response_model=List[EarnedBadge])
async def get_earned_badges(current_user: dict = Depends(get_current_user)):
    """
    Returns all badges earned by the current user.
    The frontend BADGES constant holds the full badge definitions;
    this endpoint only returns which ones the user has unlocked and when.
    """
    db = get_db()
    res = (
        db.table("earned_badges")
        .select("*")
        .eq("user_id", current_user["id"])
        .execute()
        .data
    )

    return [
        EarnedBadge(
            id=row["id"],
            badgeId=row["badge_id"],
            userId=row["user_id"],
            earnedAt=row["earned_at"],
        )
        for row in (res or [])
    ]


@router.post("", response_model=EarnedBadge)
async def award_badge(
    body: BadgeAwardRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Awards a badge to the current user (idempotent — safe to call multiple times).
    Call this from the frontend when the user meets a badge condition.
    """
    db = get_db()

    # Check if already earned — don't duplicate
    existing = (
        db.table("earned_badges")
        .select("*")
        .eq("user_id", current_user["id"])
        .eq("badge_id", body.badgeId)
        .execute()
        .data
    )
    if existing:
        row = existing[0]
        return EarnedBadge(
            id=row["id"],
            badgeId=row["badge_id"],
            userId=row["user_id"],
            earnedAt=row["earned_at"],
        )

    import uuid
    new_row = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "badge_id": body.badgeId,
        "earned_at": datetime.utcnow().isoformat() + "Z",
    }
    db.table("earned_badges").insert(new_row).execute()

    return EarnedBadge(
        id=new_row["id"],
        badgeId=new_row["badge_id"],
        userId=new_row["user_id"],
        earnedAt=new_row["earned_at"],
    )