import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import LoginComponent from './components/LoginComponent';
import SignupComponent from './components/SignupComponent';
import './App.css'; // Import your CSS file

import backgroundImage from './images/backGround.jpeg';

const App = () => {
    return (
        <Router>
            <div>
                <Routes>
                    <Route path="/" element={<LoginComponent />} />
                    <Route path="/signup" element={<SignupComponent />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
