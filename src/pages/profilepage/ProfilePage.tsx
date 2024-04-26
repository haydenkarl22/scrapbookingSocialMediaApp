import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { auth } from '../../firebase-config';
import './profilepage.css'; // Ensure the CSS file is correctly imported

const ProfilePage: React.FC = () => {
    const [signUpEmail, setSignUpEmail] = useState('');
    const [signUpPassword, setSignUpPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [username, setUsername] = useState('');

    const [signInEmail, setSignInEmail] = useState('');
    const [signInPassword, setSignInPassword] = useState('');

    const [userProfile, setUserProfile] = useState<any>(null);
    const [bio, setBio] = useState('');
    const [editBio, setEditBio] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                setUserProfile(user);
                setBio(''); // Initialize bio
            } else {
                setUserProfile(null);
            }
        });
        return () => unsubscribe();
    }, []);

    const handleSignUp = async () => {
        if (signUpPassword !== confirmPassword) {
            alert("Passwords don't match");
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, signUpEmail, signUpPassword);
            await updateProfile(userCredential.user, { displayName: username });
            setUserProfile(userCredential.user);
            navigate('/');  
        } catch (error: any) {
            console.error("Error in SignUp:", error.message);
            alert(error.message);
        }
    };

    const handleSignIn = async () => {
        try {
            await signInWithEmailAndPassword(auth, signInEmail, signInPassword);
            navigate('/');  
        } catch (error: any) {
            console.error("Error in SignIn:", error.message);
            alert(error.message);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            navigate('/');  
        } catch (error: any) {
            console.error("Error in Sign Out:", error.message);
            alert(error.message);
        }
    };

    const handleBioEdit = () => {
        setEditBio(true);
    };

    const saveBio = () => {
        setEditBio(false);
        alert("Bio saved!");
    };

    if (!userProfile) {
        return (
            <>
                <header className='nohead'>ScrapP@ges</header>
                <div className='buttonbar'>
                    <button className='friendsbutton'> Friends </button>
                    <button className='homebutton'> Home </button>
                    <button className='profilebutton'> My Profile </button>
                    <button className='scrapbookbutton'> ScrapBook </button>
                </div>
                <div className='subDiv'>
                    <div className='sub'>
                        <h1 className='signuptext'> Sign Up</h1>
                        <form onSubmit={(e) => { e.preventDefault(); handleSignUp(); }}>
                            <input
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                placeholder="Username"
                                className='userfieldSU'
                            />
                            <input
                                type="email"
                                value={signUpEmail}
                                onChange={e => setSignUpEmail(e.target.value)}
                                placeholder="Email"
                                className='emailfieldSU'
                            />
                            <input
                                type="password"
                                value={signUpPassword}
                                onChange={e => setSignUpPassword(e.target.value)}
                                placeholder="Password"
                                className='pwfieldSU'
                            />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                placeholder="Confirm Password"
                                className='confirmSU'
                            />
                            <button type="submit" className='signupbutton'>Sign Up</button>
                        </form>
                        <h1 className='signintext'>Sign In</h1>
                        <form onSubmit={(e) => { e.preventDefault(); handleSignIn(); }}>
                            <input
                                type="email"
                                value={signInEmail}
                                onChange={e => setSignInEmail(e.target.value)}
                                placeholder="Email"
                                className='emailfieldSI'
                            />
                            <input
                                type="password"
                                value={signInPassword}
                                onChange={e => setSignInPassword(e.target.value)}
                                placeholder="Password"
                                className='pwfieldSI'
                            />
                            <button type="submit" className='signinbutton'>Sign In</button>
                        </form>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <header className='nohead'>ScrapP@ges</header>
            <div className='buttonbar'>
                <button className='friendsbutton'> Friends </button>
                <button className='homebutton'> Home </button>
                <button className='profilebutton'> My Profile </button>
                <button className='scrapbookbutton'> ScrapBook </button>
                <button className='signoutbutton' onClick={handleSignOut}>Sign Out</button>
            </div>
            <div className='subDiv'>
                <div className='sub'>
                    <h1>Profile Information</h1>
                    <div className='profile-info'>
                        <img src={userProfile.photoURL || "default_profile.png"} alt="User Profile" className='profile-picture' />
                        <p><strong>Username:</strong> {userProfile.displayName}</p>
                        <div>
                            <label htmlFor="bio"><strong>Bio:</strong></label>
                            {editBio ? (
                                <>
                                    <textarea id="bio" value={bio} onChange={e => setBio(e.target.value)} />
                                    <button onClick={saveBio}>Save Bio</button>
                                </>
                            ) : (
                                <>
                                    <p>{bio}</p>
                                    <button onClick={handleBioEdit}>Edit Bio</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProfilePage;
