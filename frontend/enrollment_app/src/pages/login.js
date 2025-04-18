//import axios from 'axios'; // run "npm install axios"
import '../styles/login.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const response = await fetch('http://localhost:5000/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    console.log(data);

    if (data.status === 'success') {
      if (data.role === 'professor') {
        navigate('/professorhome');
      } else if (data.role === 'student') {
        navigate('/studenthome');
      } else if (data.role === 'admin') {
        // navigate('/admin');
        window.location.href = 'http://localhost:5000/admin';
      }
    } else {
      alert('Invalid username or password.');
    }
  };

    return (
        <div className="Page">
            <section className='Container'>
                <p className='Title'>ACME University</p>

                <section className='Content'>
                    <form onSubmit={handleLogin}>
                        <div className='InputField'>
                            <label htmlFor='Username'>Username</label>
                            <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            />
                        </div>

                        <div className='InputField'>
                            <label htmlFor='Password'>Password</label>
                            <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            />
                        </div>

                        <button type="submit" >Sign In</button>
                    </form>
                </section>
            </section>
        </div>
    );
}

export default Login;