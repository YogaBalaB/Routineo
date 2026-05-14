from datetime import datetime
from database import get_db

def check_badges(user_id: str):
    db = get_db()
    
    # Fetch user data
    tasks = db.table("tasks").select("*").eq("user_id", user_id).execute().data
    habits = db.table("habits").select("*").eq("user_id", user_id).execute().data
    sessions = db.table("sessions").select("*").eq("user_id", user_id).execute().data
    earned = db.table("earned_badges").select("badge_id").eq("user_id", user_id).execute().data
    
    earned_ids = {b['badge_id'] for b in earned}
    new_badges = []

    def add_badge(badge_id: str, condition: bool):
        if condition and badge_id not in earned_ids:
            db.table("earned_badges").insert({
                "user_id": user_id,
                "badge_id": badge_id,
                "earned_at": datetime.utcnow().isoformat()
            }).execute()
            new_badges.append(badge_id)

    # 1. First Spark: 1 focus session
    add_badge("first-spark", any(s['type'] == 'focus' for s in sessions))

    # 2. Week Warrior: 7-day streak
    add_badge("week-warrior", any(h['streak'] >= 7 for h in habits))

    # 3. Decade Driver: 10-day streak
    add_badge("decade-driver", any(h['streak'] >= 10 for h in habits))

    # 4. Focus Master: 10 hours (600 mins)
    total_min = sum(s['duration'] for s in sessions if s['type'] == 'focus')
    add_badge("focus-master", total_min >= 600)

    # 5. Unstoppable: 30-day streak
    add_badge("unstoppable", any(h['streak'] >= 30 for h in habits))

    return new_badges
