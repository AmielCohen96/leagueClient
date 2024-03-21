import React, { useEffect, useState } from 'react';
import './StreamPage.css';
import axios from "axios";

const StreamPage = () => {
    const [teams, setTeams] = useState([]);
    const [roundResults, setRoundResults] = useState([]);
    const [currentRound, setCurrentRound] = useState(1);
    const [totalRounds, setTotalRounds] = useState(0);
    const [matches, setMatches] = useState([]);
    const [seasonEnded, setSeasonEnded] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');


    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const response = await axios.get('http://localhost:9124/generateTeams');
                setTeams(response.data);
                const params = new URLSearchParams(window.location.search);
                const username = params.get('username');
                const password = params.get('password');
                setUsername(username);
                setPassword(password);
            } catch (error) {
                console.error('Error fetching teams:', error);
            }
        };
        fetchTeams();
    }, []);

    useEffect(() => {
        if (teams.length > 1) {
            const totalTeams = teams.length;
            const rounds = totalTeams - 1;
            setTotalRounds(rounds);
            const matches = generateMatches(teams);
            setMatches(matches);
        }
    }, [teams]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (currentRound < totalRounds) {
                setCurrentRound(prevRound => prevRound + 1);
                playRound(matches[currentRound]); // Play the next round
            } else {
                clearInterval(interval);
                setSeasonEnded(true);
            }
        }, 3000); // Change the interval to a slower pace
        return () => clearInterval(interval);
    }, [currentRound, totalRounds, matches]);

    useEffect(() => {
        if (roundResults.length > 0) {
            updateLeagueTable();
        }
    }, [roundResults]);


    const simulateMatch = (team1, team2) => {
        const goalsTeam1 = Math.floor(Math.random() * 5);
        const goalsTeam2 = Math.floor(Math.random() * 5);

        // Update team1's balance sheet
        if (goalsTeam1 > goalsTeam2) {
            team1.points += 3;
        } else if (goalsTeam1 === goalsTeam2) {
            team1.points += 1;
        }
        team1.goalsFor += goalsTeam1;
        team1.goalsAgainst += goalsTeam2;

        // Update team2's balance sheet
        if (goalsTeam2 > goalsTeam1) {
            team2.points += 3;
        } else if (goalsTeam2 === goalsTeam1) {
            team2.points += 1;
        }
        team2.goalsFor += goalsTeam2;
        team2.goalsAgainst += goalsTeam1;

        console.log(team1.name, ": ", team1.points);
        console.log(team2.name, ": ", team2.points);
        const matchResult = {
            team1: team1.name,
            team2: team2.name,
            goalsTeam1,
            goalsTeam2
        };
        setRoundResults(prevResults => [...prevResults, matchResult]);
    };


    const playRound = (roundMatches) => {
        setRoundResults([]); // Clear previous round results
        roundMatches.forEach(match => {
            const { team1, team2 } = match;
            simulateMatch(team1, team2);
        });
    };

    const generateMatches = (teams) => {
        const matches = [];
        const n = teams.length;
        const teamIndices = Array.from({ length: n }, (_, index) => index);

        for (let round = 0; round < n - 1; round++) {
            const roundMatches = [];
            for (let i = 0; i < n / 2; i++) {
                const team1Index = teamIndices[i];
                const team2Index = teamIndices[n - 1 - i];
                roundMatches.push({ team1: teams[team1Index], team2: teams[team2Index] });
            }
            teamIndices.splice(1, 0, teamIndices.pop());
            matches.push(roundMatches);
        }
        return matches;
    };

    const updateLeagueTable = () => {
        const sortedTeams = [...teams].sort((a, b) => {
            // Sort teams based on points
            if (a.points !== b.points) {
                return b.points - a.points;
            }
            // If points are equal, sort based on goal difference
            const goalDifferenceA = a.goalsFor - a.goalsAgainst;
            const goalDifferenceB = b.goalsFor - b.goalsAgainst;
            if (goalDifferenceA !== goalDifferenceB) {
                return goalDifferenceB - goalDifferenceA;
            }
            // If goal difference is equal, sort alphabetically by team name
            return a.name.localeCompare(b.name);
        });
        setTeams(sortedTeams);
    };

    const handleProfile = () => {
        console.log('Redirecting to profile page...');
        window.location.href = '/profile-page';
    };


    return (
        <div className="welcome-container">
            <div className="navigation-bar">
                <h2>Hello {username}</h2>
                <button onClick={handleProfile} className={"circular-button"}>P</button>
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
                    <div className="title-background">
                        <h3>Round {currentRound}</h3>
                    </div>
                    {/*<ul>*/}
                    {/*    {roundResults.map((matchResult, index) => (*/}
                    {/*        <li key={index}>*/}
                    {/*            {matchResult.team1} {matchResult.goalsTeam1} -  {matchResult.goalsTeam2}  {matchResult.team2}*/}
                    {/*        </li>*/}
                    {/*    ))}*/}
                    {/*</ul>*/}
                    <table>
                        <thead>
                        <tr>
                            <th>Home team</th>
                            <th>Score</th>
                            <th>Away team</th>
                        </tr>
                        </thead>
                        <tbody>
                        {roundResults.map((matchResult, index) => (
                            <tr key={index}>
                                <td>{matchResult.team1}</td>
                                <td>{matchResult.goalsTeam1} -  {matchResult.goalsTeam2}</td>
                                <td>{matchResult.team2}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                {seasonEnded && <p>The season has ended!</p>}
            </div>
        </div>
    );
};

export default StreamPage;
