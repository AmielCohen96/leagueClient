import React from 'react';
import './LeagueTable.css';

class LeagueTable extends React.Component {
    render() {
        // Mock data (replace with actual data fetched from the database)
        const leagueData = [
            { teamName: "Team A", goalsFor: 10, goalsAgainst: 5, points: 9 },
            { teamName: "Team B", goalsFor: 8, goalsAgainst: 6, points: 7 },
            { teamName: "Team C", goalsFor: 7, goalsAgainst: 8, points: 7 },
            { teamName: "Team D", goalsFor: 5, goalsAgainst: 10, points: 3 },
            { teamName: "Team E", goalsFor: 12, goalsAgainst: 4, points: 10 },
            { teamName: "Team F", goalsFor: 6, goalsAgainst: 6, points: 5 },
            { teamName: "Team G", goalsFor: 9, goalsAgainst: 7, points: 8 },
            { teamName: "Team H", goalsFor: 11, goalsAgainst: 9, points: 6 }
            // Add more teams as needed
        ];

        // Sort the leagueData based on points, goals difference, goals for, and team name
        leagueData.sort((a, b) => {
            if (a.points !== b.points) return b.points - a.points;
            const goalDiffA = a.goalsFor - a.goalsAgainst;
            const goalDiffB = b.goalsFor - b.goalsAgainst;
            if (goalDiffA !== goalDiffB) return goalDiffB - goalDiffA;
            if (a.goalsFor !== b.goalsFor) return b.goalsFor - a.goalsFor;
            return a.teamName.localeCompare(b.teamName);
        });

        return (
            <div className="league-table-container">
                <table className="league-table">
                    <thead>
                    <tr>
                        <th>Place</th>
                        <th>Team Name</th>
                        <th>Goals For</th>
                        <th>Goals Against</th>
                        <th>Points</th>
                    </tr>
                    </thead>
                    <tbody>
                    {leagueData.map((team, index) => (
                        <tr key={team.teamName}>
                            <td>{index + 1}</td>
                            <td>{team.teamName}</td>
                            <td>{team.goalsFor}</td>
                            <td>{team.goalsAgainst}</td>
                            <td>{team.points}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        );
    }
}

export default LeagueTable;
