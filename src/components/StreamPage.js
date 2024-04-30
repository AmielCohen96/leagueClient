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
                const { currentRound, teams, betEnable, submittedForms, current } = response.data;
                setCurrentMatches(currentRound);
                setTeams(teams);
                setBettingEnabled(betEnable);
                setSubmittedForms(submittedForms);
                setCurrentRound(current);
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
        // Ensure that betAmount is properly parsed as a number
        const parsedBetAmount = parseFloat(betAmount);

        if (parsedBetAmount <= 0 || isNaN(parsedBetAmount)) {
            alert('Please enter a valid bet amount greater than 0.');
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

            if (userBalance >= parsedBetAmount) {
                // If user has enough balance, subtract parsedBetAmount from userBalance
                const newBalance = userBalance - parsedBetAmount;

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
                        betAmount: parsedBetAmount, // Use parsedBetAmount here
                    }));

                    const saveResponse = await axios.post('http://localhost:9124/save-bets', {
                        bets: newBetForm
                    });

                    if (saveResponse.data.success) {
                        // Clear current bet form and selected bets
                        setCurrentBetForm([]);
                        setSelectedBets({});
                        setBetAmount(0);
                        // Update submitted forms state with the saved bets
                        setSubmittedForms(prevForms => [...prevForms, newBetForm]);
                    } else {
                        alert('Failed to save bets. Please try again later.');
                    }
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


    const checkWinningBets = async (forms) => {
        if(forms.length !== 0){
            try {
                const response2 = await axios.post('http://localhost:9124/check-winning-bets', {
                    username: username,
                });
                const response3 = await axios.get('http://localhost:9124/get-user-balance', {
                    params: {
                        username: username
                    }
                });
                let newBalance = response3.data.balance;
                setUserBalance(newBalance);
                const validatedForms = response2.data;
                console.log(validatedForms)
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

    const handleCheckedForms = () => {
        console.log('Redirecting to stats page...');
        window.location.href = `/checked-forms?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
    };


    return (
        <div className="welcome-container">
            <NavigationBar
                username={username}
                userBalance={userBalance}
                handleProfile={handleProfile}
            />
            <button className={"stats-info-b"} onClick={handleStats} style={{ width: '250px' }}>Stats and information</button>
            <button className={"stats-info-b"} onClick={handleCheckedForms} style={{ width: '250px' }}>Checked Forms</button>
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