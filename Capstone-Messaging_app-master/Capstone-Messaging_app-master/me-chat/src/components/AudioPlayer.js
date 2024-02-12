import { PauseRounded, PlayArrowRounded } from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
import { useEffect, useRef, useState } from "react";

export default function AudioPlayer({
     sender,
     audioUrl,
     id,
     setAudioId,
     audioId,
}) {
     // State variables
     const [isPlaying, setPlaying] = useState(false);
     const [isMediaLoaded, setMediaLoaded] = useState(false);
     const [isLoaded, setLoaded] = useState(false);
     const [isMetadataLoaded, setMetadataLoaded] = useState(false);
     const [sliderValue, setSliderValue] = useState(0);
     const [duration, setDuration] = useState("");

     // Refs
     const totalDuration = useRef("");
     const audio = useRef(new Audio(audioUrl));
     const interval = useRef();
     const isUploading = useRef(audioUrl === "uploading");

     // Effect to handle changes in audio URL
     useEffect(() => {
          if (isUploading.current && audioUrl !== "uploading") {
               audio.current = new Audio(audioUrl);
               audio.current.load();
               setLoaded(true);
          } else if (isUploading.current === false) {
               setLoaded(true);
          }
     }, [audioUrl]);

     // Effect to get audio duration once loaded
     useEffect(() => {
          if (isLoaded) {
               getAudioDuration(audio.current).then(() => {
                    setMetadataLoaded(true);
               });
          }
     }, [isLoaded]);

     // Effect to set up event listeners once metadata is loaded
     useEffect(() => {
          if (isMetadataLoaded) {
               audio.current.addEventListener("canplaythrough", () => {
                    if (!totalDuration.current) {
                         setMediaLoaded(true);
                         const time = formatTime(audio.current.duration);
                         totalDuration.current = time;
                         setDuration(totalDuration.current);
                    }
               });

               audio.current.addEventListener("ended", () => {
                    clearInterval(interval.current);
                    setDuration(totalDuration.current);
                    setSliderValue(0);
                    setPlaying(false);
               });
          }
     }, [isMetadataLoaded]);

     // Effect to pause audio when switching to a different audio ID
     useEffect(() => {
          if (audioId !== id) {
               audio.current.pause();
               setPlaying(false);
          }
     }, [audioId, id]);

     // Function to get audio duration
     function getAudioDuration(media) {
          return new Promise((resolve) => {
               media.onloadedmetadata = () => {
                    media.currentTime = Number.MAX_SAFE_INTEGER;
                    media.ontimeupdate = () => {
                         media.ontimeupdate = () => { };
                         media.currentTime = 0.1;
                         resolve(media.duration);
                    };
               };
          });
     }

     // Function to format time in MM:SS format
     function formatTime(time) {
          let minutes = Math.floor(time / 60);
          let seconds = Math.floor(time - minutes * 60);

          if (minutes < 10) {
               minutes = `0${minutes}`;
          }
          if (seconds < 10) {
               seconds = `0${seconds}`;
          }

          return `${minutes}:${seconds}`;
     }

     // Function to play audio
     function playAudio() {
          setPlaying(true);
          audio.current.play();
          if (audioId !== id) {
               setAudioId(id);
          }
          interval.current = setInterval(updateSlider, 100);
     }

     // Function to update slider and time during playback
     function updateSlider() {
          let sliderPosition = 0;

          const { currentTime, duration } = audio.current;
          if (typeof duration === "number") {
               sliderPosition = currentTime * (100 / duration);
               setSliderValue(sliderPosition);
               const time = formatTime(currentTime);
               setDuration(time);
          }
     }

     // Function to stop audio playback
     function stopAudio() {
          audio.current.pause();
          clearInterval(interval.current);
          setPlaying(false);
          setDuration(totalDuration.current);
     }

     // Function to scrub through audio
     function scrubAudio(event) {
          const value = event.target.value;
          const { duration } = audio.current;

          if (isMediaLoaded) {
               const seekTo = duration * (value / 100);
               audio.current.currentTime = seekTo;
               setSliderValue(value);
          }
     }

     return (
          <>
               {/* Audio player UI */}
               <div className={`audioplayer ${sender ? "" : "audioplayer__alt"}`}>
                    {!isMediaLoaded ? (
                         <CircularProgress />
                    ) : isPlaying ? (
                         <PauseRounded onClick={stopAudio} className="pause" />
                    ) : (
                         <PlayArrowRounded onClick={playAudio} />
                    )}
                    <div>
                         {/* Slider for audio playback progress */}
                         <span
                              style={{ width: `${sliderValue}%` }}
                              className="audioplayer__slider--played"
                         />
                         <input
                              type="range"
                              min={1}
                              max={100}
                              value={sliderValue}
                              onChange={scrubAudio}
                              className="audioplayer__slider"
                         />
                    </div>
               </div>
               {/* Display duration of the audio */}
               <span className="chat__timestamp audioplayer__time">{duration}</span>
          </>
     );
}
