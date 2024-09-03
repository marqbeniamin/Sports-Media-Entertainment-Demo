'use client';

import React, { useState } from 'react';
import Image from 'next/image';

const GameNavBar: React.FC = () => {
  const [selectedSport, setSelectedSport] = useState('Basketball');

  const handleSportClick = (sport: string) => {
    // setSelectedSport(sport);
    console.log(`${sport} clicked`);
  };

  return (
    <div className="bg-gray-900 text-gray-400 p-2 w-full">
      <div className="container mx-auto flex flex-wrap justify-between items-center">
        <div className="flex flex-wrap space-x-2 sm:space-x-4 lg:text-[12px] text-[10px]">
          <a
            href="#"
            className={`${selectedSport === 'Basketball' ? 'text-white' : ''} hover:text-white`}
            onClick={() => handleSportClick('Basketball')}
          >
            Basketball
          </a>
          <a
            href="#"
            className={`${selectedSport === 'Football' ? 'text-white' : ''} hover:text-white`}
            onClick={() => handleSportClick('Football')}
          >
            Football
          </a>
          <a
            href="#"
            className={`${selectedSport === 'Ice Hockey' ? 'text-white' : ''} hover:text-white`}
            onClick={() => handleSportClick('Ice Hockey')}
          >
            Ice Hockey
          </a>
          <a
            href="#"
            className={`${selectedSport === 'Tennis' ? 'text-white' : ''} hover:text-white`}
            onClick={() => handleSportClick('Tennis')}
          >
            Tennis
          </a>
          <a
            href="#"
            className={`${selectedSport === 'Cricket' ? 'text-white' : ''} hover:text-white`}
            onClick={() => handleSportClick('Cricket')}
          >
            Cricket
          </a>
          <a
            href="#"
            className={`${selectedSport === 'Table Tennis' ? 'text-white' : ''} hover:text-white`}
            onClick={() => handleSportClick('Table Tennis')}
          >
            Table Tennis
          </a>
          <a
            href="#"
            className={`${selectedSport === 'Esports' ? 'text-white' : ''} hover:text-white`}
            onClick={() => handleSportClick('Esports')}
          >
            Esports
          </a>
          <a
            href="#"
            className={`${selectedSport === 'More' ? 'text-white' : ''} hover:text-white`}
            onClick={() => handleSportClick('More')}
          >
            More
          </a>
        </div>
        <div className="flex space-x-2 sm:space-x-4 mt-2 sm:mt-0">
          <button className="bg-blue-600 px-3 py-1 rounded-lg text-xs sm:text-sm text-white">
            Dropping Odds
          </button>
          <button>
            <Image src="/icons/PubNub/settings.svg" alt="Profile" width={20} height={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameNavBar;