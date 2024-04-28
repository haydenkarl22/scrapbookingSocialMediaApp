import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, deleteUser } from 'firebase/auth';
import { auth } from '../../firebase-config';
import { getFirestore, doc, updateDoc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import './profilepage.css'; // Ensure the CSS file is correctly imported
import TrashBinIcon from '../../assets/bin.png';

const ProfilePage: React.FC = () => {
    const db = getFirestore();
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
        const unsubscribe = auth.onAuthStateChanged(async user => {
            if (user) {
                setUserProfile(user);

                // Check if a Firestore document exists for the user
                const userDocRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(userDocRef);

                if (!docSnap.exists()) {
                    // If the document does not exist, create it
                    await setDoc(userDocRef, {
                        email: user.email,
                        username: user.displayName || 'New User',
                        bio: ''  // Initialize with empty bio
                    });
                    setBio('');  // Initialize local state
                } else {
                    // If the document exists, load the bio from Firestore
                    setBio(docSnap.data().bio);
                }
            } else {
                setUserProfile(null);
                setBio('');  // Clear bio when no user is signed in
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
            const userCredential = await createUserWithEmailAndPassword(auth, signUpEmail, signUpPassword);
            await updateProfile(userCredential.user, { displayName: username });
            setUserProfile(userCredential.user);
    
            // Ensure the user document is created in Firestore when the user is signed up
            const userDoc = doc(db, 'users', userCredential.user.uid);
            await setDoc(userDoc, {
                email: signUpEmail,
                username: username,
                bio: ""  // Initialize with empty bio or other default values
            });
    
            navigate('/profile');  
        } catch (error: any) {
            console.error("Error in SignUp:", error.message);
            alert(error.message);
        }
    };
    

    const handleSignIn = async () => {
        try {
            await signInWithEmailAndPassword(auth, signInEmail, signInPassword);
            navigate('/profile');  
        } catch (error: any) {
            console.error("Error in SignIn:", error.message);
            alert(error.message);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            navigate('/');  // Redirects user to the home page after sign out
        } catch (error: any) {
            console.error("Error in Sign Out:", error.message);
            alert(error.message);
        }
    };
    
    const saveBio = async () => {
        if (userProfile) {
            try {
                const userDoc = doc(db, 'users', userProfile.uid); // Ensure 'users' collection exists in Firestore
                await updateDoc(userDoc, {
                    bio: bio
                });
                alert("Bio saved!");
                setEditBio(false);
            } catch (error: unknown) { // Handle unknown type here
                if (error instanceof Error) { // Proper type checking
                    console.error("Error saving bio:", error.message);
                    alert(`Failed to save bio: ${error.message}`);
                } else {
                    console.error("Unexpected error", error);
                    alert("Failed to save bio due to an unexpected error.");
                }
            }
        }
    };
    
    // Added method to start editing bio
    const handleBioEdit = () => {
        setEditBio(true);
    };

    const handleDeleteAccount = async () => {
        if (userProfile) {
            // Prompt user to confirm deletion
            if (window.confirm("Do you really want to delete your account? This action cannot be undone.")) {
                try {
                    // Optional: Delete user data from Firestore first
                    const userDocRef = doc(db, 'users', userProfile.uid);
                    await deleteDoc(userDocRef);
    
                    // Delete user authentication profile
                    await deleteUser(userProfile);
                    alert('Your account has been successfully deleted.');
                    navigate('/'); // Navigate to home or login page
                } catch (error) {
                    console.error('Failed to delete account:', error);
                    alert('Failed to delete your account. Please try again.');
                }
            } else {
                // User chose not to delete the account
                alert('Your account has not been deleted.');
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
                    <Link to="/scrapbook" className='scrapbookbutton'> ScrapBook </Link>
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
                    <Link to="/scrapbook" className='scrapbookbutton'> ScrapBook </Link>
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
