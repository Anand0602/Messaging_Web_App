import { CircularProgress } from "@mui/material";
import SidebarListItems from "./SidebarListItems";
import React from "react";
import { NoAccounts } from "@mui/icons-material";

function SidebarList({ title, data }) {
     console.log(`Title: ${title}`);
     console.log("Data:", data);

     // If data is not available, display a loading spinner
     if (!data) {
          return (
               <div className="loader__container sidebar__loader">
                    <CircularProgress />
               </div>
          );
     }

     // If there is no data and the title is "Search Result", display a message with an icon
     if (!data.length && title === "Search Result") {
          return (
               <div className="no-result">
                    <div>
                         <NoAccounts />
                    </div>
                    <h2>No {title}</h2>
               </div>
          );
     }

     // Display the list of items with the title
     return (
          <div className="sidebar__chat--container">
               <h2>{title}</h2>
               {data.map((item) => (
                    <SidebarListItems key={item.id} item={item} />
               ))}
          </div>
     );
}

export default SidebarList;
