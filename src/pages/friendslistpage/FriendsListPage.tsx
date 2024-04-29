import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import "./friendslistpage.css";
import WebRTCManager from '../../components/webRTCManager/WebRTCManager';  // Ensure the path is correct

const FriendsListPage: React.FC = () => {
    const [signaling, setSignaling] = useState<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8080');
        setSignaling(ws);
        return () => ws.close();
    }, []);

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
                    {signaling ? <WebRTCManager signaling={signaling} /> : <p>Connecting...</p>}
                </div>
            </div>
        </>
    );
};

export default FriendsListPage;
