import '../styles/student.css';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function StudentHome() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const res = await fetch('http://localhost:5000/current_user', {
        credentials: 'include',
      });
      const data = await res.json();

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

  return (
    <div className="Page">
      <section className='Container'>
        <div id="Header">
          <p id="WelcomeText"> Welcome Student</p>
          <p id='Title'>ACME University</p>
          <button onClick={handleLogout} id="LogoutButton">Logout</button>
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

export default StudentHome;
