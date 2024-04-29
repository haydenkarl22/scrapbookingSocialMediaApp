import { db } from '../firebase/firebaseConfig'; // Assume your config file exports a configured Firestore instance
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

// TypeScript interface for type safety
interface IFriendOperations {
  userId: string;
  friendId: string;
}

// Function to add a friend
export const addFriend = async ({ userId, friendId }: IFriendOperations): Promise<void> => {
  const userDoc = doc(db, 'users', userId);
  await updateDoc(userDoc, {
    friends: arrayUnion(friendId)
  });
}

// Function to delete a friend
export const deleteFriend = async ({ userId, friendId }: IFriendOperations): Promise<void> => {
  const userDoc = doc(db, 'users', userId);
  await updateDoc(userDoc, {
    friends: arrayRemove(friendId)
  });
}
