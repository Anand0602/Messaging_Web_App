import { collection, orderBy, query } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "src/utils/firebase";

// Custom hook to fetch and format user data
function useUsers(user) {
     // Fetch the collection of users from Firestore ordered by timestamp in descending order
     const [snapshot] = useCollection(query(collection(db, "users"), orderBy("timestamp", "desc")));

     // Array to store formatted user data
     const users = [];

     // Process the snapshot data if available
     snapshot?.docs.forEach(doc => {
          // Create a unique ID for each user pair based on their UIDs
          const id = doc.id > user.uid ? `${doc.id}${user.uid}` : `${user.uid}${doc.id}`;

          // Exclude the current user from the list
          if (doc.id !== user.uid) {
               // Add formatted user data to the array
               users.push({ id, ...doc.data() });
          }
     });

     // Return the formatted user data array
     return users;
}

export default useUsers;