import React from 'react';

const Navbar = () => {
    return (
        <header className="navbar">
            <div className="navbar-brand">
                <span className="logo">🌱</span>
                <h1>Greenhouse Smart Monitoring</h1>
            </div>
            <div className="status-badge online">
                <span className="dot">●</span> System Online
            </div>
        </header>
    );
};

export default Navbar;