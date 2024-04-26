import React from 'react';
import { Link } from 'react-router-dom';
import './homepage.css';

const HomePage: React.FC = () => {
    return (
        <>
            <header className='nohead'> ScrapP@ges </header>
            <div className='buttonbar'>
                <Link to="/friends" className='friendsbutton'> Friends </Link>
                <Link to="/" className='homebutton'> Home </Link>
                <Link to="/profile?mode=signin" className='profilebutton'> Sign In </Link>
                <Link to="/scrapbook" className='scrapbookbutton'> ScrapBook </Link>
            </div>
            <div className='subDiv'>
                <div className='sub'>
                    <input
                        className="scrapname"
                        type="text"
                        placeholder={"My ScrapBook"}
                    />
                </div>
            </div>
        </>
    );
}

export default HomePage;
