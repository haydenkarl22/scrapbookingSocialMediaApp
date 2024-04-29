import React from 'react';
import { Link } from 'react-router-dom';
import "./scrapbookpage.css";

const ScrapbookPage: React.FC = () => {
    return (
        <>
            <header className='nohead'>ScrapP@ges</header>
            <div className='buttonbar'>
                <Link to="/friends" className='friendsbutton'>Friends</Link>
                <Link to="/" className='homebutton'>Home</Link>
                <Link to="/profile" className='profilebutton'>My Profile</Link>
                <Link to="/scrapbook" className='scrapbookbutton'>Scrapbook</Link>
            </div>
            <div className='subDiv'>
                <div className='sub'>
                    {/* Content of the page */}
                </div>
            </div>
        </>
    );
}

export default ScrapbookPage;
