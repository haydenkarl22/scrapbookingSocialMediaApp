import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../../firebase/firebaseConfig';
import {
    signUpUser,
    signInUser,
    signOutUser,
    saveUserBio,
    deleteUserAccount,
    fetchUserProfile
} from '../../firebase/authServices';
import './profilepage.css';
import TrashBinIcon from '../../assets/bin.png';
import DefaultProfilePic from '../../assets/vecteezy_default-profile-account-unknown-icon-black-silhouette_20765399.jpg';

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const [signUpEmail, setSignUpEmail] = useState('');
    const [signUpPassword, setSignUpPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [username, setUsername] = useState('');
    const [signInEmail, setSignInEmail] = useState('');
    const [signInPassword, setSignInPassword] = useState('');
    const [userProfile, setUserProfile] = useState<any>(null);
    const [bio, setBio] = useState('');
    const [editBio, setEditBio] = useState(false);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async user => {
            if (user) {
                setUserProfile(user);
                const profileData = await fetchUserProfile(user.uid);
                if (profileData) {
                    setBio(profileData.bio);  // Assuming 'bio' is part of the profile data
                } else {
                    // Handle no profile data found, maybe initialize defaults
                    setBio('');
                }
            } else {
                setUserProfile(null);
                setBio('');
            }
        });
        return () => unsubscribe();  // Cleanup the subscription
    }, []);


    const handleSignUp = async () => {
        if (signUpPassword !== confirmPassword) {
            alert("Passwords don't match");
            return;
        }
        try {
            await signUpUser(signUpEmail, signUpPassword, username);
            navigate('/profile');
        } catch (error: any) {
            console.error("Error in SignUp:", error.message);
            alert(error.message);
        }
    };

    const handleSignIn = async () => {
        try {
            await signInUser(signInEmail, signInPassword);
            navigate('/profile');
        } catch (error: any) {
            console.error("Error in SignIn:", error.message);
            alert(error.message);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOutUser();
            navigate('/');
        } catch (error: any) {
            console.error("Error in Sign Out:", error.message);
            alert(error.message);
        }
    };

    const handleBioEdit = () => {
        setEditBio(true);
    };

    const saveBio = async () => {
        if (userProfile) {
            try {
                await saveUserBio(userProfile.uid, bio);
                alert("Bio saved!");
                setEditBio(false);  // Disable edit mode after saving
            } catch (error: any) {
                console.error("Error saving bio:", error.message);
                alert(`Failed to save bio: ${error.message}`);
            }
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm("Do you really want to delete your account? This action cannot be undone.")) {
            try {
                await deleteUserAccount(userProfile.uid);
                navigate('/');
            } catch (error: any) {
                console.error('Failed to delete account:', error);
                alert('Failed to delete your account. Please try again.');
            }
        }
    };
    
    

    if (!userProfile) {
        return (
            <>
                <header className='nohead'>ScrapP@ges</header>
                <div className='buttonbar'>
                    <Link to="/friends" className='friendsbutton'> Friends </Link>
                    <Link to="/" className='homebutton'> Home </Link>
                    <Link to="/profile" className='profilebutton'> My Profile </Link>
                    <Link to="/scrapbook" className='scrapbookbutton'> Scrapbook </Link>
                </div>
                {userProfile && (
                    <div style={{ position: 'relative', height: '70px' }}>
                       <button className='signoutbutton' onClick={handleSignOut}>Sign Out</button>
                    </div>
                )}
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
                    <Link to="/friends" className='friendsbutton'> Friends </Link>
                    <Link to="/" className='homebutton'> Home </Link>
                    <Link to="/profile" className='profilebutton'> My Profile </Link>
                    <Link to="/scrapbook" className='scrapbookbutton'> Scrapbook </Link>
                </div>
                {userProfile && (
                    <div style={{ position: 'relative', height: '70px' }}>
                        <button className='signoutbutton' onClick={handleSignOut}>Sign Out</button>
                        <button className='deleteAccountButton' onClick={handleDeleteAccount}>
                            <img src={TrashBinIcon} alt="Delete Account" />
                        </button>
                    </div>
                    
                )}
                <div className='subDiv'>
                    <div className='sub'>
                    <h1>Profile Information</h1>
                        <div className='profile-info'>
                            <img src={userProfile.photoURL || DefaultProfilePic} alt="User Profile" className='profile-picture' />
                            <p><strong>Username:</strong> {userProfile.displayName}</p>
                            <div>
                                <label htmlFor="bio"><strong>Bio:</strong></label>
                                {editBio ? (
                                    <>
                                        <textarea id="bio" value={bio} onChange={e => setBio(e.target.value)} />
                                        <button className="editBioButton" onClick={saveBio}>Save Bio</button>
                                    </>
                                ) : (
                                    <>
                                        <p>{bio}</p>
                                        <button className="editBioButton" onClick={handleBioEdit}>Edit Bio</button>
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
