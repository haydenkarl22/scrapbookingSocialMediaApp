import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, deleteUser } from 'firebase/auth';
import { doc, setDoc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';


export const fetchUserProfile = async (userId: string): Promise<any> => {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
        return userDoc.data(); // Returns the user profile data
    } else {
        // Handle the case where the document does not exist
        return null;
    }
};

export const signUpUser = async (email: string, password: string, username: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: username });
    const userDoc = doc(db, 'users', userCredential.user.uid);
    await setDoc(userDoc, {
        email: email,
        username: username,
        bio: ""  // Initialize with empty bio or other default values
    });
    return userCredential;
};

export const signInUser = async (email: string, password: string) => {
    return await signInWithEmailAndPassword(auth, email, password);
};

export const signOutUser = async () => {
    await signOut(auth);
};

export const saveUserBio = async (uid: string, bio: string) => {
    const userDoc = doc(db, 'users', uid);
    await updateDoc(userDoc, {
        bio: bio
    });
};

export const deleteUserAccount = async (uid: string) => {
    const userDocRef = doc(db, 'users', uid);
    await deleteDoc(userDocRef);
    await deleteUser(auth.currentUser!);
};
