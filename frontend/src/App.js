import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from './components/Main/Index';
import SingleView from './components/Viewer/SingleView';
import DualView from 'components/Viewer/DualView';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/dual-view" element={<DualView />} />
        <Route path="/single-view" element={<SingleView />} />
      </Routes>
    </Router>
  );
}

export default App;
