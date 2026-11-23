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
```

---

## REST API Endpoints

### Authentication & Users
| Endpoint Name | Path | HTTP Method | Description |
| :--- | :--- | :--- | :--- |
| Register User | `/api/users` | `POST` | Creates a new user after verifying email uniqueness and hashing the password. |
| Log In (Create Session) | `/api/sessions` | `POST` | Authenticates user credentials, stores session in memory, and sets a session cookie. |
| Check Session | `/api/sessions` | `GET` | Verifies if the current session cookie is valid and returns basic user info. |
| Log Out (Delete Session) | `/api/sessions` | `DELETE` | Removes the user's session from the in-memory store and clears the session cookie. |

### Date Night Ideas *(Requires Authentication)*
| Endpoint Name | Path | HTTP Method | Description |
| :--- | :--- | :--- | :--- |
| List All Ideas | `/api/ideas` | `GET` | Retrieves all date night ideas for the logged-in user (returns `401` if unauthenticated). |
| Get Single Idea | `/api/ideas/<id>` | `GET` | Retrieves a specific idea by ID (returns `401` if unauthenticated). |
| Create Idea | `/api/ideas` | `POST` | Creates a new date night idea (returns `401` if unauthenticated). |
| Update Idea | `/api/ideas/<id>` | `PUT` | Updates an existing date night idea by ID (returns `401` if unauthenticated). |
| Delete Idea | `/api/ideas/<id>` | `DELETE` | Deletes a date night idea by ID (returns `401` if unauthenticated). |

---

## Password Hashing Method & Parameters

- **Library & Algorithm:** `BCrypt` via Python's `passlib.hash.bcrypt` (backed by `bcrypt==4.0.1`)
- **Hash Format / Identifier:** `$2b$` (Modular Crypt Format)
- **Cost Factor (Rounds):** `12` rounds (default Passlib `bcrypt` work factor, performing $2^{12}$ key-expansion iterations)
- **Salt:** Automatically generated 128-bit (16-byte) cryptographically random salt per password, encoded as 22 Base64 characters inside the resulting hash string
