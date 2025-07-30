import React from 'react';
import './styles/global.css';

function App() {
  return (
    <div className="app-container">
      <aside className="sidebar">
        <h2 className="sidebar-title">Portal Berita</h2>
        <nav className="sidebar-menu">
          <a href="#" className="active">Beranda</a>
          <a href="#">Kategori</a>
          <a href="#">Pencarian</a>
          <a href="#">Login</a>
        </nav>
        <footer className="sidebar-footer">
          <p>&copy; 2025 Portal Berita</p>
          <div>
            <a href="#">Privacy Policy</a> | <a href="#">Terms of Service</a>
          </div>
        </footer>
      </aside>

      <main className="main-content">
        <section>
          <h3>Berita Terbaru</h3>
          <div className="card-grid">
            <div className="card" />
            <div className="card" />
          </div>
        </section>

        <section>
          <h3>Konten Personalized</h3>
          <div className="card-grid">
            <div className="card" />
            <div className="card" />
          </div>
        </section>

        <section>
          <h3>Rekomendasi</h3>
          <div className="card-grid recommendation">
            <div className="card" />
            <div className="card" />
            <div className="card" />
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
