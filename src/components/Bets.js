import React, { useEffect, useState } from 'react';
import './Bets.css';
import axios from "axios";
import './StreamPage'


const Bets = (props) => {
    const [teams, setTeams] = useState([]);
    const [localsRoundResults, setLocalsRoundResults] = useState([]);    const [currentRound, setCurrentRound] = useState(1);
    const [totalRounds, setTotalRounds] = useState(0);
    const [matches, setMatches] = useState([]);
    const [seasonEnded, setSeasonEnded] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [balance, setBalance] = useState(0); // State to store user balance
    const [newBalance, setNewBalance] = useState(0);


    useEffect(() => {
        setCurrentRound(10);
        console.log(props.games);
    },[currentRound]);


    return (
        <div>
            <table>
                <thead>
                <tr>
                    <th>Home team</th>
                    <th>Draw</th>
                    <th>Away team</th>
                </tr>
                </thead>
                <tbody>
                {props.games.map((game, gameIndex) => (
                    game.map((match, matchIndex) => (
                        <tr key={gameIndex + '-' + matchIndex}>
                            <td>
                                <button>{match.team1.name}</button>
                            </td>
                            <td>
                                <button>{/* Add content for draw */}</button>
                            </td>
                            <td>
                                <button>{match.team2.name}</button>
                            </td>
                        </tr>
                    ))
                ))}
                </tbody>
            </table>
        </div>

    );
};

export default Bets;
