import secrets
import sqlite3
from flask import Flask, jsonify, make_response, render_template, request
from passlib.hash import bcrypt

app = Flask(__name__)

sessions = {}


#Cors headers
@app.after_request
def apply_cors(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = (
        "GET, POST, PUT, DELETE, OPTIONS"
    )
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response


@app.route("/", defaults={"path": ""}, methods=["OPTIONS"])
@app.route("/<path:path>", methods=["OPTIONS"])
def handle_options(path):
    return "", 200


class Database:

    def __init__(self, db_name="database.db"):
        self.db_name = db_name
        self.init_db()

    def get_connection(self):
        conn = sqlite3.connect(self.db_name)
        conn.row_factory = sqlite3.Row
        return conn

    def init_db(self):
        with self.get_connection() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    first_name TEXT NOT NULL,
                    last_name TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL
                )
            """)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS ideas (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    category TEXT NOT NULL,
                    estimated_cost REAL NOT NULL,
                    location TEXT NOT NULL,
                    notes TEXT
                )
            """)
            conn.commit()

    # user methods 
    def create_user(self, first_name, last_name, email, hashed_password):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)",
                (first_name, last_name, email, hashed_password),
            )
            conn.commit()
            return cursor.lastrowid

    def get_user_by_email(self, email):
        with self.get_connection() as conn:
            row = conn.execute(
                "SELECT * FROM users WHERE email = ?", (email,)
            ).fetchone()
            return dict(row) if row else None

    def get_user_by_id(self, user_id):
        with self.get_connection() as conn:
            row = conn.execute(
                "SELECT id, first_name, last_name, email FROM users WHERE id = ?",
                (user_id,),
            ).fetchone()
            return dict(row) if row else None

    #Idea methods
    def get_all(self):
        with self.get_connection() as conn:
            rows = conn.execute("SELECT * FROM ideas").fetchall()
            return [dict(row) for row in rows]

    def get_one(self, idea_id):
        with self.get_connection() as conn:
            row = conn.execute(
                "SELECT * FROM ideas WHERE id = ?", (idea_id,)
            ).fetchone()
            return dict(row) if row else None

    def create(self, title, category, estimated_cost, location, notes):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO ideas (title, category, estimated_cost, location, notes) VALUES (?, ?, ?, ?, ?)",
                (title, category, estimated_cost, location, notes),
            )
            conn.commit()
            return cursor.lastrowid

    def update(self, idea_id, title, category, estimated_cost, location, notes):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE ideas SET title=?, category=?, estimated_cost=?, location=?, notes=? WHERE id=?",
                (title, category, estimated_cost, location, notes, idea_id),
            )
            conn.commit()
            return cursor.rowcount > 0

    def delete(self, idea_id):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM ideas WHERE id = ?", (idea_id,))
            conn.commit()
            return cursor.rowcount > 0


db = Database()


def get_current_user():
    session_id = request.cookies.get("session_id")
    if not session_id or session_id not in sessions:
        return None
    user_id = sessions[session_id]["user_id"]
    return db.get_user_by_id(user_id)


@app.route("/")
def home():
    return render_template("index.html")


# auth
@app.route("/api/users", methods=["POST"])
def register():
    data = request.get_json() or {}
    required = ["first_name", "last_name", "email", "password"]
    if not all(data.get(field) for field in required):
        return jsonify({"error": "All fields are required."}), 400

    if db.get_user_by_email(data["email"]):
        return jsonify({"error": "Email is already registered."}), 409

    hashed_pw = bcrypt.hash(data["password"])
    user_id = db.create_user(
        data["first_name"], data["last_name"], data["email"], hashed_pw
    )
    return jsonify(db.get_user_by_id(user_id)), 201


@app.route("/api/sessions", methods=["POST"])
def login():
    data = request.get_json() or {}
    user = db.get_user_by_email(data.get("email", ""))

    if not user or not bcrypt.verify(data.get("password", ""), user["password"]):
        return jsonify({"error": "Invalid email or password."}), 401

    session_id = secrets.token_hex(16)
    sessions[session_id] = {"user_id": user["id"]}

    resp = make_response(
        jsonify({
            "id": user["id"],
            "first_name": user["first_name"],
            "last_name": user["last_name"],
            "email": user["email"],
        }),
        201,
    )
    resp.set_cookie("session_id", session_id, httponly=True, samesite="Lax")
    return resp


@app.route("/api/sessions", methods=["GET"])
def check_session():
    user = get_current_user()
    if not user:
        return jsonify({"error": "Not authenticated."}), 401
    return jsonify(user), 200


@app.route("/api/sessions", methods=["DELETE"])
def logout():
    session_id = request.cookies.get("session_id")
    if session_id in sessions:
        del sessions[session_id]
    resp = make_response(jsonify({"message": "Logged out successfully."}), 200)
    resp.delete_cookie("session_id")
    return resp


# protected idea
@app.route("/api/ideas", methods=["GET"])
def get_ideas():
    if not get_current_user():
        return jsonify({"error": "Unauthorized. Please log in."}), 401
    return jsonify(db.get_all()), 200


@app.route("/api/ideas/<int:idea_id>", methods=["GET"])
def get_idea(idea_id):
    if not get_current_user():
        return jsonify({"error": "Unauthorized. Please log in."}), 401
    idea = db.get_one(idea_id)
    if not idea:
        return jsonify({"error": f"Idea with ID {idea_id} not found."}), 404
    return jsonify(idea), 200


@app.route("/api/ideas", methods=["POST"])
def create_idea():
    if not get_current_user():
        return jsonify({"error": "Unauthorized. Please log in."}), 401
    data = request.get_json() or {}
    required = ["title", "category", "estimated_cost", "location"]
    if not all(field in data for field in required):
        return jsonify({"error": "Missing required attributes in request body"}), 400

    new_id = db.create(
        data["title"],
        data["category"],
        data["estimated_cost"],
        data["location"],
        data.get("notes", ""),
    )
    created = db.get_one(new_id)
    return jsonify(created), 201


@app.route("/api/ideas/<int:idea_id>", methods=["PUT"])
def update_idea(idea_id):
    if not get_current_user():
        return jsonify({"error": "Unauthorized. Please log in."}), 401
    data = request.get_json() or {}
    if not db.get_one(idea_id):
        return jsonify({"error": f"Idea with ID {idea_id} not found."}), 404

    db.update(
        idea_id,
        data.get("title"),
        data.get("category"),
        data.get("estimated_cost"),
        data.get("location"),
        data.get("notes", ""),
    )
    return jsonify(db.get_one(idea_id)), 200


@app.route("/api/ideas/<int:idea_id>", methods=["DELETE"])
def delete_idea(idea_id):
    if not get_current_user():
        return jsonify({"error": "Unauthorized. Please log in."}), 401
    if not db.delete(idea_id):
        return jsonify({"error": f"Idea with ID {idea_id} not found."}), 404
    return jsonify({"message": f"Idea {idea_id} deleted successfully."}), 200


@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Invalid route path or method."}), 404


if __name__ == "__main__":
    app.run(debug=True)
