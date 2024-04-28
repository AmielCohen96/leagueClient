import React from 'react';

const LastGames = ({ teams }) => {
    // Sort teams by points from highest to lowest
    const sortedTeams = teams.slice().sort((a, b) => b.points - a.points);

    // Function to determine cell color based on game result
    const getCellColor = (result) => {
        switch (result) {
            case 'W':
                return 'green';
            case 'L':
                return 'red';
            case 'D':
                return 'orange';
            default:
                return 'black';
        }
    };

    return (
        <div>
            <h2 style={{ color: 'white', textShadow: '0 0 2px black' }}>Last games form</h2>
            <table>
                <thead>
                <tr>
                    <th>Team Name</th>
                    <th colSpan="3">Last 3 Games</th> {/* Merge header cells */}
                </tr>
                </thead>
                <tbody>
                {sortedTeams.map((team) => (
                    <tr key={team.id}>
                        <td>{team.name}</td>
                        {/* Displaying last game results with cell color */}
                        {team.lastGames.slice(-3).map((result, index) => (
                            <td key={index} style={{ color: getCellColor(result) }}>
                                {result}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default LastGames;
