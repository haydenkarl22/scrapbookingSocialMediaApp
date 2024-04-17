import React from 'react';
import "./profilepage.css"

const ProfilePage: React.FC = () => {
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


export default ProfilePage;