import React from 'react';
import './styles/global.css';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';

const App = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <MainContent />
    </div>
  );
};

export default App;
