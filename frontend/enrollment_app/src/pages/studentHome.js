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

  const loadCourses = async () => {
    const res = await fetch('http://localhost:5000/studentClasses', {
      method: 'GET',
      credentials: 'include'
    });
    const data = await res.json();

    document.getElementById("AddCourseButton").style.backgroundColor = "#cac7c3"; // set un-selected
    document.getElementById("CoursesButton").style.backgroundColor = "#aba8a4"; // set selected

    let content = document.getElementById("TableContainer");
    content.innerHTML = "";

    let table = document.createElement("table");
    table.innerHTML = `
            <thead>
                <tr>
                    <th>Course Name</th>
                    <th>Teacher</th>
                    <th>Time</th>
                    <th>Students Enrolled</th>
                </tr>
            </thead>
        `;

    for(let i = 0; i < data.length; i++){
      console.log(1);
      let row = document.createElement("tr");
      row.innerHTML =  `<td> ${data[i][0]} </td>
                        <td> ${data[i][1]} ${data[i][2]} </td>
                        <td> ${data[i][3]} </td>
                        <td> ${data[i][4]}/${data[i][5]} </td>`;
      table.appendChild(row);
    }
    content.appendChild(table)

    console.log(data);
  }

  const addCourses = async () => {
    document.getElementById("AddCourseButton").style.backgroundColor = "#aba8a4"; // set un-selected
    document.getElementById("CoursesButton").style.backgroundColor = "#cac7c3"; // set selected

    let content = document.getElementById("TableContainer");
    content.innerHTML = "";
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
