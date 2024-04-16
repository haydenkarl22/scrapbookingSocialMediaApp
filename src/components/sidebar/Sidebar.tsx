import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
    return (
        <header>
            <nav>
                <ul>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/profile">Profile</Link></li>
                    <li><Link to="/scrapbook">Scrapbook</Link></li>
                    <li><Link to="/friends">Friends List</Link></li>
                </ul>
            </nav>
        </header>
    );
}

export default Header;