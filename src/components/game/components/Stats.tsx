'use client';

import React, { useContext } from 'react';
import PercentageBar from '../../chat/components/PercentageBar';
import { PubNubConext, PubNubType } from '@/context/PubNubContext';

const calculatePercentage = (teamA: number, teamB: number) => {
  const total = teamA + teamB;
  return total === 0 ? [50, 50] : [(teamA / total) * 100, (teamB / total) * 100];
};

const StatsComponent: React.FC = () => {
  const { gameState } = useContext(PubNubConext) as PubNubType;

  const timeoutsTeamA = gameState.timeouts?.home ?? 0;
  const timeoutsTeamB = gameState.timeouts?.visitor ?? 0;
  const foulsTeamA = gameState.fouls?.home ?? 0;
  const foulsTeamB = gameState.fouls?.visitor ?? 0;
  const twoPointsTeamA = gameState.twoPoints?.home ?? 0;
  const twoPointsTeamB = gameState.twoPoints?.visitor ?? 0;
  const threePointsTeamA = gameState.threePoints?.home ?? 0;
  const threePointsTeamB = gameState.threePoints?.visitor ?? 0;
  const freeThrowsTeamA = gameState.freeThrows?.home ?? 0;
  const freeThrowsTeamB = gameState.freeThrows?.visitor ?? 0;

  const [twoPointsA, twoPointsB] = calculatePercentage(twoPointsTeamA, twoPointsTeamB);
  const [threePointsA, threePointsB] = calculatePercentage(threePointsTeamA, threePointsTeamB);
  const [freeThrowsA, freeThrowsB] = calculatePercentage(freeThrowsTeamA, freeThrowsTeamB);

  return (
    <div className="bg-gray-800 text-gray-200 p-4 mt-4 rounded-lg shadow-md flex flex-col lg:flex-row justify-between">
      <div className="flex flex-col items-center lg:w-1/4 justify-center">
        <div className="text-center mb-4">
          <h3 className="font-bold text-lg text-white">Home</h3>
          <p className="text-gray-300">Timeouts: {timeoutsTeamA}</p>
          <p className="text-gray-300">Fouls: {foulsTeamA}</p>
        </div>
      </div>
      <div className="lg:w-2/4 flex flex-col justify-center space-y-4">
        <div>
          <h4 className="text-center font-semibold mb-2 text-white">2 Points</h4>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">{twoPointsTeamA}</span>
            <PercentageBar percentage={twoPointsA} direction="right" color="#93c5fd" />
            <PercentageBar percentage={twoPointsB} direction="left" color="#f87171" />
            <span className="text-sm text-gray-300">{twoPointsTeamB}</span>
          </div>
        </div>
        <div>
          <h4 className="text-center font-semibold mb-2 text-white">3 Points</h4>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">{threePointsTeamA}</span>
            <PercentageBar percentage={threePointsA} direction="right" color="#93c5fd" />
            <PercentageBar percentage={threePointsB} direction="left" color="#f87171" />
            <span className="text-sm text-gray-300">{threePointsTeamB}</span>
          </div>
        </div>
        <div>
          <h4 className="text-center font-semibold mb-2 text-white">Free Throws</h4>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">{freeThrowsTeamA}</span>
            <PercentageBar percentage={freeThrowsA} direction="right" color="#93c5fd" />
            <PercentageBar percentage={freeThrowsB} direction="left" color="#f87171" />
            <span className="text-sm text-gray-300">{freeThrowsTeamB}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center lg:w-1/4 justify-center">
        <div className="text-center mb-4">
          <h3 className="font-bold text-lg text-white">Away</h3>
          <p className="text-gray-300">Timeouts: {timeoutsTeamB}</p>
          <p className="text-gray-300">Fouls: {foulsTeamB}</p>
        </div>
      </div>
    </div>
  );
};

export default StatsComponent;