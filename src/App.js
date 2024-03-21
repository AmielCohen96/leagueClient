import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginComponent from './components/LoginComponent';
import SignupComponent from './components/SignupComponent';
import StreamPage from './components/StreamPage';
import ProfilePage from './components/ProfilePage';
import './App.css'; // Import your CSS file
import backgroundImg from './images/football.jpeg';

const App = () => {
    const appStyle = {
        backgroundImage: `url(${backgroundImg})`, // Use the imported image
        backgroundSize: 'cover', // Adjust as needed
        backgroundPosition: 'center', // Adjust as needed
        // Other styles for your component
        width: '100vw', // Ensure full width of the screen
        height: '100vh', // Ensure full height of the screen
    };

    return (
        <div className="App" style={appStyle}>
            <Router>
                <div className="app-container">
                    <Routes>
                        <Route path="/" element={<LoginComponent />} />
                        <Route path="/signup" element={<SignupComponent />} />
                        <Route path="/stream-page" element={<StreamPage />} />
                        <Route path="/profile-page" element={<ProfilePage />} />
                    </Routes>
                </div>
            </Router>
        </div>
    );
};

export default App;
