'use client';

import { PubNubConext, PubNubType } from '@/context/PubNubContext';
import React, { useContext, useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { Switch } from '@headlessui/react';

// Define bet details locally
type BetDetails = {
  team: "Home" | "Away";
  amount: number;
  odds: number;
  completed?: boolean; // To mark a bet as completed
};

type Odd = {
  GameOddId: string;
  Sportsbook: string;
  HomeMoneyLine: number;
  AwayMoneyLine: number;
  HomePointSpread: number;
  AwayPointSpread: number;
};

const BettingComponent: React.FC = () => {
  const { sportsBookData, placeBet, user } = useContext(PubNubConext) as PubNubType;

  const [selectedOdd, setSelectedOdd] = useState<Odd | null>(null);
  const [displayedOdds, setDisplayedOdds] = useState<Odd[]>([]);
  const [betAmount, setBetAmount] = useState<string>(''); // Change to string for validation
  const [betSelection, setBetSelection] = useState<'home' | 'away' | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false); // New state for loading
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // New state for error message
  const [useCoupon, setUseCoupon] = useState<boolean>(false); // State for coupon usage

  const userCoupon = user?.custom?.coupon;

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
    setBetSelection(null); // Reset the bet type (home or away)
    setBetAmount(''); // Reset bet amount
    setErrorMessage(null); // Clear any error messages
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setBetAmount('');
    setBetSelection(null);
    setErrorMessage(null);
    setIsLoading(false); // Reset loading state
  };

  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow digits (0-9) and ignore any non-numeric characters
    if (/^\d*$/.test(value)) {
      setBetAmount(value);
    }
  };

  const calculatePotentialReturns = () => {
    if (!selectedOdd || !betSelection || !betAmount) return 0;

    const selectedMoneyLine = betSelection === 'home' ? selectedOdd.HomeMoneyLine : selectedOdd.AwayMoneyLine;
    let potentialReturn = 0;
    const amount = parseFloat(betAmount);

    // Calculate the return based on the selected money line
    if (selectedMoneyLine > 0) {
      potentialReturn = amount * (1 + selectedMoneyLine / 100);
    } else {
      potentialReturn = amount * (1 - 100 / selectedMoneyLine);
    }

    return potentialReturn.toFixed(2);
  };

  const submitBet = async () => {
    if (!selectedOdd || !betSelection || !betAmount) return;

    let betAmountNumber = parseFloat(betAmount);
    const currentBalance = user?.custom?.balance || 250;

    // Apply the coupon discount if it's activated
    if (useCoupon && userCoupon) {
      betAmountNumber *= userCoupon;
    }

    // Check if user has enough balance
    if (betAmountNumber > currentBalance) {
      setErrorMessage('Insufficient balance. Please lower your bet amount.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    // Place the bet using the context method
    const betDetails: BetDetails = {
      team: betSelection === 'home' ? 'Home' : 'Away', // Use "Home" | "Away" as required by BetDetails
      amount: betAmountNumber,
      odds: betSelection === 'home' ? selectedOdd.HomeMoneyLine : selectedOdd.AwayMoneyLine,
    };

    try {
      await placeBet(betDetails, useCoupon);
      closeModal();
    } catch (error) {
      console.error("Error placing bet:", error);
      setIsLoading(false); // Ensure loading state is reset if error occurs
    }
  };

  return (
    <div className="w-full mx-auto p-6 bg-gray-800 text-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <p className="text-base sm:text-lg">{"Place your bets!"}</p>
        <p className="text-sm sm:text-base text-gray-400">Orlando Magic vs. Brooklyn Nets</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {displayedOdds.map((odd) => (
          <div
            key={odd?.GameOddId || odd.Sportsbook}
            className={`relative flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-colors duration-300 ${
              selectedOdd === odd ? 'bg-blue-600 border-blue-400' : 'bg-gray-700 border-gray-600'
            }`}
            onClick={() => handleBetSelection(odd)}
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
      </div>

      {showModal && selectedOdd && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-lg text-center">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Place Your Bet</h2>
              <button onClick={closeModal} className="text-white">
                <FiX className="text-2xl" />
              </button>
            </div>
            <p className="mb-4">
              Betting through <span className="font-bold">{selectedOdd.Sportsbook}</span>
            </p>

            <div className="flex justify-center space-x-4 mb-4">
              <button
                className={`px-4 py-2 rounded-lg text-sm ${
                  betSelection === 'home' ? 'bg-blue-600' : 'bg-gray-700'
                }`}
                onClick={() => setBetSelection('home')}
                disabled={isLoading}
              >
                Home Money Line: {selectedOdd.HomeMoneyLine}
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-sm ${
                  betSelection === 'away' ? 'bg-blue-600' : 'bg-gray-700'
                }`}
                onClick={() => setBetSelection('away')}
                disabled={isLoading}
              >
                Away Money Line: {selectedOdd.AwayMoneyLine}
              </button>
            </div>

            {/* Coupon activation */}
            {userCoupon && userCoupon < 1.0 && (
              <div className="mb-4">
                <Switch
                  checked={useCoupon}
                  onChange={setUseCoupon}
                  className={`${useCoupon ? 'bg-blue-600' : 'bg-gray-700'} relative inline-flex items-center h-6 rounded-full w-11`}
                >
                  <span className="sr-only">Activate Coupon</span>
                  <span
                    className={`${useCoupon ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition`}
                  />
                </Switch>
                <p className="text-sm mt-2 text-gray-400">
                  {useCoupon
                    ? `Coupon applied: ${userCoupon * 100}% off!`
                    : 'Activate coupon to get a discount on your bet.'}
                </p>
              </div>
            )}

            <input
              type="text"
              value={betAmount}
              onChange={handleBetAmountChange}
              placeholder="Enter bet amount"
              className="w-full p-2 text-gray-900 rounded-lg mb-4"
              disabled={isLoading}
            />

            <p className="mb-4">
              Potential Returns: <span className="font-bold">${calculatePotentialReturns()}</span>
            </p>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg w-full"
              onClick={submitBet}
              disabled={isLoading}
            >
              {isLoading ? 'Placing Bet...' : 'Place Bet'}
            </button>
          </div>
        </div>
      )}

      <div className="text-sm sm:text-base text-gray-400 text-center mt-6">
        This is a demo powered by PubNub, showcasing betting and monetization features.
      </div>
    </div>
  )
};

export default BettingComponent;
