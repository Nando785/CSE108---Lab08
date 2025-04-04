-- table containing student info
CREATE TABLE students(
    s_userkey    integer PRIMARY KEY AUTOINCREMENT, -- student keys begin with 1XXX
    s_name        text NOT NULL,
    s_username    text NOT NULL,
    s_password    text NOT NULL
);

-- table containing professor info
CREATE TABLE professors(
    p_userkey    integer PRIMARY KEY AUTOINCREMENT, -- professor keys begin with 2XXX
    p_name        text NOT NULL,
    p_username    text NOT NULL,
    p_password    text NOT NULL
);

-- table containing course info
CREATE TABLE courses(
    c_classkey    integer PRIMARY KEY AUTOINCREMENT,    -- class keys begin with 3XXX
    c_name        text NOT NULL,
    c_teacher     text NOT NULL,
    c_time        text NOT NULL,
    c_enrollmenCnt    integer NOT NULL
);

-- table relating courses to students, and storing corresponding grades
CREATE TABLE courseStats(
    cs_classkey        integer NOT NULL,
    cs_userkey     integer NOT NULL,
    cs_grade        integer NOT NULL
);

INSERT into students values (1001, 'Fernando', 'fmartinez49', 'password');

DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS professors;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS courseStats;
