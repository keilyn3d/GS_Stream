import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import SingleView from './components/Viewer/SingleView';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/viewer" element={<SingleView />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
