import React, { useEffect } from 'react';
import './StreamPage.css';

const StreamPage = ({ username }) => {

    useEffect(() => {
        // This function will run when the component is mounted (rendered for the first time)
        console.log("Component mounted");

        // You can perform any actions here
        // For example, fetching data, initializing state, etc.
    }, []); // Empty dependency array means this effect will only run once, when the component mounts


    return (
        <div className="welcome-container">
            <h2>Hello {username}</h2>
            <div className="tables-container">
                <div className="left-table">
                    <h3>Live Matches</h3>
                    <table>
                        <thead>
                        <tr>
                            <th>Goals Home Team</th>
                            <th>Goals Away Team</th>
                            <th>Teams</th>
                        </tr>
                        </thead>
                        <tbody>
                        {[...Array(6)].map((_, index) => (
                            <tr key={index}>
                                <td>Data</td>
                                <td>Data</td>
                                <td>Data</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                <div className="right-table">
                    <h3>Score Table</h3>
                    <table>
                        <thead>
                        <tr>
                            <th>Overall Points</th>
                            <th>Team</th>
                        </tr>
                        </thead>
                        <tbody>
                        {[...Array(11)].map((_, index) => (
                            <tr key={index}>
                                <td>Data</td>
                                <td>Data</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StreamPage;