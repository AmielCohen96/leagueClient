// ProfilePage.js

import React, { useState } from 'react';
import axios from 'axios';

const ProfilePage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    // Add more state variables for other user details

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Send user information to the backend
            const response = await axios.post('http://localhost:9124/update-username', {
                username,
                password,
                email,
                // Include other user details in the request payload
            });
            // Handle success response
            console.log('Update successful:', response.data);
        } catch (error) {
            // Handle error response
            console.error('Update failed:', error.message);
        }
    };

    return (
        <div>
            <h2>Update User Details</h2>
            <form onSubmit={handleSubmit}>
                <label>Username:</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                <label>Password:</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

                <label>Email:</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                {/* Add more input fields for other user details */}
                <button type="submit">Update</button>
            </form>
        </div>
    );
};

export default ProfilePage;

