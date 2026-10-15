
from flask import Flask, request, jsonify

app = Flask(__name__)

# Temporary storage: no database required
students = []
next_id = 1


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Student Information System API",
        "endpoints": [
            "GET /students",
            "GET /students/<id>",
            "POST /students",
            "PUT /students/<id>",
            "DELETE /students/<id>"
        ]
    })


# GET: View all students
@app.route("/students", methods=["GET"])
def get_students():
    return jsonify(students)


# GET: View one student
@app.route("/students/<int:student_id>", methods=["GET"])
def get_student(student_id):
    student = next(
        (s for s in students if s["id"] == student_id),
        None
    )

    if student is None:
        return jsonify({"error": "Student not found"}), 404

    return jsonify(student)


# POST: Add a student
@app.route("/students", methods=["POST"])
def add_student():
    global next_id

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Send a valid JSON object"}), 400

    required = ["name", "course", "year"]

    for field in required:
        if not isinstance(data.get(field), str) or not data[field].strip():
            return jsonify({
                "error": f"{field} is required"
            }), 400

    student = {
        "id": next_id,
        "name": data["name"].strip(),
        "course": data["course"].strip(),
        "year": data["year"].strip()
    }

    students.append(student)
    next_id += 1

    return jsonify({
        "message": "Student added successfully",
        "student": student
    }), 201


# PUT: Update a student
@app.route("/students/<int:student_id>", methods=["PUT"])
def update_student(student_id):
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Send a valid JSON object"}), 400

    student = next(
        (s for s in students if s["id"] == student_id),
        None
    )

    if student is None:
        return jsonify({"error": "Student not found"}), 404

    for field in ["name", "course", "year"]:
        if field in data:
            if not isinstance(data[field], str) or not data[field].strip():
                return jsonify({
                    "error": f"{field} cannot be empty"
                }), 400
            student[field] = data[field].strip()

    return jsonify({
        "message": "Student updated successfully",
        "student": student
    })


# DELETE: Remove a student
@app.route("/students/<int:student_id>", methods=["DELETE"])
def delete_student(student_id):
    student = next(
        (s for s in students if s["id"] == student_id),
        None
    )

    if student is None:
        return jsonify({"error": "Student not found"}), 404

    students.remove(student)

    return jsonify({
        "message": "Student deleted successfully"
    })


if __name__ == "__main__":
    app.run(debug=True, port=5000)
