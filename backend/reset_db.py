#!/usr/bin/env python3
"""
Script to drop all tables and recreate them with the correct schema.
"""

import sys
import os

# Add the src directory to the path so we can import from it
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from sqlmodel import SQLModel
from src.database import engine
from src.config import settings

def main():
    print(f"Resetting database: {settings.DATABASE_URL}")
    print("WARNING: This will delete all existing data!")

    try:
        # Drop all tables
        print("Dropping all tables...")
        SQLModel.metadata.drop_all(engine)
        print("All tables dropped successfully!")

        # Create all tables with correct schema
        print("Creating tables with correct schema...")
        SQLModel.metadata.create_all(engine)
        print("All tables created successfully!")

    except Exception as e:
        print(f"Error resetting database: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
