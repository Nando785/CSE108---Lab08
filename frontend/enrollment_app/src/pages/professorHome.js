import '../styles/professor.css';
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// import courseList from './components/professorCourseList.js';

function ProfessorHome() {
  const navigate = useNavigate();

  useEffect(() => {
    // Get user from database, store in data
    const checkUser = async () => {
      const res = await fetch('http://localhost:5000/current_user', {
        credentials: 'include',
      });
      const data = await res.json();
      // console.log(data);
      
      // Add user last name to welcome text
      let title = document.getElementById("WelcomeText");
      title.innerHTML = `Welcome Dr ${data.lastName}!`;

      // If user not found or valid, return to home page
      if (data.status === "not authenticated" || data.role !== "professor") {
        navigate('/');
      }
    };
    checkUser();
    loadCourses();
  }, [navigate]);

  const populateTable = async (mode = "view") => {
    let data = [];
    let res;
  
    if (mode === "view") {
      res = await fetch('http://localhost:5000/profClasses', { method: 'POST', credentials: 'include' });
      data = await res.json();
    } else {
      // const res = await fetch('http://localhost:5000/studentClasses', { method: 'GET', credentials: 'include' });
      // data = await res.json();
    }
    console.log(data);

    // Create a set of enrolled course keys for quick lookup
    // const enrolledSet = new Set(enrolledCourses.map(course => course[6]));
  
    let content = document.getElementById("TableContainer");
    content.innerHTML = "";

    if(mode === "view"){
      let title = document.getElementById("ContentTitle");
      if (title) {
        title.innerHTML = "Your Courses";
      }
    }else{
      let title = document.getElementById("ContentTitle");
      if (title) {
        // back button here
        title.innerHTML = `${data[0][0]}`;
      }
    }
  
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
  
      let row = document.createElement("tr");
      row.innerHTML = `
        <td> ${data[i][0]} </td>
        <td> ${data[i][1]} ${data[i][2]} </td>
        <td> ${data[i][3]} </td>
        <td> ${data[i][4]}/${data[i][5]} </td>
      `;
      table.appendChild(row);
    }
  
    content.appendChild(table);
  };

  const loadCourses = async () => {
   populateTable("view"); 
  }

  const editGrades = async () => {
    populateTable("edit");
  }

  const handleLogout = async () => {
    // Call logout endpoint, navigate to home page
    await fetch('http://localhost:5000/logout', {
      method: 'POST',
      credentials: 'include'
    });
    navigate('/');
  };

  return (
    <div className="ProfPage Page">
      <section className='Container'>
        <div id="Header">
          <p id="WelcomeText"> </p>
          <p id='Title'>ACME University</p>
          <button id="LogoutButton" onClick={handleLogout}>Logout</button>
        </div>

        <section id='Content'>                    
            <div id="ContentTitle"> </div>
            
            <div id="TableContainer"> </div>
          </section>
      </section>
  </div>
  );
}

export default ProfessorHome;
