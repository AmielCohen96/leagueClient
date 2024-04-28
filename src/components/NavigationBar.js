import React from 'react';

const NavigationBar = ({ username, userBalance, handleStats, handleProfile }) => {
    return (
        <div className="navigation-bar">
            <h2>Hello {username}, your current balance is: ${(Number(userBalance)).toFixed(2)}</h2>
            <button onClick={handleProfile} className={"circular-button"}>P</button>
        </div>
    );
};

export default NavigationBar;
