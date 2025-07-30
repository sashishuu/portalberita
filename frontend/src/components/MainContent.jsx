import React from 'react';
import Card from './Card';

const MainContent = () => {
  return (
    <div className="content">
      <div className="section">
        <h3>Berita Terbaru</h3>
        <div className="cards">
          <Card />
          <Card />
        </div>
      </div>

      <div className="section">
        <h3>Konten Personalized</h3>
        <div className="cards">
          <Card />
          <Card />
        </div>
      </div>

      <div className="section">
        <h3>Rekomendasi</h3>
        <div className="cards">
          <Card />
          <Card />
        </div>
      </div>
    </div>
  );
};

export default MainContent;
