import React, { useEffect, useState } from 'react';
import './StreamPage.css';
import axios from "axios";
import { useLocation } from 'react-router-dom';


const StreamPage = () => {
    const [teams, setTeams] = useState([]);
    const [currentRound, setCurrentRound] = useState(1);
    const [seasonEnded, setSeasonEnded] = useState(false);
    const [bettingEnabled, setBettingEnabled] = useState(false); // Control betting phase
    const [selectedBets, setSelectedBets] = useState({});
    const [betAmount, setBetAmount] = useState(0);
    const [currentMatches, setCurrentMatches] = useState([]);
    const [currentMinute, setCurrentMinute] = useState(1); // Current minute counter
    const [showFinalResult, setShowFinalResult] = useState(false); // Flag to show final result
    const [currentBetForm, setCurrentBetForm] = useState([]); // Holds current betting form
    const [submittedForms, setSubmittedForms] = useState([]); // Holds all submitted forms
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialUsername = queryParams.get('username') || '';
    const [username, setUsername] = useState(initialUsername);
    const initialPassword = queryParams.get('password') || '';
    const [password, setPassword] = useState(initialPassword);
    const [userBalance, setUserBalance] = useState([]);


    useEffect(() => {
        // Function to fetch initial page details from the server
        const fetchInitialPageDetails = async () => {
            try {
                const response = await axios.get('http://localhost:9124/init-page-details');
                const { currentRound, teams, betEnable } = response.data;
                setCurrentMatches(currentRound);
                setTeams(teams);
                setBettingEnabled(betEnable);
            } catch (error) {
                console.error('Error fetching initial page details:', error);
            }
        };
        const fetchUserBalance = async () => {
            try {
                // Make a request to fetch user balance using the username
                const response = await axios.get('http://localhost:9124/get-user-balance', {
                    params: {
                        username: username
                    }
                });
                setUserBalance(response.data.balance);
            } catch (error) {
                console.error('Error fetching user balance:', error);
            }
        };

        fetchInitialPageDetails();
        fetchUserBalance(); // Fetch user balance when the component mounts
        const storedSubmittedForms = sessionStorage.getItem('submittedForms');
        if (storedSubmittedForms) {
            setSubmittedForms(JSON.parse(storedSubmittedForms));
        }
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
            setBettingEnabled(true);
            setShowFinalResult(false);
            setCurrentMinute(0);
            setSubmittedForms([]);
        });

        eventSource.addEventListener('betting-end', () => {
            console.log("Betting phase ended");
            setBettingEnabled(false);
            setCurrentBetForm([]);
            setSelectedBets({});
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
            setSubmittedForms(prevSubmittedForms => {
                const updatedForms = [...prevSubmittedForms];
                if (updatedForms.length > 0) {
                    checkWinningBets(updatedForms);
                }
                return updatedForms;
            });
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
            // Handle season start here
        });

        return () => {
            eventSource.close();
        };
    }, []);

    useEffect(() => {
        // Save submitted forms to sessionStorage whenever it changes
        sessionStorage.setItem('submittedForms', JSON.stringify(submittedForms));
    }, [submittedForms]);

    const handleProfile = () => {
        console.log('Redirecting to profile page...');
        window.location.href = '/profile-page';
    };


    const handleAmountChange = (event) => {
        setBetAmount(event.target.value);
    };


    const submitBets = async () => {
        if (betAmount <= 0) {
            alert('Please enter a bet amount greater than 0.');
            return;
        }

        try {
            // Fetch the user's balance
            const balanceResponse = await axios.get('http://localhost:9124/get-user-balance', {
                params: {
                    username: username
                }
            });

            const userBalance = balanceResponse.data.balance;

            if (userBalance >= betAmount) {
                // If user has enough balance, subtract betAmount from userBalance
                const newBalance = userBalance - betAmount;

                // Update user balance on the server
                const updateResponse = await axios.post('http://localhost:9124/update-user-balance', {
                    username: username,
                    amount: newBalance
                });

                if (updateResponse.data.success) {
                    // Update userBalance state with new balance
                    setUserBalance(newBalance);

                    // Continue with submitting the bets
                    const newBetForm = currentBetForm.map(bet => ({
                        ...bet,
                        roundNumber: currentRound,
                        betAmount: betAmount,
                    }));

                    setSubmittedForms(prevForms => [...prevForms, newBetForm]);
                    setCurrentBetForm([]);
                    setSelectedBets({});
                    setBetAmount(0);
                } else {
                    alert('Failed to update user balance. Please try again later.');
                }
            } else {
                alert('You do not have enough money.');
            }
        } catch (error) {
            console.error('Error submitting bets:', error);
            alert('An error occurred while processing your request. Please try again later.');
        }
    };


    const checkWinningBetsAndUpdateBalance = async (forms) => {
        try {
            const updatedForms = [];
            let balanceChange;
            // Update user balance from the server
            const response = await axios.get('http://localhost:9124/get-user-balance', {
                params: {
                    username: username
                }
            });
            const newBalance = response.data.balance;
            // Update user balance if it's not -1 (user found)
            if (newBalance !== -1) {
                balanceChange = newBalance;
            } else {
                console.error('User not found');
            }
            forms.forEach(form => {
                let oddsMultiply  = 1;
                if(form[0].isFormWin){
                    form.forEach(bet => {
                        oddsMultiply  *= oddsMultiply *bet.odd;
                    });
                    balanceChange += oddsMultiply *form[0].betAmount;
                }
                updatedForms.push(form);
            });
            // Update the user balance on the server
            await axios.post('http://localhost:9124/update-user-balance', {
                username: username,
                amount: balanceChange // Pass the updated balance
            });

            // Update the user balance state
            setUserBalance(balanceChange);
        } catch (error) {
            console.error('Error updating user balance:', error);
        }
    };




    const checkWinningBets = async (forms) => {
        if(forms.length !== 0){
            try {
                const response = await axios.post('http://localhost:9124/check-winning-bets', { forms });
                const validatedForms = response.data;
                await checkWinningBetsAndUpdateBalance(validatedForms);
            } catch (error) {
                console.error('Error checking winning bets:', error);
            }
        }
    };

    const handleCheckboxChange = (matchId, odds, result, name) => {
        setSelectedBets(prevBets => {
            const updatedBets = { ...prevBets };
            if (updatedBets[matchId] !== result) {
                updatedBets[matchId] = result;
            } else {
                delete updatedBets[matchId];
                setCurrentBetForm(prevForm => prevForm.filter(bet => bet.matchNumber !== matchId));
            }
            return updatedBets;
        });

        if (selectedBets[matchId] !== result) {
            setCurrentBetForm(prevForm => {
                const existingIndex = prevForm.findIndex(bet => bet.matchNumber === matchId);
                if (existingIndex !== -1) {
                    prevForm[existingIndex] = { roundNumber: currentRound, matchNumber: matchId, bet: result, odd: odds, dec: name };
                } else {
                    prevForm.push({ roundNumber: currentRound, matchNumber: matchId, bet: result, odd: odds, dec: name });
                }
                return prevForm;
            });
        }
    };

    const handleStats = () => {
        console.log('Redirecting to stats page...');
        window.location.href = `/stats?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
    };


    return (
        <div className="welcome-container">
            <div className="navigation-bar">
                <h2>Hello {username}, your current balance is: ${(Number(userBalance)).toFixed(2)}</h2>
                <button className={"stats-info-b"} onClick={handleStats} style={{ width: '250px' }}>Stats and information</button>
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
                {bettingEnabled ? (<div className="betting-form-container">
                        <div className="title-background">
                            <h3>Betting Form</h3>
                        </div>
                        <table>
                            <thead>
                            <tr>
                                <th>Round Number</th>
                                <th>Match Number</th>
                                <th>Bet</th>
                                <th>Odd</th>
                                <th>Team</th>
                            </tr>
                            </thead>
                            <tbody>
                            {currentBetForm.map((bet, index) => (
                                <tr key={index}>
                                    <td>{bet.roundNumber}</td>
                                    <td>{bet.matchNumber}</td>
                                    <td>{bet.bet === 0 ? 'Draw' : bet.bet}</td>
                                    <td>{bet.odd}</td>
                                    <td>{bet.dec}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        <input
                            type="number"
                            value={betAmount}
                            onChange={handleAmountChange}
                            placeholder="Enter bet amount"
                            className="input" // Add className for styling
                        />
                        <button className={bettingEnabled ? "submitButton" : "submitButtonDisabled"} onClick={submitBets} disabled={!bettingEnabled}>Submit Bets</button>
                    </div>
                ) : (
                    <div className="submitted-forms-container">
                        {submittedForms.length>0 && (<div className="title-background">
                            <h3>Submitted Form</h3>
                        </div>)}
                        {submittedForms.map((form, index) => {
                            // Calculate the total odds multiplier for the form
                            const totalOddsMultiplier = form.reduce((acc, bet) => acc * bet.odd, 1);
                            // Calculate the expected winning amount
                            const expectedWinningAmount = totalOddsMultiplier * form[0].betAmount; // Assuming all bets in the form have the same bet amount
                            return (
                                <div key={index} className="submitted-form">
                                    <div className="minor-title-background">
                                        <h4>Submitted Form {index + 1}</h4>
                                    </div>
                                    <table>
                                        <thead>
                                        <tr>
                                            <th>Round Number</th>
                                            <th>Match Number</th>
                                            <th>Bet</th>
                                            <th>Odd</th>
                                            <th>Team</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {form.map((bet, idx) => (
                                            <tr key={idx}>
                                                <td>{bet.roundNumber}</td>
                                                <td>{bet.matchNumber}</td>
                                                <td>{bet.bet === 0 ? 'Draw' : bet.bet}</td>
                                                <td>{bet.odd}</td>
                                                <td>{bet.dec}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                    <div className={"Summary form"}> <h5>Bet Amount: ${form[0].betAmount}, Odds Multiplier: {totalOddsMultiplier.toFixed(2)}, Expected Winning: ${expectedWinningAmount.toFixed(2)}</h5></div>
                                </div>
                            );
                        })}
                    </div>
                )}
                <div className="matches-container">
                    <div>
                        <div className="title-background">
                            <h3>Round {currentRound}</h3>
                        </div>
                        {!bettingEnabled &&<div className="minute-counter">
                            <h3>{showFinalResult ? "Final Result" : `${currentMinute}' Minute`}</h3>
                        </div>}
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
                        {currentMatches.map((match, index) => (
                            <tr key={index}>
                                <td>{match.homeTeam}</td>
                                {bettingEnabled ? (
                                    <>
                                        <td>
                                            <label className="checkbox-label">
                                                <input
                                                    className="checkBoxes"
                                                    type="checkbox"
                                                    checked={selectedBets[match.match] === 1}
                                                    onChange={() => handleCheckboxChange(match.match, match.homeOdd, 1, match.homeTeam)}
                                                />
                                                <div className="odd">{match.homeOdd}</div>
                                            </label>
                                        </td>
                                        <td>
                                            <label className="checkbox-label">
                                                <input
                                                    className={"checkBoxes"}
                                                    type="checkbox"
                                                    checked={selectedBets[match.match] === 0}
                                                    onChange={() => handleCheckboxChange(match.match, match.drawOdd, 0, 'X')}
                                                />
                                                <div className="odd">{match.drawOdd}</div>
                                            </label>
                                        </td>
                                        <td>
                                            <label className="checkbox-label">
                                                <input
                                                    className={"checkBoxes"}
                                                    type="checkbox"
                                                    checked={selectedBets[match.match] === 2}
                                                    onChange={() => handleCheckboxChange(match.match, match.awayOdd, 2, match.awayTeam)}
                                                />
                                                <div className="odd">{match.awayOdd}</div>
                                            </label>
                                        </td>
                                    </>

                                ) : (
                                    <>
                                        <td>{match.homeGoals} - {match.awayGoals}</td>
                                    </>
                                )}
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

export default StreamPage;