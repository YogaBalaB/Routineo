from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, tasks, habits, sessions, moods, subtasks
from contextlib import asynccontextmanager
from database import get_db
from auth_utils import get_password_hash
import uuid

@asynccontextmanager
async def lifespan(app: FastAPI):
    db = get_db()
    try:
        # Check if demo user exists
        res = db.table("users").select("*").eq("email", "demo@focusflow.com").execute().data
        if not res:
            print("Seeding demo user...")
            demo_id = str(uuid.uuid4())
            db.table("users").insert({
                "id": demo_id,
                "email": "demo@focusflow.com",
                "password": get_password_hash("password123"),
                "name": "Demo Student"
            }).execute()
    except Exception as e:
        print(f"Startup error: {e}")
    yield

app = FastAPI(
    title="FocusFlow API",
    description="Backend API for FocusFlow Productivity App",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(subtasks.router)
app.include_router(habits.router)
app.include_router(sessions.router)
app.include_router(moods.router)

@app.get("/")
async def root():
    return {"message": "FocusFlow API is running. Visit /docs for documentation."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
