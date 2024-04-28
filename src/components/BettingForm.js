import React from 'react';

const BettingForm = ({ currentBetForm, betAmount, handleAmountChange, submitBets, bettingEnabled }) => {
    return (
        <div className="betting-form-container">
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
    );
};

export default BettingForm;
