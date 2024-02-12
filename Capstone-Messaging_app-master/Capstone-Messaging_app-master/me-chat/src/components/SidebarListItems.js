import { Avatar } from "@mui/material";
import Link from "next/link";

function SidebarListItems({ item }) {
     return (
          <Link className="link" href={`/?roomId=${item.id}`}>
               <div className="sidebar__chat">
                    <div className="avatar__container">
                         {/* Avatar component with conditional source and style */}
                         <Avatar
                              src={item.photoURL || `https://api.dicebear.com/7.x/bottts/svg`}
                              style={{ width: 45, height: 45 }}
                         />
                    </div>
                    <div className="sidebar__chat--info">
                         {/* Display the chat item's name */}
                         <h2>{item.name}</h2>
                    </div>
               </div>
          </Link>
     );
}

export default SidebarListItems;
