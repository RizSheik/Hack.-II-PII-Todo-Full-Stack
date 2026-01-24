#!/usr/bin/env python3
"""
Script to initialize the database by creating all required tables.
"""

import sys
import os

# Add the src directory to the path so we can import from it
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from src.database import init_db
from src.config import settings

def main():
    print(f"Initializing database: {settings.DATABASE_URL}")
    try:
        init_db()
        print("Database initialized successfully!")
        print("All tables have been created.")
    except Exception as e:
        print(f"Error initializing database: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()