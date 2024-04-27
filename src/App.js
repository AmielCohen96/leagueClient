// App.js

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginComponent from './components/LoginComponent';
import SignupComponent from './components/SignupComponent';
import StreamPage from './components/StreamPage';
import ProfilePage from './components/ProfilePage';
import './App.css'; // Import your CSS file
import WithoutLoginStream from "./components/WithoutLoginStream";
import StatsPage from "./components/StatsPage";
import BackgroundWrapper from './BackgroundWrapper'; // Import the BackgroundWrapper component

const App = () => {
    return (
        <BackgroundWrapper> {/* Wrap the entire App component with the BackgroundWrapper */}
            <Router>
                <div className="app-container">
                    <Routes>
                        <Route path="/" element={<LoginComponent />} />
                        <Route path="/signup" element={<SignupComponent />} />
                        <Route path="/stream-page" element={<StreamPage />} />
                        <Route path="/profile-page" element={<ProfilePage />} />
                        <Route path="/without-login-stream" element={<WithoutLoginStream />} />
                        <Route path="/stats" element={<StatsPage />} />
                    </Routes>
                </div>
            </Router>
        </BackgroundWrapper>
    );
};

export default App;
