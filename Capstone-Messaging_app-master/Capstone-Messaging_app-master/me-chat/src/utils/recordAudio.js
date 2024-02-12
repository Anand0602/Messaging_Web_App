// Import the nanoid function for generating unique IDs
import { nanoid } from "nanoid";

// Function to record audio using the user's microphone
export default function recordAudio() {
     return new Promise((resolve) => {
          // Request access to the user's microphone
          navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
               // Create a MediaRecorder instance to capture audio data
               const mediaRecorder = new MediaRecorder(stream);
               // Array to store audio chunks
               const audioChunks = [];

               // Event listener to handle each chunk of audio data
               mediaRecorder.addEventListener("dataavailable", (event) => {
                    audioChunks.push(event.data);
               });

               // Function to start recording
               function start() {
                    mediaRecorder.start();
               }

               // Function to stop recording
               function stop() {
                    return new Promise((resolve) => {
                         // Event listener for when recording is stopped
                         mediaRecorder.addEventListener("stop", () => {
                              // Generate a unique ID for the audio file
                              const audioName = nanoid();
                              // Create a File object from the audio chunks
                              const audioFile = new File(audioChunks, audioName, {
                                   type: "audio/mpeg",
                              });
                              // Create a URL for playing the recorded audio
                              const audioUrl = URL.createObjectURL(audioFile);
                              // Create an Audio element for playback
                              const audio = new Audio(audioUrl);

                              // Function to play the recorded audio
                              function play() {
                                   audio.play();
                              }

                              // Resolve the promise with information about the recorded audio
                              resolve({ audioFile, audioUrl, play, audioName });
                         });

                         // Stop the MediaRecorder and release the microphone
                         mediaRecorder.stop();
                         mediaRecorder.stream.getTracks().forEach((track) => {
                              track.stop();
                         });
                    });
               }

               // Resolve the promise with the start and stop functions
               resolve({ start, stop });
          });
     });
}
