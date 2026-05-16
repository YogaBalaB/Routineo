from datetime import datetime
from database import get_db

def check_badges(user_id: str):
    db = get_db()

    # ✅ Only fetch the columns we actually need
    habits  = db.table("habits").select("streak").eq("user_id", user_id).execute().data
    sessions = db.table("sessions").select("type, duration").eq("user_id", user_id).execute().data
    earned  = db.table("earned_badges").select("badge_id").eq("user_id", user_id).execute().data

    earned_ids = {b['badge_id'] for b in earned}
    new_badges = []

    # Pre-compute values once (not inside each add_badge call)
    max_streak   = max((h['streak'] for h in habits), default=0)
    total_focus  = sum(s['duration'] for s in sessions if s['type'] == 'focus')
    has_focus    = any(s['type'] == 'focus' for s in sessions)

    badge_checks = [
        ("first-spark",    has_focus),
        ("week-warrior",   max_streak >= 7),
        ("decade-driver",  max_streak >= 10),
        ("focus-master",   total_focus >= 600),
        ("unstoppable",    max_streak >= 30),
    ]

    # ✅ Batch insert all new badges in ONE call instead of one per badge
    for badge_id, condition in badge_checks:
        if condition and badge_id not in earned_ids:
            new_badges.append(badge_id)

    if new_badges:
        db.table("earned_badges").insert([
            {
                "user_id": user_id,
                "badge_id": badge_id,
                "earned_at": datetime.utcnow().isoformat()
            }
            for badge_id in new_badges
        ]).execute()

    return new_badges