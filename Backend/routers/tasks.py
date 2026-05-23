import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from models import Task, TaskCreate, TaskUpdate
from database import get_db
from auth_utils import get_current_user

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


class BulkDeleteRequest(BaseModel):
    ids: List[str]


def utcnow_iso() -> str:
    """Returns current UTC time as ISO string with Z suffix so JS parses it correctly."""
    return datetime.utcnow().isoformat() + "Z"


@router.get("", response_model=List[Task], response_model_by_alias=False)
async def get_tasks(current_user: dict = Depends(get_current_user)):
    db = get_db()
    res = db.table("tasks").select("*, subtasks(*)").eq("user_id", current_user['id']).execute().data
    return [Task(**t) for t in res]


@router.post("", response_model=Task, response_model_by_alias=False)
async def create_task(task: TaskCreate, current_user: dict = Depends(get_current_user)):
    db = get_db()
    task_id = str(uuid.uuid4())
    subtasks_data = task.subtasks or []

    task_data = task.model_dump(by_alias=True, exclude={"subtasks"})
    task_data.update({
        "id": task_id,
        "user_id": current_user['id'],
        # ✅ Z suffix so JS new Date() parses correctly in all browsers
        "created_at": utcnow_iso()
    })

    db.table("tasks").insert(task_data).execute()

    # ✅ Batch insert all subtasks in ONE call instead of N separate calls
    created_subtasks = []
    if subtasks_data:
        subtask_rows = []
        for st in subtasks_data:
            st_id = str(uuid.uuid4())
            row = {
                **st.model_dump(by_alias=True),
                "id": st_id,
                "task_id": task_id,
                "created_at": utcnow_iso()
            }
            subtask_rows.append(row)
            created_subtasks.append({**st.model_dump(), "id": st_id, "taskId": task_id})
        db.table("subtasks").insert(subtask_rows).execute()

    return {**Task(**task_data).model_dump(), "subtasks": created_subtasks}


# ✅ /bulk MUST be defined BEFORE /{task_id} to avoid route conflict
@router.delete("/bulk")
async def delete_tasks_bulk(
    request: BulkDeleteRequest,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    db.table("tasks").delete().in_("id", request.ids).eq("user_id", current_user['id']).execute()
    return {"status": "success"}


@router.get("/{task_id}", response_model=Task, response_model_by_alias=False)
async def get_task(task_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    res = (
        db.table("tasks")
        .select("*, subtasks(*)")
        .eq("id", task_id)
        .eq("user_id", current_user['id'])
        .execute()
        .data
    )
    if not res:
        raise HTTPException(status_code=404, detail="Task not found")
    return Task(**res[0])


@router.patch("/{task_id}", response_model=Task, response_model_by_alias=False)
async def update_task(
    task_id: str,
    task_update: TaskUpdate,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()

    update_dict = task_update.model_dump(by_alias=True, exclude_unset=True)
    subtasks = update_dict.pop("subtasks", None)

    if update_dict:
        res = (
            db.table("tasks")
            .update(update_dict)
            .eq("id", task_id)
            .eq("user_id", current_user['id'])
            .execute()
            .data
        )
        if not res:
            raise HTTPException(status_code=404, detail="Task not found")

    # ✅ Batch: 1 delete + 1 insert instead of N inserts
    if subtasks is not None:
        db.table("subtasks").delete().eq("task_id", task_id).execute()
        subtask_rows = [
            {
                "id":           st.get("id") or str(uuid.uuid4()),
                "task_id":      task_id,
                "title":        st.get("title", ""),
                "completed":    st.get("completed", False),
                # ✅ Ensure completedAt stored with Z if it's a datetime
                "completed_at": _ensure_z(st.get("completedAt") or st.get("completed_at")),
                # due_date stays as YYYY-MM-DD (date only — no timezone needed)
                "due_date":     st.get("dueDate") or st.get("due_date"),
                "created_at":   _ensure_z(
                    st.get("createdAt") or st.get("created_at") or utcnow_iso()
                ),
            }
            for st in subtasks
        ]
        if subtask_rows:
            db.table("subtasks").insert(subtask_rows).execute()

    updated = (
        db.table("tasks")
        .select("*, subtasks(*)")
        .eq("id", task_id)
        .execute()
        .data
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Task not found")
    return Task(**updated[0])


@router.delete("/{task_id}")
async def delete_task(task_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    db.table("tasks").delete().eq("id", task_id).eq("user_id", current_user['id']).execute()
    return {"status": "success"}


# ── Helpers ───────────────────────────────────────────────────────────────────

def _ensure_z(dt_str: Optional[str]) -> Optional[str]:
    """Adds Z suffix to datetime strings that lack a timezone marker."""
    if not dt_str:
        return dt_str
    # Date-only strings (YYYY-MM-DD) don't need Z
    if len(dt_str) == 10:
        return dt_str
    if not dt_str.endswith("Z") and "+" not in dt_str:
        return dt_str + "Z"
    return dt_str