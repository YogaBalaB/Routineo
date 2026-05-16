import os
from dotenv import load_dotenv
from postgrest import SyncPostgrestClient

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("SUPABASE_URL or SUPABASE_KEY not set in .env")

# ✅ Create ONE client at startup, reuse it everywhere
_headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}"
}
_db_client = SyncPostgrestClient(f"{SUPABASE_URL}/rest/v1", headers=_headers)

def get_db():
    return _db_client  # returns the same shared instance