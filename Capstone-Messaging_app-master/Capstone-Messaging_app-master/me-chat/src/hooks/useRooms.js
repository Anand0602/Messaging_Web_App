import { collection, orderBy, query } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "src/utils/firebase";

// Custom hook to fetch and format room data
export default function useRooms() {
     // Fetch the collection of rooms from Firestore ordered by timestamp in descending order
     const [snapshot] = useCollection(query(collection(db, "rooms"), orderBy('timestamp', 'desc')));

     // Format the room data if the snapshot is available
     const rooms = snapshot?.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
     }));

     // Return the formatted room data
     return rooms;
}
