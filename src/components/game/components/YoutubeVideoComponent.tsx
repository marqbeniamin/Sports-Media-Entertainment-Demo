import React, { useEffect, useRef, useState, useContext } from 'react';
import { PubNubConext, PubNubType } from "@/context/PubNubContext";

const YoutubeVideoComponent = () => {
  const { videoSyncData, isIntermission } = useContext(PubNubConext) as PubNubType;

  const playerRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const [previousVideoSyncData, setPreviousVideoSyncData] = useState<{
    startTimeInSeconds: number | null;
    endTimeInSeconds: number | null;
  }>({ startTimeInSeconds: null, endTimeInSeconds: null });

  const [countdown, setCountdown] = useState<number>(120); // 2 minutes in seconds

  useEffect(() => {
    if (isIntermission) {
      const interval = setInterval(() => {
        setCountdown((prevCountdown) => (prevCountdown > 0 ? prevCountdown - 1 : 0));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isIntermission]);

  useEffect(() => {
    const loadYouTubeIframeAPI = () => {
      if (!(window as any).YT) {
        const scriptTag = document.createElement('script');
        scriptTag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(scriptTag);
      } else {
        initializePlayer(videoSyncData?.startTimeInSeconds || 0);
      }
    };

    const initializePlayer = (startTime: number) => {
      if (playerContainerRef.current) {
        playerContainerRef.current.innerHTML = ''; // Clear any previous player
        const playerElement = document.createElement('div');
        playerElement.id = 'youtube-player';
        playerContainerRef.current.appendChild(playerElement);

        playerRef.current = new (window as any).YT.Player('youtube-player', {
          videoId: '4Pc01w1n9Mg',
          playerVars: {
            autoplay: 1,
            controls: 0,
            enablejsapi: 1,
            start: startTime, // Start the video at the desired time
            modestbranding: 1, // Optional: remove YouTube logo
            rel: 0, // Optional: disable related videos
          },
          events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
            onError: onPlayerError, // Handle potential errors
          },
        });
      }
    };

    const onPlayerReady = () => {
      playerRef.current.setVolume(2); // Set the volume to low (2 out of 100)
      syncVideoWithGameState();
    };

    const onPlayerStateChange = (event: any) => {
      if (event.data === (window as any).YT.PlayerState.ENDED) {
        // Optionally reload the player or handle the end of the video
      }
    };

    const onPlayerError = (error: any) => {
      console.error('YouTube Player Error:', error);
      // Handle errors, such as reloading the player or showing a message
    };

    const syncVideoWithGameState = () => {
      if (playerRef.current && videoSyncData) {
        const { startTimeInSeconds, endTimeInSeconds } = videoSyncData;
        const videoTimeInSeconds = playerRef.current.getCurrentTime();

        // Add 10 seconds to the startTimeInSeconds
        const adjustedStartTimeInSeconds = startTimeInSeconds + 10;

        // Sync only if videoSyncData has actually changed
        if (
          startTimeInSeconds !== previousVideoSyncData.startTimeInSeconds ||
          endTimeInSeconds !== previousVideoSyncData.endTimeInSeconds
        ) {
          // Only seek if the current time is significantly different from the adjusted start time
          if (videoTimeInSeconds < adjustedStartTimeInSeconds || Math.abs(adjustedStartTimeInSeconds - videoTimeInSeconds) > 5) {
            try {
              playerRef.current.seekTo(adjustedStartTimeInSeconds, true);
              playerRef.current.playVideo();
            } catch (error) {
              console.error('Error during seek:', error);
              // Handle any errors during the seek operation
            }
          }

          // Update previousVideoSyncData to avoid unnecessary syncing
          setPreviousVideoSyncData({ startTimeInSeconds, endTimeInSeconds });
        }
      }
    };

    (window as any).onYouTubeIframeAPIReady = () => {
      initializePlayer(videoSyncData?.startTimeInSeconds || 0);
    };

    loadYouTubeIframeAPI();

    const syncInterval = setInterval(syncVideoWithGameState, 10000); // Re-sync every 10 seconds

    return () => {
      clearInterval(syncInterval);
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoSyncData, previousVideoSyncData]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <div ref={playerContainerRef} className="w-full h-[700px] youtube-container relative">
      {isIntermission && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center text-white">
          <h1 className="text-4xl mb-4">Intermission</h1>
          <p className="text-2xl">Game resumes in {formatTime(countdown)}</p>
        </div>
      )}
      {/* YouTube Player will be dynamically injected here */}
    </div>
  );
};

export default YoutubeVideoComponent;