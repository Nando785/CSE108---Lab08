import axios from 'axios'; // run "npm install axios"
import '../styles/login.css';

function Login() {
    const verifyUser = async () => {
        // Collect information from HTML
        const username = document.getElementById("Username").value;
        const password = document.getElementById("Password").value;
        if(!username || !password){return;}

        let data = {"username":username, "password":password};

        // Reset input
        document.getElementById("Username").value = "";
        document.getElementById("Password").value = "";
        
        let url = `http://127.0.0.1:5000/user`;
        const response = await axios.post(url, data);

        console.log(response.data); // replace with page redirect if 1, nothing if 0
    }

    return (
        <div className="Page">
            <section className='Container'>
                <p className='Title'>ACME University</p>

                <section className='Content'>
                    <div className='InputField'>
                        <label htmlFor='Username'>Username</label>
                        <input type="text" className='Username' id='Username'></input>
                    </div>

                    <div className='InputField'>
                        <label htmlFor='Password'>Password</label>
                        <input type="text" className='Password' id='Password'></input>
                    </div>

                    <button type="button" onClick={verifyUser}>Sign In</button>
                </section>
            </section>
        </div>
    );
}

export default Login;