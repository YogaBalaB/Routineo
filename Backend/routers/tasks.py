import uuid
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from models import Task, TaskCreate, TaskUpdate
from database import get_db
from auth_utils import get_current_user

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])

@router.get("", response_model=List[Task], response_model_by_alias=False)
async def get_tasks(current_user: dict = Depends(get_current_user)):
    db = get_db()
    res = db.table("tasks").select("*, subtasks(*)").eq("user_id", current_user['id']).execute().data
    return [Task(**t) for t in res]

@router.post("", response_model=Task)
async def create_task(task: TaskCreate, current_user: dict = Depends(get_current_user)):
    db = get_db()
    task_id = str(uuid.uuid4())
    
    # Extract subtasks if any
    subtasks_data = task.subtasks or []
    
    task_data = task.model_dump(by_alias=True, exclude={"subtasks"})
    task_data.update({
        "id": task_id,
        "user_id": current_user['id'],
        "created_at": datetime.utcnow().isoformat()
    })
    
    db.table("tasks").insert(task_data).execute()
    
    # Insert subtasks
    created_subtasks = []
    for st in subtasks_data:
        st_id = str(uuid.uuid4())
        st_dict = {
            **st.model_dump(by_alias=True),
            "id": st_id,
            "task_id": task_id
        }
        db.table("subtasks").insert(st_dict).execute()
        created_subtasks.append({**st.model_dump(), "id": st_id, "taskId": task_id})
    
    return {**Task(**task_data).model_dump(), "subtasks": created_subtasks}

@router.patch("/{task_id}", response_model=Task)
async def update_task(task_id: str, task_update: TaskUpdate, current_user: dict = Depends(get_current_user)):
    db = get_db()
    update_data = {k: v for k, v in task_update.model_dump(by_alias=True).items() if v is not None}
    res = db.table("tasks").update(update_data).eq("id", task_id).eq("user_id", current_user['id']).execute().data
    if not res:
        raise HTTPException(status_code=404, detail="Task not found")
    return res[0]

from pydantic import BaseModel

class BulkDeleteRequest(BaseModel):
    ids: List[str]

@router.delete("/bulk")
async def delete_tasks_bulk(request: BulkDeleteRequest, current_user: dict = Depends(get_current_user)):
    db = get_db()
    db.table("tasks").delete().in_("id", request.ids).eq("user_id", current_user['id']).execute()
    return {"status": "success"}

@router.delete("/{task_id}")
async def delete_task(task_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    db.table("tasks").delete().eq("id", task_id).eq("user_id", current_user['id']).execute()
    return {"status": "success"}
