import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase-config';  // Ensure this path is correct
import './profilepage.css';


const ProfilePage: React.FC = () => {
    // State for sign-up form
    const [signUpEmail, setSignUpEmail] = useState('');
    const [signUpPassword, setSignUpPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [username, setUsername] = useState('');

    // State for sign-in form
    const [signInEmail, setSignInEmail] = useState('');
    const [signInPassword, setSignInPassword] = useState('');

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    const handleSignUp = async () => {
        if (signUpPassword !== confirmPassword) {
            alert("Passwords don't match");
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, signUpEmail, signUpPassword);
            console.log("Registered User:", userCredential.user);
            setIsLoggedIn(true); // Set user as signed in
            navigate('/home');  // Redirect to home page after sign up
        } catch (error: any) {
            console.error("Error in SignUp:", error.message);
            alert(error.message);
        }
    };

    const handleSignIn = async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, signInEmail, signInPassword);
            console.log("Logged In User:", userCredential.user);
            setIsLoggedIn(true); // Set user as signed in
            navigate('/');  // Redirect to home page after sign in
        } catch (error: any) {
            console.error("Error in SignIn:", error.message);
            alert(error.message);
        }
    };

    if (isLoggedIn) {
        return null;  // Optionally keep this to ensure no render happens before redirect
    }

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
};

export default ProfilePage;
