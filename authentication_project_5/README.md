# Project 5 - Authentication: Date Night Ideas

## Resources & Data Models

### 1. User (`users`)
- **Resource Name:** `User`
- **Attributes:**
  1. `id` (INTEGER PRIMARY KEY) - Unique identifier
  2. `first_name` (TEXT) - User's first name
  3. `last_name` (TEXT) - User's last name
  4. `email` (TEXT UNIQUE) - User's unique email address used for login
  5. `password` (TEXT) - Securely hashed password (plain-text password is never stored)

### 2. Date Night Idea (`ideas`) — *Protected Resource*
- **Resource Name:** `DateNightIdea`
- **Attributes:**
  1. `id` (INTEGER PRIMARY KEY) - Unique identifier
  2. `user_id` (INTEGER FOREIGN KEY) - ID of the user who owns the idea
  3. `title` (TEXT) - Name of the activity
  4. `category` (TEXT) - Type of date (e.g., Outdoor, Cozy, Foodie)
  5. `estimated_cost` (REAL) - Approximate cost in USD
  6. `location` (TEXT) - Where the date takes place
  7. `notes` (TEXT) - Extra descriptions or details

---

## Database Schema (SQLite)

```sql
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ideas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    estimated_cost REAL NOT NULL,
    location TEXT NOT NULL,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
