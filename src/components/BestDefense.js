import React from 'react';


const BestDefense= ({ teams }) => {
    const fewestScorers = teams.slice().sort((a, b) => a.goalsAgainst - b.goalsAgainst).slice(0, 5);

    return (
        <div>
            <h2 style={{ color: 'white', textShadow: '0 0 2px black' }}>Best Defense</h2>
            <table>
                <thead>
                <tr>
                    <th>Team Name</th>
                    <th>Goals For</th>
                </tr>
                </thead>
                <tbody>
                {fewestScorers.map(team => (
                    <tr key={team.id}>
                        <td>{team.name}</td>
                        <td>{team.goalsAgainst}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default BestDefense;