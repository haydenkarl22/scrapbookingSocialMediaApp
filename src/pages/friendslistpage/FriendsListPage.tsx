import React from 'react';
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


export default FriendsListPage;