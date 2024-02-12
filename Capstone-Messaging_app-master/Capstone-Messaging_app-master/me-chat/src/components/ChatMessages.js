import { CircularProgress } from "@mui/material";
import AudioPlayer from "./AudioPlayer";

function ChatMessages({ messages, user, roomId, audioId, setAudioId }) {
     // If messages are not available, return null
     if (!messages) return null;

     // Map through messages and render each message
     return messages.map(message => {
          // Check if the current user is the sender of the message
          const isSender = message.uid === user.uid;

          return (
               <div key={message.id} className={`chat__message ${isSender ? "chat__message--sender" : ""}`}>
                    {/* Display the name of the message sender */}
                    <span className="chat__name">{message.name}</span>

                    {/* Display loading spinner while the image is uploading */}
                    {message.imageUrl === "uploading" ? (
                         <div className="image-container">
                              <div className="image__container--loader">
                                   <CircularProgress style={{ width: 40, height: 40 }} />
                              </div>
                         </div>
                    ) : message.imageUrl ? (
                         // Display the image if available
                         <div className="image-container">
                              <img src={message.imageUrl} alt={message.name} />
                         </div>
                    ) : null}

                    {/* Render the AudioPlayer component if an audio message is present */}
                    {message.audioName ? (
                         <AudioPlayer
                              sender={isSender}
                              roomId={roomId}
                              id={message.id}
                              audioUrl={message.audioURL}
                              audioId={audioId}
                              setAudioId={setAudioId}
                         />
                    ) : (
                         // Render the text message if an audio message is not present
                         <span className="chat__message--message">{message.message}</span>
                    )}

                    {/* Display the timestamp of the message */}
                    <span className="chat__timestamp">{message.time}</span>
               </div>
          );
     });
}

export default ChatMessages;
