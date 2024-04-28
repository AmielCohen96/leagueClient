import React from 'react';

const SubmittedForms = ({ submittedForms, showFinalResult, checkWinningBetsAndUpdateBalance }) => {
    return (
        <div className="submitted-forms-container">
            {submittedForms.length > 0 && (<div className="title-background">
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
    );
};

export default SubmittedForms;
