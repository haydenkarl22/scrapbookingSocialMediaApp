//fetches and displays the scrapbook submissions associated with the account in the order they were submitted.
//if the user wants to rearrange the scrapbook, the web page will communicate with this database accordingly.
//doc is 
/*import { db } from '../firebase/firebaseConfig'; // Assume your config file exports a configured Firestore instance
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc, getDocs, collection, query, orderBy, limit, where } from 'firebase/firestore';


// TypeScript interface for type safety
export interface IScrapOperations {
    text: string;
    imageName: string;
    page: number;
    x: number;
    y: number;
    width: number;
    length: number;
}
//text: the caption associated with the scrapbook entry
//imageName: references the image submitted with the scrapbook entry
//page: the page number the scrapbook entry is to be displayed on. User will be able to flip pages in the scrapbook.
//x: the x-coordinate on the page of the top-leftmost pixel in the scrapbook entry. x=0 corresponds to the leftmost side of the page.
//y: the y-coordinate on the page of the top-leftmost pixel in the scrapbook entry. y=0 corresponds to the top of the page.
//width: the horizontal width in pixels of the scrapbook entry
//length: the vertical length in pixels of the scrapbook entry
//only rectangular scrapbook entries are supported.

export const firebaseScrapbookData = {
    // Function to read submissions from Firestore
    async readSubmissions(): Promise<string[]> {
        try {
            const submissionsRef = collection(db, 'submissions');
            const snapshot = await getDocs(submissionsRef);
            return snapshot.docs.map((doc) => doc.data().submission);
        } catch (error) {
            console.error('Error reading submissions:', error);
            return [];
        }
    },
}

const submissionsRef = collection(db, 'submissions');

// Function to add an image and caption to the database, generating a
export const addScrap = async (imageName: string, text: string): Promise<void> => {
    // Query to get the highest page value currently in use
    const q = query(submissionsRef, orderBy('page', 'desc'), limit(1));
    const querySnapshot = await getDocs(q);
    let newPage = 0;

    if (!querySnapshot.empty) {
        // If there are existing documents, increment the highest page value
        const highestPageDoc = querySnapshot.docs[0];
        newPage = highestPageDoc.data().index + 1;
    }
}

// Function to delete a scrap
export const deleteScrap = async ({ text, imageName } ): Promise<void> => {
    const userDoc = doc(db, 'users', userId);
    await updateDoc(userDoc, {
        friends: arrayRemove(friendId)
    });
}
// Function to rearrange a scrap; executes when user saves changes to scrapbook.
export const repositionScrap = async ({ text, imageName }: IScrapOperations): Promise<void> => {
    const userDocRef = doc(db, 'users', userId);
    const friendDocRef = doc(db, 'users', friendId);

    const [userDoc, friendDoc] = await Promise.all([getDoc(userDocRef), getDoc(friendDocRef)]);

    // Check if already friends or request pending
    if (userDoc.exists() && friendDoc.exists()) {
        const userFriends = userDoc.data().friends || [];
        const friendRequests = friendDoc.data().friendRequests || [];

        if (userFriends.includes(friendId) || friendRequests.includes(userId)) {
            alert("Friend request already sent or you are already friends.");
            return;
        }
    }

    // Update the friend's document with a new friend request
    await updateDoc(friendDocRef, {
        friendRequests: arrayUnion(userId)
    });
};

export const acceptFriendRequest = async ({ userId, friendId }: IFriendOperations): Promise<string> => {  // Now returns username
    const userDoc = doc(db, 'users', userId);
    const friendDoc = doc(db, 'users', friendId);

    await updateDoc(userDoc, {
        friends: arrayUnion(friendId),
        friendRequests: arrayRemove(friendId)  // Remove from friendRequests
    });

    await updateDoc(friendDoc, {
        friends: arrayUnion(userId)  // Add to friends
    });

    // Fetch the username of the newly added friend
    const friendSnapshot = await getDoc(friendDoc);
    if (friendSnapshot.exists()) {
        return friendSnapshot.data().username || "Unknown User";  // Return the username
    }
    return "Unknown User";  // Default case if user data is not found
};



*/

export {};
