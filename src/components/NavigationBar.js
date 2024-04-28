import React from 'react';

const NavigationBar = ({ username, userBalance, handleStats, handleProfile }) => {
    return (
        <div className="navigation-bar">
            <h2>Hello {username}, your current balance is: ${(Number(userBalance)).toFixed(2)}</h2>
            <button className={"stats-info-b"} onClick={handleStats} style={{ width: '250px' }}>Stats and information</button>
            <button onClick={handleProfile} className={"circular-button"}>P</button>
        </div>
    );
};

export default NavigationBar;
