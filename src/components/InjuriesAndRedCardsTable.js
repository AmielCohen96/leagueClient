import React from 'react';

const InjuriesAndRedCardsTable = ({ teams }) => {
    const sortedTeams = teams.slice().sort((a, b) => {
        const aInjuriesAndReds = a.numInjuredPlayers + a.numRedCards;
        const bInjuriesAndReds = b.numInjuredPlayers + b.numRedCards;
        return bInjuriesAndReds - aInjuriesAndReds;
    });

    return (
        <div>
            <h2 style={{ color: 'white', textShadow: '0 0 2px black' }}>Injuries and Red Cards</h2>
            <table>
                <thead>
                <tr>
                    <th>Team Name</th>
                    <th># Injured Players</th>
                    <th># Red Cards</th>
                </tr>
                </thead>
                <tbody>
                {sortedTeams.map(team => (
                    <tr key={team.id}>
                        <td>{team.name}</td>
                        <td>{team.numInjuredPlayers}</td>
                        <td>{team.numRedCards}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default InjuriesAndRedCardsTable;