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
      console.log(data);
      
      // Add user last name to welcome text
      let title = document.getElementById("WelcomeText");
      title.innerHTML = `Welcome Dr ${data.lastName}!`;

      // If user not found or valid, return to home page
      if (data.status === "not authenticated" || data.role !== "professor") {
        navigate('/');
      }
    };
    checkUser();
  }, [navigate]);

  // Load table on dom load, MOVE TO TABLE COMPONENT
  // let location = useLocation()
  // React.useEffect( async () => {
  //   // Add table generation
  //   // Fetch professor classes
  //   const res = await fetch('http://localhost:5000/profClasses', {
  //     credentials: 'include',
  //   });
  //   const data = await res.json();

  //   console.log(data);
  // }, [location]);

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
            <div id="ContentTitle"> 
              Back Button Here/Filler + Course Title + Possible Filler Block
            </div>
            
            <div id="TableContainer"> Table Here </div>
          </section>
      </section>
  </div>
  );
}

export default ProfessorHome;
