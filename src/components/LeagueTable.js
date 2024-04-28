import React from 'react';

const LeagueTable = ({ teams }) => {
    return (
        <div className="left-table">
            <div className="title-background">
                <h3>League table</h3>
            </div>
            <table>
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Goals For</th>
                    <th>Goals Against</th>
                    <th>Points</th>
                </tr>
                </thead>
                <tbody>
                {teams.map((team, index) => (
                    <tr key={index}>
                        <td>{team.name}</td>
                        <td>{team.goalsFor}</td>
                        <td>{team.goalsAgainst}</td>
                        <td>{team.points}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default LeagueTable;
