CREATE TABLE students(
    s_userkey    integer PRIMARY KEY AUTOINCREMENT, -- Student Unique Identifier
    s_firstName   text NOT NULL,                    -- Student First Name
    s_lastName    text NOT NULL,                    -- Student Last Name
    s_username    text NOT NULL,                    -- Student Username
    s_password    text NOT NULL                     -- Student Password
);

CREATE TABLE professors(
    p_userkey    integer PRIMARY KEY AUTOINCREMENT, -- Professor Unique Idenfitier
    p_firstName   text NOT NULL,                    -- Professor First Name
    p_lastName    text NOT NULL,                    -- Professor Last Name
    p_username    text NOT NULL,                    -- Professor Username
    p_password    text NOT NULL                     -- Professor Password
);

CREATE TABLE admins(
    a_userkey    integer PRIMARY KEY AUTOINCREMENT, -- Admin Unique Identifier
    a_firstName   text NOT NULL,                    -- Admin First Name
    a_lastName    text NOT NULL,                    -- Admin Last Name
    a_username    text NOT NULL,                    -- Admin Username
    a_password    text NOT NULL                     -- Admin Password
);

CREATE TABLE courses(
    c_classkey    integer PRIMARY KEY AUTOINCREMENT,    -- Class Unique Identifier
    c_name        text NOT NULL,                        -- Class Name (CSE 120, CSE 108, etc.)
    c_teacherkey     integer NOT NULL,                  -- Class Teacher (Using Their Unique Identifier)
    c_time        text NOT NULL,                        -- Class Time (TR 3:00-3:50 PM, MWF 2:00-2:50 PM)
    c_enrollmentCnt    integer NOT NULL,                -- Class Current Enrollment Count
    c_maxEnrollment   integer NOT NULL                  -- Class Max Enrollment Count
);

CREATE TABLE courseStats(
    cs_classkey        integer NOT NULL,                -- Class Unique Identifier
    cs_userkey     integer NOT NULL,                    -- Student Unique Identifier
    cs_grade        integer NOT NULL                    -- Student Class Grade
);

-- Mock Info for Testing *Debug*
INSERT into students values (1001, 'Jane', 'Smith', 'student', 'password');
INSERT into students values (1002, 'Emily', 'Davis', 'student1', 'password1');
INSERT into professors values (2001, 'John', 'Doe', 'professor', 'password');
INSERT into professors values (2002, 'David', 'Miller', 'professor1', 'password1');
INSERT into admins values (4001, 'Peter', 'Griffin', 'admin', 'password');

INSERT into courses values (3001, 'CSE 108', 2001, 'MWF 2:00-2:50 PM', 0, 10);
INSERT into courses values (3002, 'CSE 120', 2001, 'TR 11:00-11:50 AM', 0, 10);
INSERT into courses values (3003, 'CSE 031', 2002, 'MWF 9:00-10:50 AM', 0, 1);
--INSERT into courseStats values (3001, 1002, 90);

DELETE FROM courseStats WHERE cs_userkey = 1002 AND cs_classkey = 3002;

-- Table Deletion *Debug*
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS professors;
DROP TABLE IF EXISTS courses;
DROP TABLE  IF EXISTS courseStats;
DROP TABLE  IF EXISTS admins;