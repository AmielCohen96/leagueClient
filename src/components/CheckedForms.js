import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {useLocation} from "react-router-dom";
import StreamPage from "./StreamPage";

const CheckedForms = () => {
    const [checkedForms, setCheckedForms] = useState([]);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialUsername = queryParams.get('username') || '';
    const [username, setUsername] = useState(initialUsername);
    const initialPassword = queryParams.get('password') || '';
    const [password, setPassword] = useState(initialPassword);

    useEffect(() => {
        fetchCheckedForms();
    }, []);

    const fetchCheckedForms = async () => {
        try {
            const response = await axios.get('http://localhost:9124/checked-forms'); // Assuming this is the endpoint to fetch checked forms
            setCheckedForms(response.data);
        } catch (error) {
            console.error('Error fetching checked forms:', error);
        }
    };

    useEffect(() => {
        const eventSource = new EventSource('http://localhost:9124/start-streaming');
        eventSource.onmessage = function (event) {

        };


        eventSource.addEventListener('betting-end', () => {
            console.log("Betting phase ended");
        });

        eventSource.addEventListener('round-end', () => {
            try {
                axios.get('http://localhost:9124/checked-forms')
                    .then(response => {
                        setCheckedForms(response.data);
                    })
                    .catch(error => {
                        console.error('Error fetching data:', error);
                    });
                const response2 = axios.post('http://localhost:9124/check-winning-bets', {
                    username: username,
                });
            } catch (error) {
                console.error('Error fetching checked forms:', error);
            }
        });


        eventSource.addEventListener('season-start', () => {
            console.log("Season has started");
            try {
                axios.get('http://localhost:9124/checked-forms')
                    .then(response => {
                        setCheckedForms(response.data);
                    })
                    .catch(error => {
                        console.error('Error fetching data:', error);
                    });
            } catch (error) {
                console.error('Error fetching checked forms:', error);
            }
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
        <div className={"checked-forms"}>
            <div>
                <button className={"stats-info-b"} onClick={handleStream} style={{ width: '250px', marginTop: '50px', marginBottom: '-100px' }}>Back to Live</button>
            </div>
            <h2>Checked Forms</h2>
            <table>
                <thead>
                <tr>
                    <th>Form Number</th>
                    <th>Number of Bets</th>
                    <th>Bet Amount</th>
                    <th>Odd Multiplier</th>
                    <th>Potential Winning Amount</th>
                    <th>Form Win</th>
                </tr>
                </thead>
                <tbody>
                {checkedForms.map(form => (
                    <tr key={form.formNumber}>
                        <td>{form.formNumber}</td>
                        <td>{form.numBets}</td>
                        <td>{form.betAmount}</td>
                        <td>{(Number(form.oddMultiplier)).toFixed(2)}</td>
                        <td>{(Number(form.potentialWinningAmount)).toFixed(2)}</td>
                        <td style={{ color: form.formWin ? 'green' : 'red' }}>{form.formWin ? 'Yes' : 'No'}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default CheckedForms;
