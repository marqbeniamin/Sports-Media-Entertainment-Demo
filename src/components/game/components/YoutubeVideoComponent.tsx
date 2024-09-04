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
      if (playerContainerRef.current && !playerRef.current) {
        const playerElement = document.createElement('div');
        playerElement.id = 'youtube-player';
        playerContainerRef.current.appendChild(playerElement);

        playerRef.current = new (window as any).YT.Player('youtube-player', {
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
      playerRef.current.setVolume(2);
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

    (window as any).onYouTubeIframeAPIReady = () => {
      initializePlayer(videoSyncData?.startTimeInSeconds || 0);
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
    <div ref={playerContainerRef} className="w-full h-[700px] youtube-container relative">
      {isIntermission && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center text-white">
          <h1 className="text-4xl mb-4">Intermission</h1>
          <p className="text-2xl">Game resumes in {formatTime(countdown)}</p>
        </div>
      )}
    </div>
  );
};

export default YoutubeVideoComponent;