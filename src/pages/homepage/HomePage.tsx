import React from 'react';
import "./homepage.css"



const HomePage: React.FC = () => {
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
                <input
                    className = "scrapname"
                    type = "text"
                    placeholder = {"My ScrapBook"}
                />
            </div>
        </div>
        </>
    );
}


export default HomePage;