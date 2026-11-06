import sqlite3
from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

# Server-Wide CORS Headers
@app.after_request
def apply_cors(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    return response

@app.route('/', defaults={'path': ''}, methods=['OPTIONS'])
@app.route('/<path:path>', methods=['OPTIONS'])
def handle_options(path):
    return "", 200

# Encapsulated Database Class
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

    def get_all(self):
        with self.get_connection() as conn:
            rows = conn.execute("SELECT * FROM ideas").fetchall()
            return [dict(row) for row in rows]

    def get_one(self, idea_id):
        with self.get_connection() as conn:
            row = conn.execute("SELECT * FROM ideas WHERE id = ?", (idea_id,)).fetchone()
            return dict(row) if row else None

    def create(self, title, category, estimated_cost, location, notes):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO ideas (title, category, estimated_cost, location, notes) VALUES (?, ?, ?, ?, ?)",
                (title, category, estimated_cost, location, notes)
            )
            conn.commit()
            return cursor.lastrowid

    def update(self, idea_id, title, category, estimated_cost, location, notes):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE ideas SET title=?, category=?, estimated_cost=?, location=?, notes=? WHERE id=?",
                (title, category, estimated_cost, location, notes, idea_id)
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

# Page Route
@app.route('/')
def home():
    return render_template("index.html")

# RESTful API Endpoints
@app.route('/api/ideas', methods=['GET'])
def get_ideas():
    return jsonify(db.get_all()), 200

@app.route('/api/ideas/<int:idea_id>', methods=['GET'])
def get_idea(idea_id):
    idea = db.get_one(idea_id)
    if not idea:
        return jsonify({"error": f"Idea with ID {idea_id} not found."}), 404
    return jsonify(idea), 200

@app.route('/api/ideas', methods=['POST'])
def create_idea():
    data = request.get_json() or {}
    required = ['title', 'category', 'estimated_cost', 'location']
    if not all(field in data for field in required):
        return jsonify({"error": "Missing required attributes in request body"}), 400
    
    new_id = db.create(data['title'], data['category'], data['estimated_cost'], data['location'], data.get('notes', ''))
    created = db.get_one(new_id)
    return jsonify(created), 201

@app.route('/api/ideas/<int:idea_id>', methods=['PUT'])
def update_idea(idea_id):
    data = request.get_json() or {}
    if not db.get_one(idea_id):
        return jsonify({"error": f"Idea with ID {idea_id} not found."}), 404

    db.update(idea_id, data.get('title'), data.get('category'), data.get('estimated_cost'), data.get('location'), data.get('notes', ''))
    return jsonify(db.get_one(idea_id)), 200

@app.route('/api/ideas/<int:idea_id>', methods=['DELETE'])
def delete_idea(idea_id):
    if not db.delete(idea_id):
        return jsonify({"error": f"Idea with ID {idea_id} not found."}), 404
    return jsonify({"message": f"Idea {idea_id} deleted successfully."}), 200

# Catch-all Invalid Route Error Handling
@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Invalid route path or method."}), 404

if __name__ == "__main__":
    app.run(debug=True)

