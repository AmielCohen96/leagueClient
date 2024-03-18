// import React, { useState } from 'react';
// import axios from 'axios'; // Import Axios
// import './SignupComponent.css';
//
// const SignupComponent = () => {
//     const [username, setUsername] = useState('');
//     const [password, setPassword] = useState('');
//     const [email, setEmail] = useState('');
//     const [error, setError] = useState('');
//
//     const handleUsernameChange = (event) => {
//         setUsername(event.target.value);
//     };
//
//     const handlePasswordChange = (event) => {
//         setPassword(event.target.value);
//     };
//
//     const handleEmailChange = (event) => {
//         setEmail(event.target.value);
//     };
//
//     const validateForm = () => {
//         if (!username) {
//             setError('Please enter a username');
//             return false;
//         }
//         if (!password || password.length < 6 || !/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
//             setError('Password must be at least 6 characters long and include both letters and numbers');
//             return false;
//         }
//         if (!email || !/\S+@\S+\.\S+/.test(email)) {
//             setError('Please enter a valid email address');
//             return false;
//         }
//         return true;
//     };
//
//     const handleSubmit = async (event) => {
//         event.preventDefault();
//         if (validateForm()) {
//             setError('');
//             try {
//                 const response = await axios.post('http://localhost:9124/add-user', null, {
//                     params: {
//                         username,
//                         password,
//                         email
//                     }
//                 });
//                 console.log('Signup successful:', response.data);
//                 // Add any further logic based on the server response
//             } catch (error) {
//                 console.error('Signup failed:', error);
//             }
//         }
//     };
//
//     return (
//         <div className="signup-container">
//             <h2>Sign Up</h2>
//             <form onSubmit={handleSubmit}>
//                 <div className="input-container">
//                     <span>Username:</span>
//                     <input
//                         type="text"
//                         placeholder="Username"
//                         value={username}
//                         onChange={handleUsernameChange}
//                     />
//                 </div>
//                 <div className="input-container">
//                     <span>Password:</span>
//                     <input
//                         type="password"
//                         placeholder="Password"
//                         value={password}
//                         onChange={handlePasswordChange}
//                     />
//                 </div>
//                 <div className="input-container">
//                     <span>Email:</span>
//                     <input
//                         type="email"
//                         placeholder="Email"
//                         value={email}
//                         onChange={handleEmailChange}
//                     />
//                 </div>
//                 {error && <p className="error-message">{error}</p>}
//                 <button type="submit">Sign Up</button>
//             </form>
//         </div>
//     );
// };
//
// export default SignupComponent;

import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Import Link from React Router
import './SignupComponent.css';

const SignupComponent = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false); // State for success message
    const [signingUp, setSigningUp] = useState(false); // State for controlling sign-up process

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


    const handleSubmit = async (event) => {
        event.preventDefault();
        if (validateForm()) {
            setError('');
            setSigningUp(true); // Start sign-up process
            try {
                const response = await axios.post('http://localhost:9124/add-user', null, {
                    params: {
                        username,
                        password,
                        email
                    }
                });
                console.log('Signup successful:', response.data);
                setSuccess(true); // Set success state to true
            } catch (error) {
                console.error('Signup failed:', error);
                setError('Signup failed. Please try again.');
            } finally {
                setSigningUp(false); // Reset signing up state
            }
        }
    };

    return (
        <div className="signup-container">
            {success ? ( // Show success message if sign-up was successful
                <div className="success-message">
                    <p>Signup successful! You can now proceed to login.</p>
                    <button><Link to="/">Back to Login</Link></button>
                </div>
            ) : (
                <React.Fragment>
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
                        <button type="submit" disabled={signingUp}>{signingUp ? 'Signing up...' : 'Sign Up'}</button>
                        <button><Link to="/">Back to Login</Link></button>
                    </form>
                </React.Fragment>
            )}
        </div>
    );
};

export default SignupComponent;


