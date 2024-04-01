import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Viewer from './components/Viewer/Viewer';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/viewer" element={<Viewer />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
