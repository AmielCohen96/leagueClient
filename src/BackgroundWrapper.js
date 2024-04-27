// BackgroundWrapper.js

import React from 'react';
import backgroundImg from './images/football.jpeg';

const BackgroundWrapper = ({ children }) => {
    const wrapperStyle = {
        backgroundImage: `url(${backgroundImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        width: '100vw',
        height: '100vh',
        position: 'fixed', // Ensure the background image remains fixed while scrolling
        overflowY: 'auto', // Allow vertical scrolling
    };

    return <div style={wrapperStyle}>{children}</div>;
};

export default BackgroundWrapper;
