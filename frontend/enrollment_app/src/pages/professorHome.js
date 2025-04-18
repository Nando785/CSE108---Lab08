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
      // Fetch all of current professor's classes
      res = await fetch('http://localhost:5000/profClasses', { method: 'POST', credentials: 'include' });
      data = await res.json();
    } else {
      // Fetch all students + grades  in 
      res = await fetch('http://localhost:5000/profEdit', { method: 'POST', credentials: 'include' });
      data = await res.json();
    }
  
    let content = document.getElementById("TableContainer");
    content.innerHTML = "";

    let table = document.createElement("table");
    table.setAttribute("id", "table");

    let title = document.getElementById("ContentTitle");

    if(mode === "view"){
      if (title) {
        title.innerHTML = "Your Courses";
      }

      // Add headers to table
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
    
      // Append class rows to table
      for (let i = 0; i < data.length; i++) {
        let row = document.createElement("tr");
        
        // Create class name + link
        let courseNameCell = document.createElement("td");
        let link = document.createElement("a");
        link.href = "#";
        link.textContent = data[i][0];
        link.onclick = (e) => {
          e.preventDefault();
          editGrades();
        };

        courseNameCell.appendChild(link);
        row.appendChild(courseNameCell);

        console.log("DATA in populateTable: ", data);
        // Append rest of class information
        row.innerHTML = `
          <td><a href="#" onclick="handleCourseClick('${data[i][6]}', '${data[i][0]}')">${data[i][0]}</a></td>
          <td> ${data[i][1]} ${data[i][2]} </td>
          <td> ${data[i][3]} </td>
          <td> ${data[i][4]}/${data[i][5]} </td>
        `;
        table.appendChild(row);
      }

    }
  
    content.appendChild(table);
  };

  const handleCourseClick = async (classId, courseName) => {
    const res = await fetch('http://localhost:5000/profEdit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ class_id: classId }),
    });

    const data = await res.json();
    // console.log("DATA in handleCourseClick: " + data);
    let content = document.getElementById("TableContainer");
    content.innerHTML = "";

    let table = document.createElement("table");
    table.setAttribute("id", "table");
    let title = document.getElementById("ContentTitle");
    title.innerHTML = '';

    const backButton = document.createElement("button");
    backButton.textContent = "Back to Courses";
    backButton.style.marginTop = "10px";
    backButton.addEventListener("click", () => {
        populateTable(); // reloads the original class list table
    });
    title.appendChild(backButton);

    if (title) {
      // back button here
      let className = document.createElement("p");
      className.innerHTML = `${data[0][3]}`;
      title.appendChild(className);
      let className2 = document.createElement("p");
      className2.innerHTML = `          `;
      title.appendChild(className2);
    }

    table.innerHTML = `
      <thead>
        <tr>
          <th>Student Name</th>
          <th>Grade</th>
        </tr>
      </thead>
    `;

    for (let i = 0; i < data.length; i++) {
      let row = document.createElement("tr");
      
      row.innerHTML = `
        <td> ${data[i][0]} ${data[i][1]} </td>
      `;

      // <td> ${data[i][2]} </td>
      let gradeCell = document.createElement("td");
      let gradeInput = document.createElement("input");
      gradeInput.type = "next";
      gradeInput.value = data[i][2];
      gradeInput.dataset.classKey = classId;
      gradeInput.dataset.studentId = data[i][4];

      gradeInput.addEventListener("change", async () => {
        const newGrade = gradeInput.value;
        const body = {
            student_id: gradeInput.dataset.studentId,
            class_id: gradeInput.dataset.classKey,
            newGrade: newGrade
        };

        const res = await fetch("http://localhost:5000/updateGrade", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(body)
        });

        if (res.ok) {
            gradeInput.value = newGrade;
            console.log("Grade updated.");
        } else {
            alert("Failed to update grade.");
        }
        });

      gradeCell.appendChild(gradeInput);
      row.appendChild(gradeCell);

        table.appendChild(row);
      }
      content.appendChild(table);
    };

  window.handleCourseClick = handleCourseClick;

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
