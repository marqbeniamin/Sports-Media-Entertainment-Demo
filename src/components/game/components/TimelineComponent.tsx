'use client';

import { PubNubConext, PubNubType } from '@/context/PubNubContext';
import React, { useContext } from 'react';
import Image from 'next/image';

const TimelineComponent: React.FC = () => {
  const { playbyplayState } = useContext(PubNubConext) as PubNubType;

  const getIconPath = (type: string): string => {
    switch (type) {
      case 'FlagrantFoul':
        return '/icons/012-basketball-player-1.png';
      case 'Traveling':
        return '/icons/016-traveling.png';
      case 'Palming':
        return '/icons/010-steal-1.png';
      case 'OffensiveFoul':
        return '/icons/012-basketball-player-1.png';
      case 'KickBall':
        return '/icons/015-football.png';
      case 'TechnicalFoul':
        return '/icons/012-basketball-player-1.png';
      case 'LooseBallFoul':
        return '/icons/008-rebound-1.png';
      case 'Challenge':
        return '/icons/012-basketball-player-1.png';
      case 'FreeThrowMade':
        return '/icons/004-fireball.png';
      case 'FreeThrowMissed':
        return '/icons/006-net.png';
      case 'ShootingFoul':
        return '/icons/013-basketball-jersey.png';
      case 'PersonalFoul':
        return '/icons/013-basketball-jersey.png';
      case 'Turnover':
        return '/icons/010-steal-1.png';
      case 'Steal':
        return '/icons/009-steal.png';
      case 'FieldGoalMissed':
        return '/icons/006-net.png';
      case 'FieldGoalMade':
        return '/icons/004-fireball.png';
      case 'JumpBall':
        return '/icons/003-player.png';
      case 'Substitution':
        return '/icons/001-substitute-player.png';
      case 'Period':
        return '/icons/002-time-left.png';
      case 'Timeout':
        return '/icons/002-time-left.png';
      case 'Rebound':
        return '/icons/007-rebound.png';
      case 'Turnover':
        return '/icons/005-turnover.png';
      default:
        return '/icons/default-icon.png';
    }
  };

  return (
    <div className="w-full max-w-full mx-auto p-6">
      <div className="relative flex items-center bg-gray-900 rounded-lg p-4 overflow-x-auto max-w-[100%]">
        <div className="flex items-center space-x-8 min-w-max">
          {playbyplayState?.map((play: any) => (
            play && play.PlayID && play.Type && play.TeamID && play.Description && (
              <div key={play.PlayID + Date.now() + Math.random()} className="flex flex-col items-center">
                <div className="flex items-center justify-center w-12 h-12 bg-white border-4 border-gray-300 rounded-full">
                  <Image
                    src={getIconPath(play.Type)}
                    alt={`${play.Type} Icon`}
                    width={30}
                    height={30}
                  />
                </div>
                <div className="mt-2 p-2 bg-gray-800 rounded-lg shadow-lg w-40">
                  <p className="text-white text-xs overflow-hidden whitespace-nowrap text-overflow-ellipsis">
                    {play.Description}
                  </p>
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimelineComponent;