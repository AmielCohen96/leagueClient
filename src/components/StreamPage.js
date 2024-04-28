import React, { useEffect, useState } from 'react';
import './StreamPage.css';
import axios from "axios";
import { useLocation } from 'react-router-dom';
import NavigationBar from './NavigationBar';
import LeagueTable from './LeagueTable';
import BettingForm from './BettingForm';
import SubmittedForms from './SubmittedForms';
import MatchesContainer from './MatchesContainer';


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
            <NavigationBar
                username={username}
                userBalance={userBalance}
                handleStats={handleStats}
                handleProfile={handleProfile}
            />
            <div className="tables-container">
                <LeagueTable teams={teams} />
                {bettingEnabled ? (
                    <BettingForm
                        currentBetForm={currentBetForm}
                        betAmount={betAmount}
                        handleAmountChange={handleAmountChange}
                        submitBets={submitBets}
                        bettingEnabled={bettingEnabled}
                    />
                ) : (
                    <SubmittedForms
                        submittedForms={submittedForms}
                        showFinalResult={showFinalResult}
                        checkWinningBetsAndUpdateBalance={checkWinningBetsAndUpdateBalance}
                    />
                )}
                <MatchesContainer
                    currentMatches={currentMatches}
                    bettingEnabled={bettingEnabled}
                    selectedBets={selectedBets}
                    handleCheckboxChange={handleCheckboxChange}
                    currentRound = {currentRound}
                    showFinalResult = {showFinalResult}
                    currentMinute = {currentMinute}
                />
            </div>
            {seasonEnded && <p>The season has ended!</p>}
        </div>
    );
};

export default StreamPage;