import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from './components/Main/Index';
import SingleView from './components/View/SSR/Single/SingleView';
import DualView from './components/View/SSR/Dual/DualView';

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
