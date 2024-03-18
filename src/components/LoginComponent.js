import React, { useState } from 'react';
import './LoginComponent.css';
import {Link} from "react-router-dom";

const LoginComponent = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleUsernameChange = (event) => {
        setUsername(event.target.value);
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const handleSignIn = () => {
        console.log('Username:', username);
        console.log('Password:', password);
    };

    const startWithoutSignIn = () => {
        console.log('without')
    }

    const handleSignUp = () => {
        console.log('Redirecting to sign up page...');
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
                <button onClick={handleSignIn}>Sign In</button>
                <button onClick={handleSignUp}><Link to="/signup">Sign Up</Link></button>
                <button onClick={startWithoutSignIn}><Link to="/stream page">Start with out Sign In</Link></button>
            </div>
        </div>
    );
};

export default LoginComponent;
