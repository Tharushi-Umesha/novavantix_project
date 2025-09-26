from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, EmailStr, validator

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "member"  # Default to member; admins can be seeded or added manually

    @validator('name')
    def name_not_empty(cls, v):
        if not v.strip():
            raise ValueError('Name cannot be empty')
        return v

    @validator('password')
    def password_not_empty(cls, v):
        if not v.strip():
            raise ValueError('Password cannot be empty')
        return v

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: Literal["admin", "member"]
    created_at: datetime

    class Config:
        orm_mode = True

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    created_at: datetime

    class Config:
        orm_mode = True

class TaskCreate(BaseModel):
    title: str
    status: Literal["todo", "in_progress", "done"] = "todo"
    due_date: Optional[datetime] = None
    assignee_user_id: Optional[int] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[Literal["todo", "in_progress", "done"]] = None
    due_date: Optional[datetime] = None
    assignee_user_id: Optional[int] = None
    version: Optional[int] = None

class TaskResponse(BaseModel):
    id: int
    project_id: int
    title: str
    status: Literal["todo", "in_progress", "done"]
    assignee_user_id: int
    due_date: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]
    version: int

    class Config:
        orm_mode = True