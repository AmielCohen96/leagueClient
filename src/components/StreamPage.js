import React, {useEffect, useState} from 'react';
import './StreamPage.css';
import axios from "axios";

const StreamPage = ({ username }) => {

    const [teams, setTeams] = useState([]);

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const response = await axios.get('http://localhost:9124/generateTeams');
                setTeams(response.data);
            } catch (error) {
                console.error('Error fetching teams:', error);
            }
        };
        fetchTeams();
    }, []);


    return (
        <div className="welcome-container">
            <div className="navigation-bar">
                <h2>Hello {username}</h2>
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
                    <div className="button-container">
                        <button>Click To Gamble</button>
                    </div>
                </div>
                <div className="right-table">
                    <div className="title-background">
                        <h3>Score Table</h3>
                    </div>
                    <table>
                        <thead>
                        <tr>
                            <th>Overall Points</th>
                            <th>Team</th>
                        </tr>
                        </thead>
                        <tbody>
                        {[...Array(11)].map((_, index) => (
                            <tr key={index}>
                                <td>Data</td>
                                <td>Data</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StreamPage;