import uuid
from typing import List
# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException
from models import SubTask, SubTaskCreate, SubTaskUpdate
from database import get_db
from auth_utils import get_current_user

router = APIRouter(prefix="/api/subtasks", tags=["Subtasks"])

@router.post("", response_model=SubTask, response_model_by_alias=False)
async def create_subtask(subtask: SubTaskCreate, task_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    # Verify task belongs to user
    task = db.table("tasks").select("*").eq("id", task_id).eq("user_id", current_user['id']).execute().data
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    subtask_id = str(uuid.uuid4())
    new_subtask = {
        **subtask.model_dump(by_alias=True),
        "id": subtask_id,
        "task_id": task_id
    }
    db.table("subtasks").insert(new_subtask).execute()
    return new_subtask

@router.patch("/{subtask_id}", response_model=SubTask, response_model_by_alias=False)
async def update_subtask(subtask_id: str, subtask_update: SubTaskUpdate, current_user: dict = Depends(get_current_user)):
    db = get_db()
    # Verify subtask belongs to a task owned by user
    # This requires a join or two steps.
    subtask_data = db.table("subtasks").select("*, tasks(user_id)").eq("id", subtask_id).execute().data
    if not subtask_data:
        raise HTTPException(status_code=404, detail="Subtask not found")
    
    # postgrest-python might return nested object for join
    task_user_id = subtask_data[0].get('tasks', {}).get('user_id')
    if task_user_id != current_user['id']:
        raise HTTPException(status_code=403, detail="Forbidden")

    update_data = {k: v for k, v in subtask_update.model_dump(by_alias=True).items() if v is not None}
    res = db.table("subtasks").update(update_data).eq("id", subtask_id).execute().data
    return res[0]

@router.delete("/{subtask_id}")
async def delete_subtask(subtask_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    # Check ownership
    subtask_data = db.table("subtasks").select("*, tasks(user_id)").eq("id", subtask_id).execute().data
    if not subtask_data:
        raise HTTPException(status_code=404, detail="Subtask not found")
    
    task_user_id = subtask_data[0].get('tasks', {}).get('user_id')
    if task_user_id != current_user['id']:
        raise HTTPException(status_code=403, detail="Forbidden")

    db.table("subtasks").delete().eq("id", subtask_id).execute()
    return {"status": "success"}
