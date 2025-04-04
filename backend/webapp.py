from flask import Flask, jsonify, request
# from flask_login import current_user, login_user
from flask_cors import CORS
import sqlite3
from sqlite3 import Error

app = Flask(__name__)
CORS(app)  # Allows requests from frontend
DB_FILE = "university.sqlite" # Database file name

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
# POST/user
# Input: Username and Password
# Return: T/F whether use exists in database
@app.route('/user', methods = ['POST'])
def returnExistance():
    data = request.json
    username = data.get("username")
    password = data.get("password")
    
    conn = openConnection(DB_FILE)
    
    with conn:
        cursor = conn.cursor()
        
        # Get username and password if exists
        cursor.execute('''SELECT COUNT(*) 
                            FROM professors
                            WHERE p_username = ? AND p_password = ?
                        UNION
                            SELECT COUNT(*)
                            FROM students
                            WHERE s_username = ? AND s_password = ?''', (username, password, username, password))
        data = cursor.fetchall()
        
    closeConnection(conn, DB_FILE)
    
    # Return data as JSON
    return jsonify(1 if data and any(count > 0 for count, in data) else 0)        

if __name__ == '__main__':
    app.run(debug=True)