import React from 'react';

const MatchesContainer = ({ currentMatches, bettingEnabled, selectedBets, handleCheckboxChange, currentRound, showFinalResult, currentMinute}) => {
    return (
        <div className="matches-container">
            <div>
                <div className="title-background">
                    <h3>Round {currentRound}</h3>
                </div>
                {!bettingEnabled && <div className="minute-counter">
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
                                            onChange={() => handleCheckboxChange(match.match, (Number(match.homeOdd)).toFixed(2), 1, match.homeTeam)}
                                        />
                                        <div className="odd">{(Number(match.homeOdd)).toFixed(2)}</div>
                                    </label>
                                </td>
                                <td>
                                    <label className="checkbox-label">
                                        <input
                                            className={"checkBoxes"}
                                            type="checkbox"
                                            checked={selectedBets[match.match] === 0}
                                            onChange={() => handleCheckboxChange(match.match, (Number(match.drawOdd)).toFixed(2), 0, 'X')}
                                        />
                                        <div className="odd">{(Number(match.drawOdd)).toFixed(2)}</div>
                                    </label>
                                </td>
                                <td>
                                    <label className="checkbox-label">
                                        <input
                                            className={"checkBoxes"}
                                            type="checkbox"
                                            checked={selectedBets[match.match] === 2}
                                            onChange={() => handleCheckboxChange(match.match, (Number(match.awayOdd)).toFixed(2), 2, match.awayTeam)}
                                        />
                                        <div className="odd">{(Number(match.awayOdd)).toFixed(2)}</div>
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
    );
};

export default MatchesContainer;
