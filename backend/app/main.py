from dotenv import load_dotenv
import os
import logging
import time
from datetime import datetime, timedelta
from typing import List, Literal, Optional
from fastapi import FastAPI, Depends, HTTPException, status, Form, Header, Query
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from passlib.context import CryptContext
from .db import get_db, Base, engine
from .models import User, Project, Task
from .schemas import UserCreate, UserResponse, ProjectCreate, ProjectResponse, TaskCreate, TaskUpdate, TaskResponse

load_dotenv("../.env")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(pathname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow your frontend origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Middleware for logging requests
@app.middleware("http")
async def log_requests(request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.info(f"{request.method} {request.url.path} - Status: {response.status_code} - Time: {process_time:.2f}s")
    return response

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
print("ACCESS_TOKEN_EXPIRE_MINUTES:", os.getenv("JWT_EXPIRATION_MINUTES"))
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY not set in .env")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRATION_MINUTES", 1440))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    current_time = datetime.utcnow()
    print("Token creation UTC time:", current_time)
    if expires_delta:
        expire = current_time + expires_delta
        print("Calculated expiration:", expire)
    else:
        expire = current_time + timedelta(minutes=15)
        print("Default expiration:", expire)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM) # type: ignore
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM]) # type: ignore
        email: str = payload.get("sub") # type: ignore
        if email is None or not isinstance(email, str):
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

@app.post("/auth/login")
async def login(email: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    logger.info("Login attempt for email: %s", email)
    user = db.query(User).filter(User.email == email).first()
    if not user or not pwd_context.verify(password, user.password_hash): # type: ignore
        logger.warning("Failed login attempt for email: %s", email)
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    logger.info("Login successful for email: %s", email)
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/auth/signup", response_model=UserResponse, status_code=201)
async def signup(user: UserCreate, db: Session = Depends(get_db)):
    logger.info("Signup attempt for email: %s", user.email)
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        logger.warning("Duplicate email signup attempt: %s", user.email)
        raise HTTPException(status_code=400, detail="Email already registered")
    if user.role == "admin":
        raise HTTPException(status_code=403, detail="Only admins can assign admin roles via a different endpoint")
    hashed_password = pwd_context.hash(user.password)
    db_user = User(name=user.name, email=user.email, password_hash=hashed_password, role=user.role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    logger.info("User created: %s", db_user.id)
    return db_user

@app.get("/projects", response_model=List[ProjectResponse])
async def get_projects(q: Optional[str] = Query(None), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == "member": # type: ignore
        query = db.query(Project).join(Task).filter(Task.assignee_user_id == current_user.id).distinct()
    else:
        query = db.query(Project)
    if q and q.strip():  # Apply filter only if q is non-empty
        query = query.filter(Project.name.ilike(f"%{q.strip()}%"))
    projects = query.all()
    if not projects:
        raise HTTPException(status_code=404, detail="No projects found")
    logger.info(f"Projects fetched for {current_user.email}: {[p.name for p in projects]}")
    return projects

@app.post("/projects", response_model=ProjectResponse, status_code=201)
async def create_project(project: ProjectCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "admin": # type: ignore
        raise HTTPException(status_code=403, detail="Admin only")
    db_project = Project(**project.dict())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@app.get("/projects/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if current_user.role == "member" and not db.query(Task).filter(Task.project_id == project_id, Task.assignee_user_id == current_user.id).first(): # type: ignore
        raise HTTPException(status_code=403, detail="Access denied")
    return project

@app.put("/projects/{project_id}", response_model=ProjectResponse)
async def update_project(project_id: int, project: ProjectCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "admin": # type: ignore
        raise HTTPException(status_code=403, detail="Admin only")
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    for key, value in project.dict().items():
        setattr(db_project, key, value)
    db.commit()
    db.refresh(db_project)
    return db_project

@app.delete("/projects/{project_id}", status_code=204)
async def delete_project(project_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "admin": # type: ignore
        raise HTTPException(status_code=403, detail="Admin only")
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(db_project)
    db.commit()

@app.get("/projects/{project_id}/tasks", response_model=List[TaskResponse])
async def get_project_tasks(project_id: int, status: Optional[Literal["todo", "in_progress", "done"]] = Query(None), assignee: Optional[int] = Query(None), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    query = db.query(Task).filter(Task.project_id == project_id)
    if current_user.role == "member": # type: ignore
        query = query.filter(Task.assignee_user_id == current_user.id)
    
    if status:
        query = query.filter(Task.status == status)
    if assignee:
        if current_user.role != "admin": # type: ignore
            raise HTTPException(status_code=403, detail="Admin only for assignee filter")
        query = query.filter(Task.assignee_user_id == assignee)
    
    tasks = query.all()
    return tasks

@app.post("/projects/{project_id}/tasks", response_model=TaskResponse, status_code=201)
async def create_task(project_id: int, task: TaskCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if task.assignee_user_id and current_user.role != "admin": # type: ignore
        raise HTTPException(status_code=403, detail="Only admins can assign to others")
    
    assignee_id = task.assignee_user_id or current_user.id
    assignee = db.query(User).filter(User.id == assignee_id).first()
    if not assignee:
        raise HTTPException(status_code=404, detail="Assignee not found")
    
    db_task = Task(project_id=project_id, **task.dict(), assignee_user_id=assignee_id, version=1)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@app.patch("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(task_id: int, task_update: TaskUpdate, if_match: Optional[str] = Header(None), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if current_user.role == "member" and db_task.assignee_user_id != current_user.id: # type: ignore
        raise HTTPException(status_code=403, detail="Can only update own tasks")
    
    if task_update.assignee_user_id and current_user.role != "admin": # type: ignore
        raise HTTPException(status_code=403, detail="Only admins can reassign tasks")
    
    # Optimistic locking
    client_version = task_update.version or (int(if_match) if if_match else None)
    if client_version is None or client_version != db_task.version:
        raise HTTPException(status_code=409, detail="Stale version - conflict detected")
    
    for key, value in task_update.dict(exclude_unset=True).items():
        if key != "version":
            setattr(db_task, key, value)
    db_task.version += 1 # type: ignore
    db_task.updated_at = func.now() # type: ignore
    db.commit()
    db.refresh(db_task)
    return db_task

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    return {"status": "OK"}

@app.get("/protected")
async def protected_route(current_user: User = Depends(get_current_user)):
    return {"message": "Protected data", "user_role": current_user.role}