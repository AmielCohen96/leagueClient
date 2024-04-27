import React, { useEffect, useState } from 'react';
import './WithoutLoginStream.css';
import axios from "axios";


const WithoutLoginStream = () => {
    const [teams, setTeams] = useState([]);
    const [currentRound, setCurrentRound] = useState(1);
    const [seasonEnded, setSeasonEnded] = useState(false);
    const [currentMatches, setCurrentMatches] = useState([]);
    const [currentMinute, setCurrentMinute] = useState(1); // Current minute counter
    const [showFinalResult, setShowFinalResult] = useState(false); // Flag to show final result
    const [roundStarted, setRoundStarted] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');


    useEffect(() => {
        // Function to fetch initial page details from the server
        const fetchInitialPageDetails = async () => {
            try {
                const response = await axios.get('http://localhost:9124/init-page-details');
                const { currentRound, teams, betEnable } = response.data;
                setCurrentMatches(currentRound);
                setTeams(teams);
                setRoundStarted(betEnable)
            } catch (error) {
                console.error('Error fetching initial page details:', error);
            }
        };
        fetchInitialPageDetails();
        return () => {
            // Clean up event listeners or subscriptions if needed
        };
    }, []); // Empty dependency array to fetch user balance only once when the component mounts



    useEffect(() => {
        const eventSource = new EventSource('http://localhost:9124/start-streaming');
        eventSource.onmessage = function (event) {
            const eventData = JSON.parse(event.data);
            setCurrentRound(eventData.thisRoundNumber); // Update current round number
            setCurrentMinute(eventData.currentMinute); // Update current minute
            setCurrentMatches(eventData.currentRound); // Update current matches
        };

        eventSource.addEventListener('round-start', () => {
            console.log("Betting phase started");
            setShowFinalResult(false);
            setCurrentMinute(0);
            setRoundStarted(true)
        });


        eventSource.addEventListener('round-end', () => {
            console.log("Round ended");
            axios.get('http://localhost:9124/update-table')
                .then(response => {
                    setTeams(response.data);
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
            setShowFinalResult(true);
        });


        eventSource.addEventListener('season-end', () => {
            console.log("Season ended");
            setSeasonEnded(true);
        });

        eventSource.addEventListener('season-start', () => {
            console.log("Season has started");
            axios.get('http://localhost:9124/update-table')
                .then(response => {
                    setTeams(response.data);
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
            setSeasonEnded(false);
        });

        eventSource.addEventListener('betting-end', () => {
            console.log("Betting phase ended");
            setRoundStarted(false);
        });

        return () => {
            eventSource.close();
        };
    }, []);

    const handleLogin = async (event) => {
        console.log('Username:', username);
        console.log('Password:', password);

        event.preventDefault();
        try {
            const response = await axios.post('http://localhost:9124/login', null,{params: {
                    username,
                    password
                }});
            console.log('Login response:', response.data);
            if (response.data.success) {
                console.log("good")
                window.location.href = `/stream-page?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
            } else {
                console.log("bad")
            }
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    const handleSignUp = () => {
        console.log('Redirecting to sign up page...');
        window.location.href = '/signup';
    };


    return (
        <div className="welcome-container">
            <div className="navigation-bar-W">
                <div className="login-register-w">
                    <span> Username </span>
                    <input className={"textBox-LP"} type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} style={{ width: '100px' }} />
                    <span> Password </span>
                    <input className={"textBox-LP"} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100px' }} />
                    <button className={"button-LP"} onClick={handleLogin} style={{ width: '100px' }}>Sign In</button>
                    <button className={"button-LP"} onClick={handleSignUp} style={{ width: '100px' }}>Sign Up</button>
                </div>
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
                <div className="matches-container">
                    <div>
                        <div className="title-background">
                            <h3>Round {currentRound}</h3>
                        </div>
                        {roundStarted ?
                            (<div className="minute-counter">
                                <h3>Wait for the Matches to start</h3>
                            </div>
                            ) : (
                                <div className="minute-counter">
                                    <h3>{showFinalResult ? "Final Result" : `${currentMinute}' Minute`}</h3>
                                </div>
                            )
                        }
                    </div>
                    <table>
                        <thead>
                        <tr>
                            <th>Home team</th>
                            <th>Score</th>
                            <th>Away team</th>
                        </tr>
                        </thead>
                        <tbody>
                        {currentMatches.map((match, index) => (
                            <tr key={index}>
                                <td>{match.homeTeam}</td>
                                <td>{match.homeGoals} - {match.awayGoals}</td>
                                <td>{match.awayTeam}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {seasonEnded && <p>The season has ended!</p>}
        </div>
    );
};

export default WithoutLoginStream;