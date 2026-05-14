import os
from dotenv import load_dotenv
from postgrest import SyncPostgrestClient
import httpx

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Warning: SUPABASE_URL or SUPABASE_KEY not found in environment variables.")

def get_db():
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }
    client = SyncPostgrestClient(f"{SUPABASE_URL}/rest/v1", headers=headers)
    return client

# Helper for Supabase Auth (simplified)
def get_auth_url():
    return f"{SUPABASE_URL}/auth/v1"
