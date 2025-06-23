# server.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import json
import uuid
from pathlib import Path

app = FastAPI()

# Настройки CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Модели данных
class Task(BaseModel):
    id: Optional[str] = None
    icon: str
    title: str
    reward: str
    rewardAmount: int
    link: str
    completed: Optional[bool] = False
    type: str  # 'in-game' или 'partners'

class ReferralData(BaseModel):
    ref_code: str
    invited_count: int
    earned: int

class WithdrawRequest(BaseModel):
    user_id: str
    telegram_username: str
    gift_id: int
    gift_name: str
    gift_price: int
    status: str = "pending"  # pending, completed, rejected


# Файлы для хранения данных
TASKS_FILE = Path("tasks.json")
REFERRALS_FILE = Path("referrals.json")
WITHDRAWS_FILE = Path("withdraws.json")

# Загрузка данных из файла
def load_tasks() -> List[Task]:
    if not TASKS_FILE.exists():
        return []
    with open(TASKS_FILE, "r", encoding="utf-8") as f:
        return [Task(**task) for task in json.load(f)]

def load_referrals() -> Dict[str, ReferralData]:
    if not REFERRALS_FILE.exists():
        return {}
    with open(REFERRALS_FILE, "r", encoding="utf-8") as f:
        return {k: ReferralData(**v) for k, v in json.load(f).items()}

def load_withdraws() -> List[WithdrawRequest]:
    if not WITHDRAWS_FILE.exists():
        return []
    with open(WITHDRAWS_FILE, "r", encoding="utf-8") as f:
        return [WithdrawRequest(**w) for w in json.load(f)]

# Сохранение данных в файл
def save_tasks(tasks: List[Task]):
    with open(TASKS_FILE, "w", encoding="utf-8") as f:
        json.dump([task.dict() for task in tasks], f, ensure_ascii=False, indent=2)

def save_referrals(referrals: Dict[str, ReferralData]):
    with open(REFERRALS_FILE, "w", encoding="utf-8") as f:
        json.dump({k: v.dict() for k, v in referrals.items()}, f, ensure_ascii=False, indent=2)

def save_withdraws(withdraws: List[WithdrawRequest]):
    with open(WITHDRAWS_FILE, "w", encoding="utf-8") as f:
        json.dump([w.dict() for w in withdraws], f, ensure_ascii=False, indent=2)

# Генерация реферального кода
def generate_ref_code():
    return str(uuid.uuid4()).replace("-", "")[:12]

# API endpoints
@app.get("/api/tasks", response_model=List[Task])
async def get_tasks():
    return load_tasks()

@app.post("/api/tasks", response_model=Task)
async def create_task(task: Task):
    tasks = load_tasks()
    task.id = str(uuid.uuid4())
    tasks.append(task)
    save_tasks(tasks)
    return task

@app.delete("/api/tasks/{task_id}")
async def delete_task(task_id: str):
    tasks = load_tasks()
    updated_tasks = [t for t in tasks if t.id != task_id]
    if len(updated_tasks) == len(tasks):
        raise HTTPException(status_code=404, detail="Task not found")
    save_tasks(updated_tasks)
    return {"message": "Task deleted successfully"}

# Реферальные endpoints
@app.post("/api/generate_ref")
async def generate_ref(user_id: str):
    referrals = load_referrals()
    
    if user_id not in referrals:
        ref_code = generate_ref_code()
        referrals[user_id] = {
            "ref_code": ref_code,
            "invited_count": 0,
            "earned": 0
        }
        save_referrals(referrals)
    
    return {"ref_code": referrals[user_id]["ref_code"]}

@app.get("/api/referral_stats")
async def get_referral_stats(user_id: str):
    referrals = load_referrals()
    if user_id not in referrals:
        raise HTTPException(status_code=404, detail="User not found")
    
    return referrals[user_id]

# Withdraw endpoints
@app.post("/api/create_withdraw")
async def create_withdraw(withdraw: WithdrawRequest):
    withdraws = load_withdraws()
    withdraw_id = str(uuid.uuid4())
    withdraw_dict = withdraw.dict()
    withdraw_dict["id"] = withdraw_id
    withdraws.append(WithdrawRequest(**withdraw_dict))
    save_withdraws(withdraws)
    
    # Здесь будет вызов функции для отправки уведомления в телеграм
    # В реальном коде нужно раскомментировать и настроить
    # await send_withdraw_notification(withdraw_dict)
    
    return {"status": "success", "withdraw_id": withdraw_id}

@app.get("/api/withdraws", response_model=List[WithdrawRequest])
async def get_withdraws():
    return load_withdraws()

@app.post("/api/update_withdraw_status")
async def update_withdraw_status(withdraw_id: str, status: str):
    withdraws = load_withdraws()
    for w in withdraws:
        if w.id == withdraw_id:
            w.status = status
            save_withdraws(withdraws)
            return {"status": "success"}
    raise HTTPException(status_code=404, detail="Withdraw not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3001)