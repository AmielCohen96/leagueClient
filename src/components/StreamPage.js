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
    const [bettingEnabled, setBettingEnabled] = useState(false); // Control betting phase
    const [currentBets, setCurrentBets] = useState({}); // Store current bets
    const [selectedBets, setSelectedBets] = useState({});
    const [betAmount, setBetAmount] = useState(0);
    const [bettingForm, setBettingForm] = useState([]);
    const [allRoundResults, setAllRoundResults] = useState([]);



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
        if (matches.length > 0) { // Check if matches are available
            const roundDuration = 5000; // Total round duration (30 seconds)
            const bettingPhaseDuration = 2500; // Betting phase duration (15 seconds)
            const interval = setInterval(() => {
                if (currentRound < totalRounds) {
                    console.log("Current Round:", currentRound);
                    setCurrentRound(prevRound => prevRound + 1);
                    setBettingEnabled(true); // Enable betting phase
                    playRound(matches[currentRound - 1]); // Play the next round
                    setTimeout(() => {
                        setBettingEnabled(false); // Disable betting after 15 seconds
                        console.log("Matches:", matches); // Log matches before playing round
                    }, bettingPhaseDuration); // Wait for 15 seconds (betting phase)
                } else {
                    clearInterval(interval);
                    setSeasonEnded(true);
                }
            }, roundDuration); // Change round every 30 seconds

            return () => clearInterval(interval);
        }
    }, [currentRound, totalRounds, matches]);





    useEffect(() => {
        if (roundResults.length > 0) {
            updateLeagueTable();
        }
    }, [roundResults]);

    const simulateMatch = (team1, team2, matchId, round) => {
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

        const matchResult = {
            roundNumber: round,
            matchNumber: matchId,
            team1: team1.name,
            team2: team2.name,
            goalsTeam1,
            goalsTeam2,
            score: goalsTeam1 > goalsTeam2 ? 1 : goalsTeam1 < goalsTeam2 ? 2 : 0, // Set score based on goals
        };
        allRoundResults.push(matchResult);
        console.log(allRoundResults)
        setRoundResults(prevResults => [...prevResults, matchResult]);
    };

    const playRound = (roundMatches) => {
        setRoundResults([]); // Clear previous round results
        roundMatches.forEach(match => {
            const { team1, team2 } = match;
            simulateMatch(team1, team2, match.matchNumber, match.roundNumber);
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
                const team1 = teams[team1Index];
                const team2 = teams[team2Index];
                const odds = calculateBettingOdds(team1.skills, team2.skills); // Calculate odds
                roundMatches.push({
                    roundNumber: round + 1,
                    matchNumber: i + 1,
                    team1,
                    team2,
                    team1Odd: odds.team1Win, // Add odds to match
                    drawOdd: odds.draw,
                    team2Odd: odds.team2Win
                });
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

    const calculateBettingOdds = (team1Skill, team2Skill) => {
        // Step 1: Calculate the skill difference
        const skillDifference = Math.abs(team1Skill - team2Skill);

        // Step 2: Determine the base odds based on skill difference
        let baseOddTeam1Win = 100 / (team1Skill + 1);
        let baseOddTeam2Win = 100 / (team2Skill + 1);
        let baseOddDraw = 100 / (skillDifference + 1);

        // Step 3: Adjust the odds for each outcome
        let oddTeam1Win = baseOddTeam1Win * (1 + skillDifference * 0.05);
        let oddTeam2Win = baseOddTeam2Win * (1 + skillDifference * 0.05);
        let oddDraw = (oddTeam1Win + oddTeam2Win) / 2;

        // Step 4: Round the odds to two decimal places and round up to multiples of 5
        oddTeam1Win = Math.ceil(oddTeam1Win * 20) / 20;
        oddTeam2Win = Math.ceil(oddTeam2Win * 20) / 20;
        oddDraw = Math.ceil(oddDraw * 20) / 20;

        // Step 5: Ensure that all three odds are unique
        if (oddTeam1Win === oddTeam2Win || oddTeam1Win === oddDraw) {
            // Adjust one of the odds slightly to ensure uniqueness
            oddTeam1Win += 0.01;
        }
        if ( oddTeam2Win === oddDraw){
            oddDraw += 0.01;
        }

        return {
            team1Win: oddTeam1Win,
            draw: oddDraw,
            team2Win: oddTeam2Win
        };
    };

    // Function to handle changes in the amount input field
    const handleAmountChange = (event) => {
        setBetAmount(event.target.value);
    };

    const handleBet = (matchId, odds, result) => {
        setSelectedBets(prevBets => {
            const updatedBets = { ...prevBets };
            if (updatedBets[matchId] === result) {
                delete updatedBets[matchId];
            } else {
                updatedBets[matchId] = result;
            }
            return updatedBets;
        });

        // Find the index of the match with the given matchId
        const matchIndex = matches[currentRound - 1].findIndex(match => match.matchNumber === matchId);

        setBettingForm(prevForm => [
            ...prevForm,
            {
                roundNumber: currentRound,
                matchNumber: matchId,
                bet: result,
                odd: odds
            }
        ]);

        // Update the state of the selected button based on the match index
        setBettingForm(prevForm => [
            ...prevForm,
            {
                roundNumber: currentRound,
                matchNumber: matchId,
                bet: result,
                odd: odds
            }
        ]);
    };




    const submitBets = () => {
        if (bettingForm.length === 0) {
            alert('Please place your bets before submitting.');
            return;
        }

        let allBetsCorrect = true;

        bettingForm.forEach(bet => {
            console.log(bet);
            let betCorrect = true;
            allRoundResults.forEach(matchResult => {
                if(matchResult.roundNumber === bet.roundNumber && matchResult.matchNumber === bet.matchNumber && matchResult.score !== bet.bet)
                    {

                        betCorrect = false;
                        return;
                    }
            });
            if (!betCorrect) {
                allBetsCorrect = false;
                return;
            }
        });

        if (allBetsCorrect) {
            alert('Congratulations! You won.');
        } else {
            alert('Sorry, you did not win this time.');
        }

        setBettingForm([]);
        setBetAmount(0);
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
                </div>
                <div className="matches-container">
                    <div className="title-background">
                        <h3>Round {currentRound}</h3>
                    </div>
                    <table>
                        <thead>
                        <tr>
                            <th>Home team</th>
                            {bettingEnabled ? (
                                <>
                                    <th>1</th>
                                    <th>X</th>
                                    <th>2</th>
                                </>
                            ) : (
                                <>
                                    <th>Score</th>
                                </>
                            )}
                            <th>Away team</th>
                        </tr>
                        </thead>
                        <tbody>
                        {matches[currentRound - 1] && matches[currentRound - 1].map((match, index) => (
                            <tr key={index}>
                                <td>{match.team1.name}</td>
                                {bettingEnabled ? (
                                    <>
                                        <td>
                                            <button
                                                className={`bet-button ${selectedBets[match.matchNumber] === 1 ? 'selected-button' : ''}`}
                                                onClick={() => handleBet(match.matchNumber, match.team1Odd, 1)}
                                            >
                                                {match.team1Odd}
                                            </button>
                                        </td>
                                        <td>
                                            <button
                                                className={`bet-button ${selectedBets[match.matchNumber] === 0 ? 'selected-button' : ''}`}
                                                onClick={() => handleBet(match.matchNumber, match.drawOdd, 0)}
                                            >
                                                {match.drawOdd}
                                            </button>
                                        </td>
                                        <td>
                                            <button
                                                className={`bet-button ${selectedBets[match.matchNumber] === 2 ? 'selected-button' : ''}`}
                                                onClick={() => handleBet(match.matchNumber, match.team2Odd, 2)}
                                            >
                                                {match.team2Odd}
                                            </button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td>{roundResults[index]?.goalsTeam1} -  {roundResults[index]?.goalsTeam2}</td>
                                    </>
                                )}
                                <td>{match.team2.name}</td>
                            </tr>
                        ))}
                        </tbody>
                        {bettingEnabled && matches.length > 0 && (
                            <div className="betting-form">
                                <input
                                    type="number"
                                    value={betAmount}
                                    onChange={handleAmountChange}
                                    placeholder="Enter bet amount"
                                />
                                <button onClick={submitBets}>Submit</button>
                            </div>
                        )}
                    </table>
                </div>
                {seasonEnded && <p>The season has ended!</p>}
            </div>
        </div>
    );
};

export default StreamPage;
