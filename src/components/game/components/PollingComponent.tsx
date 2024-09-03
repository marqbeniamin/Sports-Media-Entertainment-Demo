'use client';

import React, { useContext } from 'react';
import { PubNubConext, PubNubType } from '@/context/PubNubContext';

const PollingComponent: React.FC = () => {
  const { pollResults, pollResultSubmitted, submitPollResult } = useContext(PubNubConext) as PubNubType;

  const totalCount = pollResults.Total === 0 ? 1 : pollResults.Total;
  const homePercentage = ((pollResults.Home / totalCount) * 100).toFixed(0);
  const awayPercentage = ((pollResults.Away / totalCount) * 100).toFixed(0);
  const tiePercentage = ((pollResults.Tie / totalCount) * 100).toFixed(0);

  const handleVote = async (option: 'Home' | 'Away' | 'Tie') => {
    if (!pollResultSubmitted) {
      await submitPollResult(option);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md mt-4 text-gray-200">
      <h3 className="text-center font-bold text-xl mb-6 text-white">Vote for Your Team</h3>

      {!pollResultSubmitted && (
        <div className="flex justify-around mb-6">
          <button
            className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg transition"
            onClick={() => handleVote('Home')}
          >
            Home
          </button>
          <button
            className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-lg transition"
            onClick={() => handleVote('Away')}
          >
            Away
          </button>
          <button
            className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold text-lg transition"
            onClick={() => handleVote('Tie')}
          >
            Tie
          </button>
        </div>
      )}

      <div className="mt-6">
        <h4 className="text-center font-semibold text-lg mb-4 text-gray-300">Poll Results</h4>
        <div className="flex justify-around">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">{homePercentage}%</p>
            <p className="text-sm text-gray-400">Home</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-400">{awayPercentage}%</p>
            <p className="text-sm text-gray-400">Away</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">{tiePercentage}%</p>
            <p className="text-sm text-gray-400">Tie</p>
          </div>
        </div>
      </div>
      {pollResultSubmitted && (
        <div className="mt-6 text-center">
          <p className="text-green-500 font-semibold">Thank you for your vote! The poll results have been submitted.</p>
        </div>
      )}
    </div>
  );
};

export default PollingComponent;