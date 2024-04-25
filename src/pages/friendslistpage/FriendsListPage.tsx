import React, { useEffect, useState } from 'react';
import "./friendslistpage.css";
import WebRTCManager from '../../components/webRTCManager/WebRTCManager';  // Ensure the path is correct

const FriendsListPage: React.FC = () => {
    const [signaling, setSignaling] = useState<WebSocket | null>(null);

    useEffect(() => {
        // Establish the WebSocket connection
        const ws = new WebSocket('ws://localhost:8080');
        setSignaling(ws);

        // Cleanup the WebSocket on component unmount
        return () => {
            ws.close();
        };
    }, []);

    return (
        <>
            <header className='nohead'>ScrapP@ges</header>
            <div className='buttonbar'>
                <button className='friendsbutton'>Friends</button>
                <button className='homebutton'>Home</button>
                <button className='profilebutton'>My Profile</button>
                <button className='scrapbookbutton'>ScrapBook</button>
            </div>
            <div className='subDiv'>
                <div className='sub'>
                    {/* Conditionally render WebRTCManager when signaling is ready */}
                    {signaling ? <WebRTCManager signaling={signaling} /> : <p>Connecting...</p>}
                </div>
            </div>
        </>
    );
};

export default FriendsListPage;









/* import React from 'react';
import "./friendslistpage.css"


const FriendsListPage: React.FC = () => {
    return <div> This is the friends list page. </div>;
    
    
    
    
    
    
    
    return ( 
        <>
        <header className='nohead'> ScrapP@ges </header>
        <div className='buttonbar'>
            <button className='friendsbutton'> Friends </button>
            <button className='homebutton'> Home </button>
            <button className='profilebutton'> My Profile </button>
            <button className='scrapbookbutton'> ScrapBook </button>
        </div>
        <div className='subDiv'>
            <div className='sub'>
                
            </div>
        </div>
        </>
    );
}


export default FriendsListPage; */