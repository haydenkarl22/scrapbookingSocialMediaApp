import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import './homepage.css';

const HomePage: React.FC = () => {
  const [isUserSignedIn, setIsUserSignedIn] = useState(false);
  const [scrapbookUrl, setScrapbookUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsUserSignedIn(!!user); // If user is not null, set signed in to true
      setUserId(user?.uid || null);
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  useEffect(() => {
    const fetchScrapbook = async () => {
      if (userId) {
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setScrapbookUrl(userDoc.data().scrapbookUrl || null);
        }
      }
    };

    fetchScrapbook();
  }, [userId]);

  return (
    <>
      <header className='nohead'>ScrapP@ges</header>
      <div className='buttonbar'>
        <Link to="/friends" className='friendsbutton'>
          Friends
        </Link>
        <Link to="/" className='homebutton'>
          Home
        </Link>
        {isUserSignedIn ? (
          <Link to="/profile" className='profilebutton'>
            My Profile
          </Link>
        ) : (
          <Link to="/profile?mode=signin" className='profilebutton'>
            Sign In
          </Link>
        )}
        <Link to="/scrapbook" className='scrapbookbutton'>
          Scrapbook
        </Link>
      </div>
      <div className='subDiv'>
        <div className='sub'>
          {scrapbookUrl ? (
            <div>
              <h2>Your Scrapbook:</h2>
              <div className="scrapbook-box">
                <img src={scrapbookUrl} alt="Scrapbook" />
              </div>
            </div>
          ) : (
            <p>No scrapbook found. Create one in the Scrapbook section.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default HomePage;