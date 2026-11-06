# Project 4 - Resourceful: Date Night Ideas

## Resource & Data Model
- **Resource Name:** `DateNightIdea`
- **Attributes:**
  1. `id` (INTEGER PRIMARY KEY) - Unique identifier
  2. `title` (TEXT) - Name of the activity
  3. `category` (TEXT) - Type of date (e.g., Outdoor, Cozy, Foodie)
  4. `estimated_cost` (REAL) - Approximate cost in USD
  5. `location` (TEXT) - Where the date takes place
  6. `notes` (TEXT) - Extra descriptions or details

## Database Schema (SQLite)
```sql
CREATE TABLE IF NOT EXISTS ideas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    estimated_cost REAL NOT NULL,
    location TEXT NOT NULL,
    notes TEXT
);

<!-- didn't even know you could do stuff in md lol but that's what ai helps let you know what you can do -->
