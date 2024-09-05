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
  const [isPlayerReady, setIsPlayerReady] = useState(false); // Track player readiness
  const [isCountdownActive, setIsCountdownActive] = useState<boolean>(false); // Control countdown activity

  // Handle intermission state and countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isIntermission && playerRef.current && isPlayerReady) {
      setIsCountdownActive(true); // Start countdown when intermission starts

      interval = setInterval(() => {
        setCountdown((prevCountdown) => (prevCountdown > 0 ? prevCountdown - 1 : 0));
      }, 1000);

      // Destroy the player during intermission to "remove" it from view
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null; // Set to null so we can re-initialize later
      }
    }

    // Clean up the interval when intermission ends or component unmounts
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isIntermission, isPlayerReady]);

  useEffect(() => {
    // Re-create the YouTube player after the countdown finishes and intermission ends
    if (!isIntermission && countdown === 0 && !playerRef.current && playerContainerRef.current) {
      initializePlayer(videoSyncData?.startTimeInSeconds || 0);
      setIsCountdownActive(false); // Disable countdown once it's done
    }
  }, [isIntermission, countdown]);

  // YouTube player initialization function
  const initializePlayer = (startTime: number) => {
    if (playerContainerRef.current && !playerRef.current) {
      playerRef.current = new (window as any).YT.Player(playerContainerRef.current, {
        videoId: '4Pc01w1n9Mg',
        playerVars: {
          autoplay: 1,
          controls: 0,
          enablejsapi: 1,
          start: startTime,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
          onError: onPlayerError,
        },
      });
    }
  };

  const onPlayerReady = () => {
    playerRef.current.setVolume(0);
    setIsPlayerReady(true); // Player is ready
    syncVideoWithGameState();
  };

  const onPlayerStateChange = (event: any) => {
    if (event.data === (window as any).YT.PlayerState.ENDED) {
      // Handle video end
    }
  };

  const onPlayerError = (error: any) => {
    console.error('YouTube Player Error:', error);
  };

  const syncVideoWithGameState = () => {
    if (playerRef.current && videoSyncData && isPlayerReady) {
      const { startTimeInSeconds, endTimeInSeconds } = videoSyncData;
      const videoTimeInSeconds = playerRef.current.getCurrentTime();

      const adjustedStartTimeInSeconds = startTimeInSeconds + 10;

      if (
        startTimeInSeconds !== previousVideoSyncData.startTimeInSeconds ||
        endTimeInSeconds !== previousVideoSyncData.endTimeInSeconds
      ) {
        if (videoTimeInSeconds < adjustedStartTimeInSeconds || Math.abs(adjustedStartTimeInSeconds - videoTimeInSeconds) > 5) {
          try {
            playerRef.current.seekTo(adjustedStartTimeInSeconds, true);
            playerRef.current.playVideo();
          } catch (error) {
            console.error('Error during seek:', error);
          }
        }

        setPreviousVideoSyncData({ startTimeInSeconds, endTimeInSeconds });
      }
    }
  };

  // Load YouTube player API and handle syncing video with game state
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

    loadYouTubeIframeAPI();

    const syncInterval = setInterval(syncVideoWithGameState, 10000);

    return () => {
      clearInterval(syncInterval);
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null; // Ensure cleanup
      }
    };
  }, [videoSyncData, previousVideoSyncData, isPlayerReady]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <div className="w-full h-[700px] youtube-container relative">
      {isCountdownActive && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center text-white">
          <h1 className="text-4xl mb-4">Intermission</h1>
          <p className="text-2xl">Game resumes in {formatTime(countdown)}</p>
        </div>
      )}
      {/* Player container */}
      <div ref={playerContainerRef} className="w-full h-full"></div>
    </div>
  );
};

export default YoutubeVideoComponent;