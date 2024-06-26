import { db } from '../firebase/firebaseConfig'; // Assume your config file exports a configured Firestore instance
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc, getDocs, collection, query, where, addDoc, orderBy, serverTimestamp } from 'firebase/firestore';


// TypeScript interface for type safety
export interface IFriendOperations {
  userId: string;
  friendId: string;
}

export interface IFriendRequestDetails {
  id: string;
  username: string;
}

export const searchUsers = async (searchTerm: string): Promise<any[]> => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where("username", "==", searchTerm)); // Adjust the field and method as necessary
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// firebaseFriends.ts

export const fetchFriends = async (userId: string): Promise<any[]> => {
  const userDocRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userDocRef);
  const friends = [];
  if (userDoc.exists() && userDoc.data().friends) {
      for (const friendId of userDoc.data().friends) {
          const friendDocRef = doc(db, 'users', friendId);
          const friendDoc = await getDoc(friendDocRef);
          if (friendDoc.exists()) {
              friends.push({ id: friendId, username: friendDoc.data().username || "Unknown User" });
          } else {
              friends.push({ id: friendId, username: "Unknown User" }); // Handle case where friend details might not be fetched
          }
      }
  }
  return friends;  // Return an array of objects with id and username
};



export const fetchFriendRequests = async (userId: string): Promise<IFriendRequestDetails[]> => {
  const userDocRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userDocRef);
  const requests = [];
  if (userDoc.exists() && userDoc.data().friendRequests) {
    for (const friendId of userDoc.data().friendRequests) {
      const friendDocRef = doc(db, 'users', friendId);
      const friendDoc = await getDoc(friendDocRef);
      if (friendDoc.exists()) {
        requests.push({ id: friendId, username: friendDoc.data().username || "Unknown User" });
      }
    }
  }
  return requests;
};



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
  const friendDoc = doc(db, 'users', friendId);

  await updateDoc(userDoc, {
    friends: arrayRemove(friendId)
  });

  await updateDoc(friendDoc, {
    friends: arrayRemove(userId)
  });
};

export const sendFriendRequest = async ({ userId, friendId }: IFriendOperations): Promise<void> => {
  const userDocRef = doc(db, 'users', userId);
  const friendDocRef = doc(db, 'users', friendId);

  const [userDoc, friendDoc] = await Promise.all([getDoc(userDocRef), getDoc(friendDocRef)]);

  if (userDoc.exists() && friendDoc.exists()) {
    const userFriends = userDoc.data().friends || [];
    const friendRequests = friendDoc.data().friendRequests || [];
    
    if (userFriends.includes(friendId) || friendRequests.includes(userId)) {
      alert("Friend request already sent or you are already friends.");
      return;
    }
  }

  await updateDoc(friendDocRef, {
    friendRequests: arrayUnion(userId)
  });

  await updateDoc(userDocRef, {
    outgoingFriendRequests: arrayUnion(friendId)
  });
};

export const acceptFriendRequest = async ({ userId, friendId }: IFriendOperations): Promise<{ id: string; username: string }> => {
  const userDoc = doc(db, 'users', userId);
  const friendDoc = doc(db, 'users', friendId);

  await updateDoc(userDoc, {
    friends: arrayUnion(friendId),
    friendRequests: arrayRemove(friendId)
  });

  await updateDoc(friendDoc, {
    friends: arrayUnion(userId),
    outgoingFriendRequests: arrayRemove(userId) // Remove the outgoing friend request
  });

  const friendSnapshot = await getDoc(friendDoc);
  if (friendSnapshot.exists()) {
    return { id: friendId, username: friendSnapshot.data().username || "Unknown User" };
  }
  return { id: friendId, username: "Unknown User" };
};

export const sendChatMessage = async (
  senderId: string,
  receiverId: string,
  message: string,
  fileUrl: string,
  scrapbookUrl: string
): Promise<void> => {
  const chatMessagesCollection = collection(db, 'chatMessages');
  await addDoc(chatMessagesCollection, {
    senderId,
    receiverId,
    message,
    fileUrl,
    scrapbookUrl,
    timestamp: serverTimestamp(),
  });
};

export const fetchChatMessages = async (userId: string, friendId: string): Promise<any[]> => {
  const chatMessagesCollection = collection(db, 'chatMessages');
  const q = query(
    chatMessagesCollection,
    where('senderId', 'in', [userId, friendId]),
    where('receiverId', 'in', [userId, friendId]),
    orderBy('timestamp')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data());
};

export const fetchOutgoingFriendRequests = async (userId: string): Promise<IFriendRequestDetails[]> => {
  const userDocRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userDocRef);
  const requests = [];
  if (userDoc.exists() && userDoc.data().outgoingFriendRequests) {
    for (const friendId of userDoc.data().outgoingFriendRequests) {
      const friendDocRef = doc(db, 'users', friendId);
      const friendDoc = await getDoc(friendDocRef);
      if (friendDoc.exists()) {
        requests.push({ id: friendId, username: friendDoc.data().username || "Unknown User" });
      }
    }
  }
  return requests;
};

export const cancelFriendRequest = async ({ userId, friendId }: IFriendOperations): Promise<void> => {
  const userDoc = doc(db, 'users', userId);
  const friendDoc = doc(db, 'users', friendId);

  await updateDoc(userDoc, {
    outgoingFriendRequests: arrayRemove(friendId)
  });

  await updateDoc(friendDoc, {
    friendRequests: arrayRemove(userId)
  });
};




