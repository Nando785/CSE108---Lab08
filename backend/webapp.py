from flask import Flask, jsonify, request
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from flask_cors import CORS, cross_origin
import sqlite3
from sqlite3 import Error

# Flask Admin Imports
from flask_sqlalchemy import SQLAlchemy
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from flask import redirect, url_for
import hashlib
import os

app = Flask(__name__)
app.secret_key = 'supersecretkey'  # Needed for session management
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'university.sqlite')
db = SQLAlchemy(app)

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

class Professor(db.Model):
    __tablename__ = 'professors'    
    p_userkey = db.Column(db.Integer, primary_key=True)
    p_username = db.Column(db.String)
    p_password = db.Column(db.String)
    p_firstName = db.Column(db.String)
    p_lastName = db.Column(db.String)

class Student(db.Model):
    __tablename__ = 'students'
    s_userkey = db.Column(db.Integer, primary_key=True)
    s_username = db.Column(db.String)
    s_password = db.Column(db.String)
    s_firstName = db.Column(db.String)
    s_lastName = db.Column(db.String)

class Course(db.Model):
    __tablename__ = 'courses'
    c_classKey = db.Column(db.Integer, primary_key=True)
    c_name = db.Column(db.String)
    c_teacherKey = db.Column(db.Integer)
    c_time = db.Column(db.String)
    c_enrollmentCnt = db.Column(db.Integer)
    c_maxEnrollment = db.Column(db.Integer)

class AdminModelView(ModelView):
    def is_accessible(self):
        return current_user.is_authenticated and current_user.role == "admin"
    
    def inaccessible_callback(self, name, **kwargs):
        return redirect(url_for('login'))
    
    column_formatters = {
        'p_password': lambda v, c, m, p: hashlib.sha256(str(m.p_userkey).encode()).hexdigest()[:10],
    }

admin = Admin(app, name='University Admin', template_mode='bootstrap3')

with app.app_context():
    db.create_all()  # Only creates tables if they don't exist, doesn't overwrite
    admin.add_view(AdminModelView(Professor, db.session))
    admin.add_view(AdminModelView(Student, db.session))
    admin.add_view(AdminModelView(Course, db.session))

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
        
# == API CALLS: ==    

@app.route('/user', methods=['POST'])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    conn = openConnection(DB_FILE)
    cursor = conn.cursor()

    user_type = None
    user_id = None

    # Check professors
    cursor.execute('SELECT p_userkey FROM professors WHERE p_username = ? AND p_password = ?', (username, password))
    result = cursor.fetchone()
    if result:
        user_type = "professor"
        user_id = f"prof_{result[0]}"
    else:
        # Check students
        cursor.execute('SELECT s_userkey FROM students WHERE s_username = ? AND s_password = ?', (username, password))
        result = cursor.fetchone()
        if result:
            user_type = "student"
            user_id = f"stu_{result[0]}"
        else:
            # Check admins
            cursor.execute('SELECT a_userkey FROM admins WHERE a_username = ? AND a_password = ?', (username, password))
            result = cursor.fetchone()
            if result:
                user_type = "admin"
                user_id = f"admin_{result[0]}"
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
    elif user_id.startswith("admin_"):
        return User(user_id, "admin")
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
    user_id = current_user.get_id()
    
    with conn:
        cursor = conn.cursor()
        user_id = user_id[5:]
        cursor.execute('''SELECT c_name, p_firstName, p_lastName, c_time, c_enrollmentCnt, c_maxEnrollment, c_classKey
                                    FROM courses
                                    JOIN professors
                                        on c_teacherKey = p_userKey
                                    WHERE c_teacherKey = ?''', (user_id,))
        data = cursor.fetchall()
                    
    closeConnection(conn, DB_FILE)
    return jsonify(data)

@app.route('/profEdit', methods=['POST'])
def edit_student_grade():
    conn = openConnection(DB_FILE)
    user_id = current_user.get_id()
    data = request.get_json()
    class_id = data['class_id']
    print(data)
    
    with conn:
        cursor = conn.cursor()
        user_id = user_id[5:]
        cursor.execute(''' SELECT s_firstName, s_lastName, cs_grade, c_name, s_userKey
                                FROM students
                                JOIN courseStats
                                    ON cs_userKey = s_userKey
                                JOIN courses
                                    ON cs_classkey = c_classKey
                                WHERE cs_classKey = ?''', (class_id,))
        data = cursor.fetchall()
                    
    closeConnection(conn, DB_FILE)
    return jsonify(data)

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

        # Check if class is full
        cursor.execute('SELECT c_enrollmentCnt, c_maxEnrollment FROM courses WHERE c_classkey = ?', (courseId,))
        result = cursor.fetchone()
        # print("Result: ", result)
        # print("Current enrollment for class ", courseId, ": ", result[0], ". Max: ", result[1])
        if result and result[0] >= result[1]:
            # closeConnection(conn, DB_FILE)
            return jsonify({'message': 'Class is full'}), 400  # Return error
        
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

@app.route('/updateGrade', methods=['POST'])
def update_grade():
    conn = openConnection(DB_FILE)
    data = request.get_json()
    class_id = data['class_id']
    student_id = data['student_id']
    new_grade = data['newGrade']
    
    with conn:
        cursor = conn.cursor()
        cursor.execute('''UPDATE courseStats 
                            SET cs_grade = ?
                            WHERE cs_classKey = ?
                                AND cs_userKey = ?''', (new_grade, class_id, student_id,))
        data = cursor.fetchall()
    
    print("updated student id ", student_id, " grade in class ", class_id, " to new grade ", new_grade)
    closeConnection(conn, DB_FILE)
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
    