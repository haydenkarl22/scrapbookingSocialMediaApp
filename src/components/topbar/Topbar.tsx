import React from 'react';
import { Link } from 'react-router-dom';
import './topbar.css'

const Topbar = () => {
    return (
        <header className="topbar">
            <nav>
                <ul className="topList">
                    <li className="topListItem">
                        <Link className="link" to="/">HOME</Link>
                    </li>
                    <li className="topListItem">
                        <Link className="link" to="/profile">PROFILE</Link>
                    </li>
                    <li className="topListItem">
                        <Link className="link" to="/scrapbook">SCRAPBOOK</Link>
                    </li>
                    <li className="topListItem">
                        <Link className="link" to="/friends">FRIENDS</Link>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default Topbar;
