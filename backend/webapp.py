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
    print("Close database: ", _dbFile)
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
        return jsonify({"id": current_user.get_id(), "role": current_user.role})
    return jsonify({"status": "not authenticated"}), 401

if __name__ == '__main__':
    app.run(debug=True)