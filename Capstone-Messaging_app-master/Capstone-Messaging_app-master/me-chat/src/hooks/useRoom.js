import { doc } from "firebase/firestore";
import { useDocument } from "react-firebase-hooks/firestore";
import { db } from "src/utils/firebase";

// Custom hook to fetch and format room or user data
export default function useRoom(roomId, userId) {
     // Check if the room ID includes the user ID to determine if it's a user-specific room
     const isUserRoom = roomId.includes(userId);

     // Determine the Firestore collection and document IDs based on whether it's a user-specific room
     const collectionId = isUserRoom ? "users" : "rooms";
     const docId = isUserRoom ? roomId.replace(userId, "") : roomId;

     // Fetch the document from Firestore using the useDocument hook
     const [snapshot] = useDocument(docId ? doc(db, `${collectionId}/${docId}`) : null);

     // If the document doesn't exist, return null
     if (!snapshot?.exists()) return null;

     // Format and return the room or user data
     return {
          id: snapshot.id,
          // Use a default photo URL if not provided
          photoURL: snapshot.photoURL || `https://api.dicebear.com/7.x/bottts/svg`,
          ...snapshot.data(),
     };
}
