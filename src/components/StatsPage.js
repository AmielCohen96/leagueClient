import React, {useEffect, useState} from 'react';
import axios from "axios";
import StreamPage from "./StreamPage";
import {useLocation} from "react-router-dom";
import InjuriesAndRedCardsTable from "./InjuriesAndRedCardsTable"; // Import the component
import BestAttack from "./BestAttack"
import BestDefence from "./BestDefense"
import LastGames from "./LastGames"


const StatsPage = () => {
    const [teams, setTeams] = useState([]);
    const [currentRound, setCurrentRound] = useState(1);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialUsername = queryParams.get('username') || '';
    const [username, setUsername] = useState(initialUsername);
    const initialPassword = queryParams.get('password') || '';
    const [password, setPassword] = useState(initialPassword);


    useEffect(() => {
        // Function to fetch initial page details from the server
        const fetchInitialPageDetails = async () => {
            try {
                const response = await axios.get('http://localhost:9124/init-page-details');
                const { currentRound, teams, betEnable } = response.data;
                setCurrentRound(currentRound[0].round)
                setTeams(teams);
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

        eventSource.addEventListener('round-end', () => {
            console.log("Round ended");
            axios.get('http://localhost:9124/update-table')
                .then(response => {
                    setTeams(response.data);
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
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
            // Handle season start here
        });

        return () => {
            eventSource.close();
        };
    }, []);

    const handleStream = () => {
        console.log('Redirecting to stream page...');
        window.location.href = `/stream-page?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
    };

    return (
        <div className={"stats-info"}>
            <div>
                <button className={"stats-info-b"} onClick={handleStream} style={{ width: '250px', marginTop: '50px', marginBottom: '-100px' }}>Back to Live</button>
            </div>
            <div className={"tables-container"} >
                <BestAttack teams={teams} />
                <BestDefence teams={teams} />
                <InjuriesAndRedCardsTable teams={teams} />
                <LastGames teams={teams} />
            </div>
        </div>

    );
};


export default StatsPage;