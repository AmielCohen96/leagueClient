import React from 'react';


const BestAttack = ({ teams }) => {
    const topScorers = teams.slice().sort((a, b) => b.goalsFor - a.goalsFor).slice(0, 5);

    return (
        <div>
            <div className="title-b">
                <h2 style={{ color: 'white', textShadow: '0 0 2px black' }}>Best Attack</h2>
            </div>
            <table>
                <thead>
                <tr>
                    <th>Team Name</th>
                    <th>Goals For</th>
                </tr>
                </thead>
                <tbody>
                {topScorers.map(team => (
                    <tr key={team.id}>
                        <td>{team.name}</td>
                        <td>{team.goalsFor}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default BestAttack;

