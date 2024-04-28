import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import './homepage.css';

const HomePage: React.FC = () => {
    const [isUserSignedIn, setIsUserSignedIn] = useState(false);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setIsUserSignedIn(!!user); // If user is not null, set signed in to true
        });

        return () => unsubscribe(); // Cleanup subscription on unmount
    }, []);

    return (
        <>
            <header className='nohead'>ScrapP@ges</header>
            <div className='buttonbar'>
                <Link to="/friends" className='friendsbutton'> Friends </Link>
                <Link to="/" className='homebutton'> Home </Link>
                {isUserSignedIn ? (
                    <Link to="/profile" className='profilebutton'> Profile </Link>
                ) : (
                    <Link to="/profile?mode=signin" className='profilebutton'> Sign In </Link>
                )}
                <Link to="/scrapbook" className='scrapbookbutton'> ScrapBook </Link>
            </div>
            <div className='subDiv'>
                <div className='sub'>
                    <input
                        className="scrapname"
                        type="text"
                        placeholder="My ScrapBook"
                    />
                </div>
            </div>
        </>
    );
}

export default HomePage;
