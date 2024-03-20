import React, {useEffect, useState} from 'react';
import './StreamPage.css';
import axios from "axios";

const StreamPage = ({ username }) => {
    const [teams, setTeams] = useState([]);
    const [roundResults, setRoundResults] = useState([]);
    const [currentRound, setCurrentRound] = useState(1);
    const [totalRounds, setTotalRounds] = useState(0);


    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const response = await axios.get('http://localhost:9124/generateTeams');
                setTeams(response.data);
                const totalTeams = response.data.length;
                const rounds = totalTeams - 1;
                setTotalRounds(rounds);
                console.log("Teams fetched:", response.data);
                generateMatches(response.data); // Make sure this line is executed
                console.log("Matches generated");
            } catch (error) {
                console.error('Error fetching teams:', error);
            }
        };

        fetchTeams();
    }, []);


    useEffect(() => {
        if (teams.length > 1) {
            playRound();
        }
    }, [currentRound]); // Watch for changes in currentRound

    const simulateMatch = (team1, team2) => {
        // Simulate match result (random goals)
        const goalsTeam1 = Math.floor(Math.random() * 5); // Random goals for team 1 (0-4)
        const goalsTeam2 = Math.floor(Math.random() * 5); // Random goals for team 2 (0-4)
        console.log(`Match: ${team1.name} vs ${team2.name} - Result: ${goalsTeam1} - ${goalsTeam2}`);
        // Store match result
        const matchResult = {
            team1: team1.name,
            team2: team2.name,
            goalsTeam1,
            goalsTeam2
        };
        setRoundResults(prevResults => [...prevResults, matchResult]);
    };

    const playRound = () => {
        const matches = generateMatches();
        console.log("Matches for this round:", matches);

        matches.forEach(match => {
            const { team1, team2 } = match;
            console.log("Current match:", team1.name, "vs", team2.name);
            simulateMatch(team1, team2);
        });

        setCurrentRound(prevRound => prevRound + 1);
    };


    const generateMatches = () => {
        const matches = [];
        const n = teams.length;

        // Initialize an array to hold the indices of teams
        const teamIndices = Array.from({ length: n }, (_, index) => index);

        // For each round, generate matches
        for (let round = 0; round < n - 1; round++) {
            const roundMatches = [];

            // Pair teams against each other
            for (let i = 0; i < n / 2; i++) {
                const team1Index = teamIndices[i];
                const team2Index = teamIndices[n - 1 - i];

                // Push the matched teams into the roundMatches array
                roundMatches.push({ team1: teams[team1Index], team2: teams[team2Index] });
            }

            // Rotate team indices for the next round
            teamIndices.splice(1, 0, teamIndices.pop());

            // Push the generated matches for this round into the matches array
            matches.push(roundMatches);
        }

        console.log("Generated Matches:", matches); // Log the generated matches
        return matches;
    };



    return (
        <div className="welcome-container">
            <div className="navigation-bar">
                <h2>Hello {username}</h2>
            </div>
            <div className="tables-container">
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
                            <th>Skills</th>
                        </tr>
                        </thead>
                        <tbody>
                        {teams.map((team, index) => (
                            <tr key={index}>
                                <td>{team.name}</td>
                                <td>{team.goalsFor}</td>
                                <td>{team.goalsAgainst}</td>
                                <td>{team.points}</td>
                                <td>{team.skills}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    <div className="button-container">
                        <button>Click To Gamble</button>
                    </div>
                </div>
                <div className="matches-container">
                    <h3>Round {currentRound} Matches</h3>
                    <ul>
                        {roundResults.map((matchResult, index) => (
                            <li key={index}>
                                {matchResult.team1} vs {matchResult.team2} - Result: {matchResult.goalsTeam1} - {matchResult.goalsTeam2}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default StreamPage;