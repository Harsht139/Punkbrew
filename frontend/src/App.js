import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Search from './pages/Search';
import Geographic from './pages/Geographic';
import Pipeline from './pages/Pipeline';
import LookerDashboard from './pages/LookerDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <div className="container-fluid mt-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/search" element={<Search />} />
            <Route path="/geographic" element={<Geographic />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/looker" element={<LookerDashboard />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
