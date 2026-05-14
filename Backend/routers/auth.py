import uuid
from fastapi import APIRouter, HTTPException, Depends
from models import UserCreate, UserLogin, Token, UserResponse
from database import get_db
from auth_utils import get_password_hash, verify_password, create_access_token, decode_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
async def register(user_data: UserCreate):
    db = get_db()
    existing = db.table("users").select("*").eq("email", user_data.email).execute().data
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user_data.password)
    
    new_user = {
        "id": user_id,
        "email": user_data.email,
        "password": hashed_password,
        "name": user_data.name
    }
    db.table("users").insert(new_user).execute()
    
    token = create_access_token({"id": user_id, "email": user_data.email})
    return {
        "token": token,
        "token_type": "bearer",
        "user": {**new_user, "earnedBadges": []}
    }

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    db = get_db()
    user = db.table("users").select("*").eq("email", credentials.email).execute().data
    if not user or not verify_password(credentials.password, user[0]['password']):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    user = user[0]
    badges = db.table("earned_badges").select("*").eq("user_id", user['id']).execute().data
    
    token = create_access_token({"id": user['id'], "email": user['email']})
    return {
        "token": token,
        "token_type": "bearer",
        "user": {
            "id": user['id'],
            "email": user['email'],
            "name": user['name'],
            "earnedBadges": badges
        }
    }

@router.get("/me", response_model=UserResponse)
async def me(current_user: dict = Depends(get_current_user)):
    db = get_db()
    user = db.table("users").select("*").eq("id", current_user['id']).execute().data
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = user[0]
    badges = db.table("earned_badges").select("*").eq("user_id", user['id']).execute().data
    return {
        "id": user['id'],
        "email": user['email'],
        "name": user['name'],
        "earnedBadges": badges
    }
