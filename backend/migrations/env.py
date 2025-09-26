import os
from dotenv import load_dotenv
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context
from app.models import Base  # Adjust path if your models file is elsewhere

# Load environment variables from .env
load_dotenv("../.env")

# This is the Alembic Config object, which provides access to the values within the .ini file.
config = context.config

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Set the target metadata to your models' metadata for autogenerate support
target_metadata = Base.metadata

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL and not an Engine.
    """
    # Get the DATABASE_URL from the environment
    url = os.getenv("DATABASE_URL")
    if url is None:
        raise ValueError("DATABASE_URL environment variable not set. Check your .env file.")

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine and associate a connection with the context.
    """
    # Get the DATABASE_URL from the environment
    db_url = os.getenv("DATABASE_URL")
    if db_url is None:
        raise ValueError("DATABASE_URL environment variable not set. Check your .env file.")

    # Use a minimal configuration dictionary with the URL from .env
    connectable = engine_from_config(
        {"sqlalchemy.url": db_url},  # Pass a dictionary with the URL
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()