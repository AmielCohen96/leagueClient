import React, { useState } from 'react';
import './SignupComponent.css';

const SignupComponent = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const handleUsernameChange = (event) => {
        setUsername(event.target.value);
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };

    const validateForm = () => {
        if (!username) {
            setError('Please enter a username');
            return false;
        }
        if (!password || password.length < 6 || !/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
            setError('Password must be at least 6 characters long and include both letters and numbers');
            return false;
        }
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            setError('Please enter a valid email address');
            return false;
        }
        return true;
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (validateForm()) {
            setError('');
            // Proceed with signup process
            console.log('Username:', username);
            console.log('Password:', password);
            console.log('Email:', email);
        }
    };

    return (
        <div className="signup-container">
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit}>
                <div className="input-container">
                    <span>Username:</span>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={handleUsernameChange}
                    />
                </div>
                <div className="input-container">
                    <span>Password:</span>
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={handlePasswordChange}
                    />
                </div>
                <div className="input-container">
                    <span>Email:</span>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={handleEmailChange}
                    />
                </div>
                {error && <p className="error-message">{error}</p>}
                <button type="submit">Sign Up</button>
            </form>
        </div>
    );
};

export default SignupComponent;
