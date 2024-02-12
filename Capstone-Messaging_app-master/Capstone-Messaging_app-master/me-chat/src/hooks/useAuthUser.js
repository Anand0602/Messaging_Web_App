import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "src/utils/firebase";

function useAuthUser() {
     const [user] = useAuthState(auth);

     useEffect(() => {
          if (user) {
               const userRef = doc(db, `users/${user.uid}`);
               getDoc(userRef).then((snapshot) => {
                    if (!snapshot.exists()) {
                         // Corrected the reference from `snapshot.ref` to `userRef`
                         setDoc(userRef, {
                              name: user.displayName,
                              photoURL: user.photoURL,
                              timestamp: serverTimestamp(),
                         });
                    }
               });
          }
     }, [user]);

     return user;
}

export default useAuthUser;
