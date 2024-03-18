import React from 'react';
import './StreamPage.css';

const StreamPage = ({ username }) => {
    return (
        <div className="welcome-container">
            <h2>Hello {username}</h2>

            {/* Add more content for the welcome page */}
        </div>
    );
};

export default StreamPage;
