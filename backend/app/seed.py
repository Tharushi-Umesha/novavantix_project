import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  # Add backend to path

from app.db import get_db
from app.models import User, Project, Task
from passlib.context import CryptContext
from sqlalchemy.orm import Session

# Set up password hashing with explicit bcrypt backend
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed(db: Session):
    # Seed users (passwords: admin@demo.test / Passw0rd!, alice@demo.test / AlicePass!, bob@demo.test / BobPass!)
    admin = User(
        name="Admin User",
        email="admin@demo.test",
        password_hash=pwd_context.hash("Passw0rd!"),
        role="admin",
        created_at=None  # Set to None since it's server_default in model
    )
    alice = User(
        name="Alice Smith",
        email="alice@demo.test",
        password_hash=pwd_context.hash("AlicePass!"),
        role="member",
        created_at=None
    )
    bob = User(
        name="Bob Johnson",
        email="bob@demo.test",
        password_hash=pwd_context.hash("BobPass!"),
        role="member",
        created_at=None
    )
    
    # Check if users already exist to avoid duplicates
    if not db.query(User).filter(User.email == admin.email).first():
        db.add(admin)
    if not db.query(User).filter(User.email == alice.email).first():
        db.add(alice)
    if not db.query(User).filter(User.email == bob.email).first():
        db.add(bob)
    
    db.commit()  # Ensure users are saved before querying IDs
    
    # Safely get user IDs, handling potential None results
    admin_user = db.query(User).filter(User.email == "admin@demo.test").first()
    alice_user = db.query(User).filter(User.email == "alice@demo.test").first()
    bob_user = db.query(User).filter(User.email == "bob@demo.test").first()

    if not admin_user or not alice_user or not bob_user:
        raise ValueError("One or more users not found after seeding. Check database connection or commit.")

    admin_id = admin_user.id
    alice_id = alice_user.id
    bob_id = bob_user.id
    
    # Seed 1 sample project
    sample_project_name = "Sample Project"
    existing_project = db.query(Project).filter(Project.name == sample_project_name).first()
    if not existing_project:
        sample_project = Project(
            name=sample_project_name,
            description="A demo project for testing tasks and roles.",
            created_at=None
        )
        db.add(sample_project)
        db.commit()
        project_id = sample_project.id
    else:
        project_id = existing_project.id
    
    # Seed a few tasks assigned to members
    tasks = [
        Task(project_id=project_id, title="Research API endpoints", status="todo", assignee_user_id=alice_id, due_date=None, created_at=None, updated_at=None, version=1),
        Task(project_id=project_id, title="Implement task CRUD", status="in_progress", assignee_user_id=bob_id, due_date=None, created_at=None, updated_at=None, version=1),
        Task(project_id=project_id, title="Add optimistic locking", status="done", assignee_user_id=alice_id, due_date=None, created_at=None, updated_at=None, version=1),
        Task(project_id=project_id, title="Review frontend integration", status="todo", assignee_user_id=bob_id, due_date=None, created_at=None, updated_at=None, version=1)
    ]
    
    for task in tasks:
        if not db.query(Task).filter(Task.title == task.title).first():
            db.add(task)
    
    db.commit()
    print("Seeding complete: Users and sample project/tasks added!")

if __name__ == "__main__":
    db_gen = get_db()
    db = next(db_gen)
    try:
        seed(db)
    finally:
        db.close()