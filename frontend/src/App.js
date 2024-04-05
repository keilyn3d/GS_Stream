import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import SingleViewer from './components/Viewer/SingleViewer';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/viewer" element={<SingleViewer />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
