from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, tasks, habits, sessions, moods, subtasks, badges
from database import get_db

# ✅ Define app FIRST
app = FastAPI(
    title="Routineo API",
    description="Backend API for Routineo Productivity App",
    version="1.0.0"
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
app.include_router(badges.router)

# ✅ Startup check AFTER app is defined
@app.on_event("startup")
async def startup_check():
    try:
        get_db().from_("tasks").select("id").limit(1).execute()
        print("✅ DB connection OK")
    except Exception as e:
        print(f"⚠️ DB connection issue: {e}")

@app.get("/")
async def root():
    return {"message": "Routineo API is running. Visit /docs for documentation."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)