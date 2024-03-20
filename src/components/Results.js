import React, { useEffect, useState } from 'react';
import './Results.css';
import axios from "axios";
import './StreamPage'


const Results = (props) => {
    const [teams, setTeams] = useState([]);
    const [localRoundResults, setLocalRoundResults] = useState([]);    const [currentRound, setCurrentRound] = useState(1);
    const [totalRounds, setTotalRounds] = useState(0);
    const [matches, setMatches] = useState([]);
    const [seasonEnded, setSeasonEnded] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [balance, setBalance] = useState(0); // State to store user balance
    const [newBalance, setNewBalance] = useState(0);



    return (
        <div>
            <table>
            <thead>
            <tr>
                <th>Home team</th>
                <th>Score</th>
                <th>Away team</th>
            </tr>
            </thead>
            <tbody>
            {props.roundResults.map((matchResult, index) => (
                <tr key={index}>
                    <td>{matchResult.team1.name}</td>
                    <td>{matchResult.team1.goals} -  {matchResult.team2.goals}</td>
                    <td>{matchResult.team2.name}</td>
                </tr>
            ))}
            </tbody>
        </table>
    </div>
    );
};

export default Results;
