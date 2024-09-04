'use client';

import { PubNubConext, PubNubType } from '@/context/PubNubContext';
import React, { useContext, useState, useEffect } from 'react';
import { FiChevronRight } from 'react-icons/fi';

type Odd = {
  GameOddId: string;
  Sportsbook: string;
  HomeMoneyLine: number;
  AwayMoneyLine: number;
  HomePointSpread: number;
  AwayPointSpread: number;
};

const BettingComponent: React.FC = () => {
  const { sportsBookData } = useContext(PubNubConext) as PubNubType;

  const [selectedOdd, setSelectedOdd] = useState<Odd | null>(null);
  const [displayedOdds, setDisplayedOdds] = useState<Odd[]>([]);
  const [showAllOdds, setShowAllOdds] = useState<boolean>(false);

  useEffect(() => {
    // Sort the sportsBookData by the largest differential in moneylines
    const sortedOdds = Object.keys(sportsBookData)
      .map((sportsbook) => ({
        Sportsbook: sportsbook,
        ...sportsBookData[sportsbook],
      }))
      .sort((a, b) => Math.abs(b.HomeMoneyLine - b.AwayMoneyLine) - Math.abs(a.HomeMoneyLine - a.AwayMoneyLine));

    // Show only 3 sportsbooks initially
    setDisplayedOdds(sortedOdds.slice(0, 3));
  }, [sportsBookData]);

  const handleBetSelection = (odd: Odd) => {
    setSelectedOdd(odd);
  };

  const toggleViewMore = () => {
    setShowAllOdds(!showAllOdds);
    if (!showAllOdds) {
      setDisplayedOdds(Object.keys(sportsBookData).map((sportsbook) => ({
        Sportsbook: sportsbook,
        ...sportsBookData[sportsbook],
      })));
    } else {
      // Show only the top 3 again
      setDisplayedOdds(Object.keys(sportsBookData)
        .map((sportsbook) => ({
          Sportsbook: sportsbook,
          ...sportsBookData[sportsbook],
        }))
        .sort((a, b) => Math.abs(b.HomeMoneyLine - b.AwayMoneyLine) - Math.abs(a.HomeMoneyLine - a.AwayMoneyLine))
        .slice(0, 3));
    }
  };

  return (
    <div className="w-full mx-auto p-6 bg-gray-800 text-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <p className="text-base sm:text-lg">
          {"Place your bets!"}
        </p>
        <p className="text-sm sm:text-base text-gray-400">
          Orlando Magic vs. Brooklyn Nets
        </p>
      </div>
      {Object.keys(sportsBookData).length === 0 ? (
        <div className="w-full text-center py-10 bg-gray-700 rounded-lg">
          <p className="text-lg">Betting Unavailable</p>
        </div>
      ) : (
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {displayedOdds.map((odd) => (
            <div
              key={odd?.GameOddId || odd.Sportsbook} // Ensure this key is unique and stable
              className={`relative flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-colors duration-300 ${
                selectedOdd === odd ? 'bg-blue-600 border-blue-400' : 'bg-gray-700 border-gray-600'
              }`}
              onClick={() => handleBetSelection(odd)}
              style={{ marginRight: displayedOdds.indexOf(odd) === displayedOdds.length - 1 ? '3rem' : '0' }}
            >
              <span className="text-lg font-bold">{odd.Sportsbook}</span>
              <div className="flex flex-col items-center mt-2">
                <span className="text-sm">Home Money Line: {odd.HomeMoneyLine}</span>
                <span className="text-sm">Away Money Line: {odd.AwayMoneyLine}</span>
                <span className="text-sm">Home Spread: {odd.HomePointSpread}</span>
                <span className="text-sm">Away Spread: {odd.AwayPointSpread}</span>
              </div>
            </div>
          ))}
          {Object.keys(sportsBookData).length > 3 && (
            <div
              className="absolute inset-y-0 right-0 flex items-center cursor-pointer"
              onClick={toggleViewMore}
            >
              <div className="flex items-center justify-center w-10 h-10 bg-gray-600 rounded-full">
                <FiChevronRight className="text-white text-2xl" />
              </div>
            </div>
          )}
        </div>
      )}
      <div className="text-sm sm:text-base text-gray-400 text-center mt-6">
        This is a demo powered by PubNub, showcasing betting and monetization features. Please note that we do not handle actual transactions or the purchase of money lines.
      </div>
      <div className="text-sm sm:text-base text-gray-400 text-center mt-2">
        For real betting activities, please refer to licensed platforms. This demo is for illustrative purposes only.
      </div>
    </div>
  );
};

export default BettingComponent;