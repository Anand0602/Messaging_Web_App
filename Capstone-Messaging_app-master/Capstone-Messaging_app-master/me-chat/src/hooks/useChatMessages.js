import { collection, orderBy, query } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "src/utils/firebase";

// Custom hook to fetch and format chat messages for a specific room
function useChatMessages(roomId) {
     // Fetch the collection of messages for the given room from Firestore ordered by timestamp in ascending order
     const [snapshot] = useCollection(roomId ? query(
          collection(db, `rooms/${roomId}/messages`), orderBy("timestamp", "asc")
     ) : null);

     // Format the message data if the snapshot is available
     const messages = snapshot?.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
     }));

     // Return the formatted message data
     return messages;
}

export default useChatMessages;
