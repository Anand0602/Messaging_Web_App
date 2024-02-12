import {
     Avatar,
     Button,
     Dialog,
     DialogActions,
     DialogContent,
     DialogContentText,
     DialogTitle,
     IconButton,
     TextField,
} from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/router";
import useRooms from "src/hooks/useRooms";
import useUsers from "src/hooks/useUsers";
import useChats from "src/hooks/useChats";
import { addDoc, collection, getDocs, query, serverTimestamp, where } from "firebase/firestore";
import { auth, db } from "src/utils/firebase";
import SidebarList from "./SidebarList";
import SidebarTabs from "./SidebarTabs";
import HomeIcon from "@mui/icons-material/Home"
import { Add, ExitToApp, Message, PeopleAlt, SearchOutlined } from "@mui/icons-material";

const tabs = [
     {
          id: 1,
          icon: <HomeIcon />,
     },
     {
          id: 2,
          icon: <Message />,
     },
     {
          id: 3,
          icon: <PeopleAlt />,
     },
];

export default function Sidebar({ user }) {
     const [menu, setMenu] = useState(1);
     const [isCreatingRoom, setCreatingRoom] = useState(false);
     const [searchResults, setSearchResults] = useState([]);
     const [roomName, setRoomName] = useState("");
     const router = useRouter();
     const rooms = useRooms();
     const users = useUsers(user);
     const chats = useChats(user);

     // Function to create a room
     async function createRoom() {
          if (roomName?.trim()) {
               const roomsRef = collection(db, "rooms");
               const newRoom = await addDoc(roomsRef, {
                    name: roomName,
                    timestamp: serverTimestamp(),
               });
               setCreatingRoom(false);
               setRoomName("");
               setMenu(2);
               router.push(`/?roomId=${newRoom.id}`);
          }
     }

     // Function to search for users and rooms
     async function searchUsersAndRooms(event) {
          event.preventDefault();

          const searchValue = event.target.elements.search.value;
          const userQuery = query(
               collection(db, "users"),
               where("name", "==", searchValue)
          );
          const roomQuery = query(
               collection(db, "rooms"),
               where("name", "==", searchValue)
          );
          const userSnapshot = await getDocs(userQuery);
          const roomSnapshot = await getDocs(roomQuery);

          const userResults = userSnapshot?.docs.map((doc) => {
               const id =
                    doc.id > user.uid ? `${doc.id}${user.uid}` : `${user.uid}${doc.id}`;
               return { id, ...doc.data() };
          });

          const roomResults = roomSnapshot?.docs.map((doc) => ({
               id: doc.id,
               ...doc.data(),
          }));

          const searchResults = [...userResults, ...roomResults];
          setMenu(4);
          setSearchResults(searchResults);
     }

     return (
          <div className="sidebar">
               {/* Sidebar header */}
               <div className="sidebar__header">
                    <div className="sidebar__header--left">
                         {/* User's avatar and display name */}
                         <Avatar src={user?.photoURL} alt={user?.displayName} />
                         <h4 style={{ fontWeight: "bold", fontSize: "1.2rem" }}>
                              {user?.displayName}
                         </h4>
                    </div>
                    <div className="sidebar__header--right">
                         {/* Logout button */}
                         <IconButton onClick={() => auth.signOut()}>
                              <ExitToApp />
                         </IconButton>
                    </div>
               </div>

               {/* Sidebar search bar */}
               <div className="sidebar__search">
                    <form onSubmit={searchUsersAndRooms} className="sidebar__search--container">
                         <SearchOutlined />
                         <input
                              type="text"
                              id="search"
                              placeholder="Search for user or rooms"
                         />
                    </form>
               </div>

               {/* Sidebar tabs */}
               <div className="sidebar__menu">
                    {tabs.map((tab) => (
                         <SidebarTabs
                              key={tab.id}
                              onClick={() => setMenu(tab.id)}
                              isActive={tab.id === menu}
                         >
                              <div className="sidebar__menu--home">
                                   {tab.icon}
                                   <div className="sidebar__menu--line"></div>
                              </div>
                         </SidebarTabs>
                    ))}
               </div>

               {/* Conditional rendering based on selected menu */}
               {menu === 1 ? (
                    <SidebarList title={"Chats"} data={chats} />
               ) : menu === 2 ? (
                    <SidebarList title={"Rooms"} data={rooms} />
               ) : menu === 3 ? (
                    <SidebarList title={"Users"} data={users} />
               ) : menu === 4 ? (
                    <SidebarList title={"Search Result"} data={searchResults} />
               ) : null}

               {/* Button to add a new room */}
               <div className="sidebar__chat--addRoom">
                    <IconButton onClick={() => setCreatingRoom(true)}>
                         <Add />
                    </IconButton>
               </div>

               {/* Dialog for creating a new room */}
               <Dialog open={isCreatingRoom} onClose={() => setCreatingRoom(false)}>
                    <DialogTitle>Create a Room</DialogTitle>
                    <DialogContent>
                         <DialogContentText>
                              Type the name of your public room. Every user will be able to join
                              the room
                         </DialogContentText>
                         <TextField
                              autoFocus
                              onChange={(event) => setRoomName(event.target.value)}
                              value={roomName}
                              margin="dense"
                              id="roomName"
                              label="Room name"
                              type="text"
                              fullWidth
                              variant="filled"
                              style={{ marginTop: 20 }}
                         />
                    </DialogContent>
                    <DialogActions>
                         {/* Cancel and submit buttons for the room creation dialog */}
                         <Button color="error" onClick={() => setCreatingRoom(false)}>
                              Cancel
                         </Button>
                         <Button color="success" onClick={createRoom}>
                              Submit
                         </Button>
                    </DialogActions>
               </Dialog>
          </div>
     );
}
