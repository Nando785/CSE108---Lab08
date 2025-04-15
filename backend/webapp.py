from flask import Flask, jsonify, request
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from flask_cors import CORS, cross_origin
import sqlite3
from sqlite3 import Error

app = Flask(__name__)
app.secret_key = 'supersecretkey'  # Needed for session management
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True) # Allows requests from frontend

login_manager = LoginManager()
login_manager.init_app(app)

DB_FILE = "university.sqlite" # Database file name

class User(UserMixin):
    def __init__(self, id, role):
        self.id = id
        self.role = role

    def get_id(self):
        return str(self.id)

# Function for connecting to database
def openConnection(_dbFile):
    conn = None
    try:
        conn = sqlite3.connect(_dbFile)
        print("successfully opened connection")
    except Error as e:
        print(e)

    return conn

# Function for closing database connection
def closeConnection(_conn, _dbFile):
    
    try:
        _conn.close()
        print("successfully closed connection")
    except Error as e:
        print(e)
        
# == API CALL: ==    

@app.route('/user', methods=['POST'])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    conn = openConnection(DB_FILE)
    cursor = conn.cursor()

    user_type = None
    user_id = None

    cursor.execute('SELECT p_userkey FROM professors WHERE p_username = ? AND p_password = ?', (username, password))
    result = cursor.fetchone()
    if result:
        user_type = "professor"
        user_id = f"prof_{result[0]}"
    else:
        cursor.execute('SELECT s_userkey FROM students WHERE s_username = ? AND s_password = ?', (username, password))
        result = cursor.fetchone()
        if result:
            user_type = "student"
            user_id = f"stu_{result[0]}"

    closeConnection(conn, DB_FILE)

    if user_type:
        user = User(user_id, user_type)
        login_user(user)
        return jsonify({"status": "success", "role": user_type})
    else:
        return jsonify({"status": "fail"}), 401

@app.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({"status": "logged out"})

@login_manager.user_loader
def load_user(user_id):
    if user_id.startswith("prof_"):
        return User(user_id, "professor")
    elif user_id.startswith("stu_"):
        return User(user_id, "student")
    return None

@app.route('/current_user')
def get_current_user():
    if current_user.is_authenticated:
        user_id = current_user.get_id()
        role = current_user.role
        
        # Connect to database
        conn = openConnection(DB_FILE)
        lastName =  None
        firstName = None
        
        if role == "professor":
            # Remove 'prof_' prefix to get the professor's actual user key
            prof_id = user_id[5:]  # Remove 'prof_' from the start
            cursor = conn.cursor()
            cursor.execute('SELECT p_lastName, p_firstName FROM professors WHERE p_userkey = ?', (prof_id,))
            result = cursor.fetchone()
            if result:
                lastName = result[0]
                firstName = result[1]
        else:
            # Remove 'prof_' prefix to get the student's actual user key
            student_id = user_id[4:]  # Remove 'prof_' from the start
            cursor = conn.cursor()
            cursor.execute('SELECT s_lastName, s_firstName FROM students WHERE s_userkey = ?', (student_id,))
            result = cursor.fetchone()
            if result:
                lastName = result[0]
                firstName = result[1]
        
        return jsonify({"id": current_user.get_id(), "role": current_user.role, "firstName":firstName, "lastName":lastName})
    return jsonify({"status": "not authenticated"}), 401

@app.route('/profClasses', methods=['POST'])
def return_prof_classes():
    conn = openConnection(DB_FILE)
    requestData = request.get_json()
    
    if not requestData or 'profId' not in requestData:
        return jsonify({"error": "profId is required"}), 400
    
    with conn:
        cursor = conn.cursor('''SELECT c_name, c_teacher, c_time, c_enrollmentCnt, c_maxEnrollment 
                                    FROM courses
                                    JOIN professors
                                        ON p_userkey = c_userkey
                                    WHERE c_teacher = ?''', (requestData["profId"],))
        
        cursor.execute()
        data = cursor.fetchall()
        
    closeConnection(conn, DB_FILE)
    
    return(dict(data))


@app.route('/studentClasses', methods=['GET'])
def return_student_courses():
    conn = openConnection(DB_FILE)
    user_id = current_user.get_id()
    
    with conn:
        cursor = conn.cursor()
        user_id = user_id[4:]
        cursor.execute('''SELECT c_name, p_firstName, p_lastName, c_time, c_enrollmentCnt, c_maxEnrollment, cs_classKey
                                    FROM students
                                    JOIN courseStats
                                        ON cs_userKey = s_userkey
                                    JOIN courses
                                        ON c_classkey = cs_classkey
                                    JOIN professors
                                        ON c_teacherKey = p_userKey
                                    WHERE s_userKey = ?''', (user_id,))
        data = cursor.fetchall()
                    
    closeConnection(conn, DB_FILE)
    return jsonify(data)

@app.route('/allClasses', methods=['GET'])
def return_all_courses():
    conn = openConnection(DB_FILE)
    user_id = current_user.get_id()
    
    with conn:
        cursor = conn.cursor()
        cursor.execute('''SELECT c_name, p_firstName, p_lastName, c_time, c_enrollmentCnt, c_maxEnrollment, c_classKey
                            FROM courses
                            JOIN professors
                                ON c_teacherKey = p_userKey''')
        data = cursor.fetchall()
                    
    closeConnection(conn, DB_FILE)
    return jsonify(data)

@app.route('/addCourse', methods=['POST'])
def add_student_course():
    data = request.get_json()
    courseId = data['course']
    studentId = current_user.get_id()[4:]
    conn = openConnection(DB_FILE)
    with conn:
        cursor = conn.cursor()
        
        
        # Register student in class
        cursor.execute('''INSERT INTO courseStats
                            VALUES (?, ?, ?)''', (courseId, studentId, 0,))
        # Update course enrollment count
        cursor.execute('''UPDATE courses
                            SET c_enrollmentCnt = c_enrollmentCnt+1
                            WHERE c_classkey = ?''', (courseId,))
    
    closeConnection(conn, DB_FILE)
    return jsonify({'message': 'course added successfully'}), 200

@app.route('/removeCourse', methods=['POST'])
def remove_student_course():
    data = request.get_json()
    courseId = data['course']
    studentId = current_user.get_id()[4:]
    conn = openConnection(DB_FILE)
    with conn:
        cursor = conn.cursor()
        # Unregister student in class
        cursor.execute('''DELETE FROM courseStats
                            WHERE cs_classKey = ?
                            AND cs_userKey = ?''', (courseId, studentId,))
        # Update course enrollment count
        cursor.execute('''UPDATE courses
                            SET c_enrollmentCnt = c_enrollmentCnt-1
                            WHERE c_classkey = ?''', (courseId,))
    
    closeConnection(conn, DB_FILE)
    return jsonify({'message': 'course removes successfully'}), 200

if __name__ == '__main__':
    app.run(debug=True)
    