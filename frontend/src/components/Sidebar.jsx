import React from 'react';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>Portal Berita</h2>
      <ul>
        <li className="active">Beranda</li>
        <li>Kategori</li>
        <li>Pencarian</li>
        <li>Login</li>
      </ul>
      <footer style={{ marginTop: '2rem', fontSize: '0.8rem' }}>
        <div>© 2025 Portal Berita</div>
        <a href="/" style={{ display: 'block', marginTop: '0.5rem' }}>Privacy Policy | Terms of Service</a>
      </footer>
    </div>
  );
};

export default Sidebar;
