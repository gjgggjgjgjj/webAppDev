import json
import os
from flask import Flask, jsonify, render_template, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

FILE_PATH = "messages.json"


def getIdeas():
  if not os.path.exists(FILE_PATH):
    return []
  with open(FILE_PATH, "r") as file:
    try:
      return json.load(file)
    except json.JSONDecodeError:
      return []


def writeIdeas(new_idea):
  if not new_idea or not str(new_idea).strip():
    return False

  #read existing array or default to empty list
  ideaList = getIdeas()

  #append new idea
  ideaList.append(new_idea.strip())

  #overwrite file with updated array
  with open(FILE_PATH, "w") as file:
    json.dump(ideaList, file, indent=2)

  return True


# routes -----------------------------------------------------
@app.route("/")
def home():
  return render_template("index.html")


@app.route("/messages", methods=["GET"])
def webGetterIdeas():
  leIdeasList = getIdeas()
  return jsonify(leIdeasList), 200


@app.route("/messages", methods=["POST"])
def webPostIdeas():
  data = request.get_json(silent=True) or {}
  usInputIdeas = data.get("idea")

  if not usInputIdeas:
    return jsonify({"error": "No idea provided"}), 400

  writeIdeas(usInputIdeas)

  return "", 201


@app.errorhandler(404)
def not_found(e):
  return (
      "404 Not Found: The requested route does not exist on this server.",
      404,
  )


# main -------------------------------------------------
if __name__ == "__main__":
  app.run(debug=True)
