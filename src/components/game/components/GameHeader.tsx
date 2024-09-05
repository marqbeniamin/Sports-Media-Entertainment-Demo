'use client';

import React, { useContext, useEffect, useState } from 'react';
import Image from "next/image";
import { PubNubConext, PubNubType } from "@/context/PubNubContext";

const GameHeader: React.FC = () => {
  const { playbyplayState, gameState, videoSyncData } = useContext(PubNubConext) as PubNubType;

  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false); // State to control if the clock should be paused
  const [showTimeout, setShowTimeout] = useState<boolean>(false); // State for displaying timeout

  useEffect(() => {
    // When play-by-play state updates, set the initial time
    if (playbyplayState.length > 0) {
      const lastPlay = playbyplayState[playbyplayState.length - 1];
      setMinutes(lastPlay?.TimeRemainingMinutes || 0);
      setSeconds(lastPlay?.TimeRemainingSeconds || 0);
    }
  }, [playbyplayState]);

  useEffect(() => {
    const { startTimeInSeconds, endTimeInSeconds } = videoSyncData || {};

    if (startTimeInSeconds != null && endTimeInSeconds != null) {
      // Calculate the timeout duration in seconds
      const timeoutDuration = endTimeInSeconds - startTimeInSeconds;

      // If there's a valid duration, show the timeout
      if (timeoutDuration > 0) {
        setIsPaused(true); // Pause the clock
        setShowTimeout(true); // Show the timeout banner

        // Automatically hide the timeout after the calculated duration
        const timeout = setTimeout(() => {
          setShowTimeout(false);
          setIsPaused(false); // Resume the clock after the timeout is over
        }, timeoutDuration * 1000); // Convert to milliseconds

        // Cleanup the timeout if the component is unmounted or videoSyncData changes
        return () => clearTimeout(timeout);
      }
    }
  }, [videoSyncData]);

  useEffect(() => {
    // Only run the timer if it's not paused
    if (!isPaused) {
      const timer = setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds > 0) {
            return prevSeconds - 1;
          } else if (minutes > 0) {
            setMinutes(minutes - 1);
            return 59;
          } else {
            return 0;
          }
        });
      }, 1000);

      return () => clearInterval(timer); // Clean up the interval on unmount or when paused
    }
  }, [isPaused, minutes, seconds]);

  const quarter = playbyplayState[playbyplayState.length - 1]?.QuarterName || "1";
  const awayTeamScore = playbyplayState[playbyplayState.length - 1]?.AwayTeamScore || 0;
  const homeTeamScore = playbyplayState[playbyplayState.length - 1]?.HomeTeamScore || 0;
  const timeRemaining = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="relative bg-gray-800 text-gray-200 p-4 flex flex-col sm:flex-row justify-between items-center w-full rounded-lg shadow-md">
      {/* Timeout Indicator in the top-left corner */}
      {showTimeout && (
        <div className="absolute top-0 left-0 p-2 text-xs sm:text-sm bg-red-600 text-white rounded-br-lg">
          Timeout
        </div>
      )}

      <div className="flex items-center space-x-2 mb-2 sm:mb-0">
        <Image
          src={`/logos/${gameState?.homeID ?? 5}.png`}
          alt="Home Team"
          width={32}
          height={32}
          className="object-cover rounded-full"
        />
        <span className="text-sm sm:text-lg font-semibold text-white">
          {`Q${quarter} - ${timeRemaining}`}
        </span>
        <Image
          src={`/logos/${gameState?.awayID ?? 8}.png`}
          alt="Away Team"
          width={32}
          height={32}
          className="object-cover rounded-full"
        />
      </div>
      <div className="text-sm sm:text-lg font-semibold flex items-center space-x-2 sm:space-x-6 mb-2 sm:mb-0">
        <span className="text-white">{homeTeamScore}</span>
        <span className="text-gray-400">-</span>
        <span className="text-white">{awayTeamScore}</span>
      </div>
      <button className="bg-blue-600 px-3 py-1.5 rounded-lg text-xs sm:text-sm text-white">
        Follow Event
      </button>
    </div>
  );
};

export default GameHeader;