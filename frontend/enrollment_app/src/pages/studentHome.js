import '../styles/student.css';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function StudentHome() {
  const navigate = useNavigate();

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const res = await fetch('http://localhost:5000/current_user', {
        credentials: 'include',
      });
      const data = await res.json();

      // Add user last name to welcome text
      let title = document.getElementById("WelcomeText");
      title.innerHTML = `Welcome ${data.firstName}!`;

      if (data.status === "not authenticated" || data.role !== "student") {
        navigate('/');
      }
    };
    checkUser();
  }, [navigate]);

  const handleLogout = async () => {
    await fetch('http://localhost:5000/logout', {
      method: 'POST',
      credentials: 'include'
    });
    navigate('/');
  };

  const populateTable = async (mode = "view") => {
    let data = [];
    let enrolledCourses = [];
  
    if (mode === "add") {
      const [allRes, enrolledRes] = await Promise.all([
        fetch('http://localhost:5000/allClasses', { method: 'GET', credentials: 'include' }),
        fetch('http://localhost:5000/studentClasses', { method: 'GET', credentials: 'include' })
      ]);
      data = await allRes.json();
      enrolledCourses = await enrolledRes.json();
    } else {
      const res = await fetch('http://localhost:5000/studentClasses', { method: 'GET', credentials: 'include' });
      data = await res.json();
    }
  
    // Create a set of enrolled course keys for quick lookup
    const enrolledSet = new Set(enrolledCourses.map(course => course[6]));
  
    let content = document.getElementById("TableContainer");
    content.innerHTML = "";
  
    let table = document.createElement("table");
    table.setAttribute("id", "table");
    table.innerHTML = `
      <thead>
        <tr>
          <th>Course Name</th>
          <th>Teacher</th>
          <th>Time</th>
          <th>Students Enrolled</th>
          ${mode === "add" ? "<th>Action</th>" : ""}
        </tr>
      </thead>
    `;
  
    for (let i = 0; i < data.length; i++) {
      const courseKey = data[i][6];
      const isEnrolled = enrolledSet.has(courseKey);
      const state = isEnrolled ? "minus" : "plus";
      const icon = isEnrolled ? "minus.png" : "plus.png";
  
      let row = document.createElement("tr");
      row.innerHTML = `
        <td> ${data[i][0]} </td>
        <td> ${data[i][1]} ${data[i][2]} </td>
        <td> ${data[i][3]} </td>
        <td> ${data[i][4]}/${data[i][5]} </td>
        ${
          mode === "add"
            ? `<td>
                <button class="enrollBtn" data-state="${state}" data-course="${courseKey}" onclick="toggleEnroll(this)">
                  <img src="/images/${icon}" alt="${state}" class="icon" />
                </button>
              </td>`
            : ""
        }
      `;
      table.appendChild(row);
    }
  
    content.appendChild(table);
  };
  

  window.toggleEnroll = (button) => {
    const img = button.querySelector("img");
    const state = button.getAttribute("data-state");
  
    if (state === "plus") {
      img.src = "/images/minus.png";
      button.setAttribute("data-state", "minus");
      handleAddCourse(button);
    } else {
      img.src = "/images/plus.png";
      button.setAttribute("data-state", "plus");
      handleRemoveCourse(button);
    }
  };
  
  function handleAddCourse(button) {
    fetch('http://localhost:5000/addCourse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // Needed if you're using session-based auth
      body: JSON.stringify({ course: button.dataset.course })
    })
  }
  
  function handleRemoveCourse(button) {
    fetch('http://localhost:5000/removeCourse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // Needed if you're using session-based auth
      body: JSON.stringify({ course: button.dataset.course })
    })
  }  

  const loadCourses = async () => {
    document.getElementById("AddCourseButton").style.backgroundColor = "#cac7c3"; // set un-selected
    document.getElementById("CoursesButton").style.backgroundColor = "#aba8a4"; // set selected
    populateTable("view");
  }

  const addCourses = async () => {
    document.getElementById("AddCourseButton").style.backgroundColor = "#aba8a4"; // set un-selected
    document.getElementById("CoursesButton").style.backgroundColor = "#cac7c3"; // set selected
    populateTable("add");
  }

  return (
    <div className="StudentPage Page">
      <section className='Container'>
        <div id="Header">
          <p id="WelcomeText"> </p>
          <p id='Title'>ACME University</p>
          <button onClick={handleLogout} id="LogoutButton">Logout</button>
        </div>

        <section id='Content'>                    
          <div id="ContentTitle"> 
            <section id="CoursesButton" onClick={loadCourses}> Your Courses </section>
            <section id="AddCourseButton" onClick={addCourses}> Add Courses </section>
          </div>
          
          <div id="TableContainer"> </div>
        </section>
      </section>
  </div>
  );
}

export default StudentHome;
