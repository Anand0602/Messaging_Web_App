import { collection, orderBy, query } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "src/utils/firebase";

// Custom hook to fetch and format chat data for a specific user
function useChats(user) {
     // Fetch the collection of chats for the given user from Firestore ordered by timestamp in descending order
     const [snapshot] = useCollection(query(collection(db, `users/${user.uid}/chats`), orderBy('timestamp', 'desc')));

     // Format the chat data if the snapshot is available
     const chats = snapshot?.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
     }));

     // Return the formatted chat data
     return chats;
}

export default useChats;
