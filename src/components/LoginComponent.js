import React, { useState } from 'react';
import './LoginComponent.css';
import {Link} from "react-router-dom";
import axios from "axios";



const LoginComponent = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleUsernameChange = (event) => {
        setUsername(event.target.value);
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const handleSubmit = async (event) => {
        console.log('Username:', username);
        console.log('Password:', password);

        event.preventDefault();
        try {
            const response = await axios.post('http://localhost:9124/login', null,{params: {
                    username,
                    password
                }});
            console.log('Login response:', response.data);
            if (response.data.success) {
                console.log("good")
                // window.location.href = '/stream-page';
                window.location.href = `/stream-page?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
                // Redirect to dashboard
            } else {
                console.log("bad")
                setError('Invalid username or password');
            }
        } catch (error) {
            console.error('Login failed:', error);
            setError('Login failed. Please try again.');
        }

    };

    const startWithoutSignIn = () => {
        console.log('without')
        window.location.href = '/without-login-stream';
    }

    const handleSignUp = () => {
        console.log('Redirecting to sign up page...');
        window.location.href = '/signup';
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <div className="input-container">
                <span>Username </span>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={handleUsernameChange}
                />
            </div>
            <div className="input-container">
                <span>Password </span>
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={handlePasswordChange}
                />
            </div>
            <div className="button-container">
                <button onClick={handleSubmit}>Sign In</button>
                <button onClick={handleSignUp}>Sign Up</button>
                <button onClick={startWithoutSignIn}>Start without Sign In</button>
            </div>
        </div>
    );
};

export default LoginComponent;
