import React from 'react';
import { LogOut, User } from 'lucide-react';


// const Navbar = () => {
//     return (
//         <header className="navbar">
//             <div className="navbar-brand">
//                 <span className="logo">🌱</span>
//                 <h1>Greenhouse Smart Monitoring</h1>
//             </div>
//             <div className="status-badge online">
//                 <span className="dot">●</span> System Online
//             </div>
//         </header>
//     );
// };

const Navbar = ({ user, onLogout }) => {
    return (
        <header className="navbar">
            <div className="navbar-brand">
                <span className="logo">🌱</span>
                <h1>Greenhouse Smart Monitoring</h1>
            </div>

            {user ? (
                <div className="user-profile">
                    <span className="role-badge">{user.role?.toUpperCase()}</span>
                    <span className="user-name">
                        <User size={16} /> {user.username}
                    </span>
                    <button onClick={onLogout} className="btn-logout" title="Logout">
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            ) : (
                <div className="status-badge online">
                    <span className="dot">●</span> System Online
                </div>
            )}
        </header>
    );
};

export default Navbar;
