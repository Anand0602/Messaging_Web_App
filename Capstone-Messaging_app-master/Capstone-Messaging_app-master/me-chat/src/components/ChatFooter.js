import SendIcon from '@mui/icons-material/Send';
import React, { useEffect, useRef, useState } from 'react';
import MicIcon from '@mui/icons-material/Mic';
import CancelIcon from '@mui/icons-material/Cancel';
import recordAudio from '../utils/recordAudio';
import { addDoc, collection, doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../utils/firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { nanoid } from 'nanoid';
import { CheckCircleRounded } from '@mui/icons-material';

export default function ChatFooter({ input, onChange, image, user, room, roomId, sendMessage, setAudioId }) {
     // Ref for the audio recording functionality
     const record = useRef();
     // State to manage the recording status
     const [isRecording, setRecording] = useState(false);
     // State to display the duration of the recording
     const [duration, setDuration] = useState('00:00');
     // Ref for the timer interval during recording
     const timerInterval = useRef();
     // Check if the browser supports audio recording
     const canRecord = !!navigator.mediaDevices.getUserMedia && !!window.MediaRecorder;
     // Check if a message can be sent
     const canSendMessage = input.trim() || (input === "" && image);
     // Icons for the send button
     const recordIcons = (
          <>
               <SendIcon sx={{ width: 20, height: 20, color: 'white' }} />
               <MicIcon sx={{ width: 24, height: 24, color: 'white' }} />
          </>
     );

     // useEffect to start recording when isRecording is true
     useEffect(() => {
          if (isRecording) {
               record.current.start();
               startTimer()
          }
     }, [isRecording])

     // Function to pad the value with leading zeros
     function pad(value) {
          return String(value).length < 2 ? `0${value}` : value;
     }

     // Function to start the timer during recording
     function startTimer() {
          const start = Date.now()
          timerInterval.current = setInterval(setTime, 100)

          function setTime() {
               const timeElasped = Date.now() - start;
               const totalSeconds = Math.floor(timeElasped / 1000)
               const minutes = pad(parseInt(totalSeconds / 60))
               const seconds = pad(parseInt(totalSeconds % 60))
               const duration = `${minutes} : ${seconds}`
               setDuration(duration)
          }
     }

     async function startRecording(event) {
          event.preventDefault()
          record.current = await recordAudio()
          setRecording(true);
          setAudioId('')
     }

     // Function to stop recording
     async function stopRecording() {
          clearInterval(timerInterval.current);
          setRecording(false);
          const audio = await record.current.stop();
          setDuration("00:00");
          return audio;
     }

     // Function to finish recording and send the audio
     async function finishRecording() {
          const audio = await stopRecording();
          const { audioFile, audioName } = await audio;
          sendAudio(audioFile, audioName);
     }

     // Function to send the audio file
     async function sendAudio(audioFile, audioName) {
          await setDoc(doc(db, `users/${user.uid}/chats/${roomId}`), {
               name: room.name,
               photoURL: room.photoURL || null,
               timestamp: serverTimestamp(),
          });

          const newDoc = await addDoc(collection(db, `rooms/${roomId}/messages`), {
               name: user.displayName,
               uid: user.uid,
               timestamp: serverTimestamp(),
               time: new Date().toUTCString(),
               audioURL: "uploading",
               audioName,
          });

          await uploadBytes(ref(storage, `audio/${audioName}`), audioFile);
          const url = await getDownloadURL(ref(storage, `audio/${audioName}`));

          await updateDoc(doc(db, `rooms/${roomId}/messages/${newDoc.id}`), {
               audioURL: url,
          });
     }

     // Function to handle changes in the audio input
     function audioInputChange(event) {
          const audioFile = event.target.files[0];
          const audioName = nanoid();

          if (audioFile) {
               setAudioId('');
               sendAudio(audioFile, audioName);
          }
     }

     return (
          <div className="chat__footer">
               <form>
                    {/* Input for typing messages */}
                    <input
                         placeholder="Type a message"
                         style={{
                              width: isRecording ? "calc(100% - 20px)" : "calc(100% - 112px)",
                         }}
                         value={input}
                         onChange={onChange}
                    />

                    {canRecord ? (
                         // Button for sending messages or starting recording
                         <button
                              type="submit"
                              className="send__btn"
                              onClick={canSendMessage ? sendMessage : startRecording}
                         >
                              {recordIcons}
                         </button>
                    ) : (
                         // Button for sending audio messages (hidden input for file selection)
                         <>
                              <label htmlFor='capture' className="send__btn">{recordIcons}</label>
                              <input
                                   style={{ display: 'none' }}
                                   type='file'
                                   id='capture'
                                   accept='audio/*'
                                   capture
                                   onChange={audioInputChange}
                              />
                         </>
                    )}
               </form>

               {isRecording && (
                    // Display recording UI with cancel and finish buttons
                    <div className='record'>
                         <CancelIcon sx={{ width: 30, height: 30, color: '#f20519' }} onClick={stopRecording} />
                         <div>
                              <div className='record__redcircle' />
                              <div className='record__duration' >{duration}</div>
                         </div>
                         <CheckCircleRounded sx={{ width: 30, height: 30, color: '#41bf49' }} onClick={finishRecording} />
                    </div>
               )}
          </div>
     );
}
