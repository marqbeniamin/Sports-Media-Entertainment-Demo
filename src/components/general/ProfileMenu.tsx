import React, { useContext, useEffect, useState } from 'react';
import Image from 'next/image';
import { PubNubConext, PubNubType } from '@/context/PubNubContext';
import AvatarSelectionModal from './AvatarSelectionModal';

// Define bet details
type BetDetails = {
  team: "Home" | "Away";
  amount: number;
  odds: number;
  completed?: boolean; // To mark a bet as completed
};

const ProfileMenu: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [name, setName] = useState("");
  const [balance, setBalance] = useState(250); // Default balance, will be updated from user context
  const [bets, setBets] = useState<BetDetails[]>([]); // Use Bet type for the bets array
  const [isAvatarModalOpen, setAvatarModalOpen] = useState(false); // Avatar modal state
  const { user, createUser } = useContext(PubNubConext) as PubNubType;
  const [isNameChanged, setIsNameChanged] = useState(false);

  // Function to calculate potential returns based on odds and amount
  const calculatePotentialReturns = (amount: number, odds: number) => {
    if (odds > 0) {
      return amount * (1 + odds / 100); // Positive odds formula
    } else {
      return amount * (1 - 100 / odds); // Negative odds formula
    }
  };

  const handleUpdateUser = async () => {
    await createUser(name, user?.profileUrl ?? '');
    setIsNameChanged(false); // Reset the flag after saving
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setIsNameChanged(true); // Set the flag when name is changed
  };

  const handleAvatarSelect = async (avatar: string) => {
    setAvatarModalOpen(false);
    await createUser(name, `/avatar/${avatar}`);
  };

  useEffect(() => {
    setName(user?.name || '');
    // Check if user has custom data, update balance and bets accordingly
    const userBalance = user?.custom?.balance || 250; // Default balance if not set
    const userBets = user?.custom?.bets ? JSON.parse(user.custom.bets) : []; // Parse bets if available

    setBalance(userBalance);
    setBets(userBets);
  }, [user]);

  return (
    <>
      <div className="fixed top-0 right-0 h-full w-72 sm:w-96 bg-gray-900 shadow-lg p-6 transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto sm:max-w-sm sm:top-0 sm:right-0 sm:w-full sm:h-screen">
        {/* Header with Background and Profile Picture */}
        <div className="relative bg-gradient-to-b from-blue-700 to-blue-900 h-40 sm:h-52 w-full rounded-b-lg mb-10">
          <div className="absolute inset-x-0 -bottom-10 flex justify-center">
            <Image
              src={user?.profileUrl ?? ''} // Replace with the actual path of your profile image
              alt="Profile Picture"
              width={80}
              height={80}
              className="rounded-full border-4 border-gray-900"
            />
          </div>
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-300 focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="text-center mt-12">
          <h3 className="text-xl text-white">{user?.name ?? ''}</h3>
          <button
            className="mt-2 px-4 py-1 text-sm font-semibold text-blue-500 border border-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition"
            onClick={() => setAvatarModalOpen(true)}
          >
            Change Avatar
          </button>
        </div>

        {/* Change Name Input with Save Button */}
        <div className="mt-8 mb-6 px-4 flex items-center space-x-4">
          <div className="flex-grow">
            <label className="text-sm text-gray-400 mb-2 block">Change Name</label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              className="w-full p-2 bg-gray-800 text-white rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {isNameChanged && (
            <button
              onClick={handleUpdateUser}
              className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Save
            </button>
          )}
        </div>

        {/* Balance Display */}
        <div className="mb-8 px-4">
          <div className="bg-gray-800 p-4 rounded-lg shadow-md text-center">
            <span className="text-lg text-gray-400">Balance</span>
            <div className="text-2xl text-white mt-1">${balance.toFixed(2)}</div>
          </div>
        </div>

        {/* Current Bets Display */}
        <div className="px-4">
          <h4 className="text-md text-gray-400 mb-2">Current Bets</h4>
          <div className="space-y-4">
            {bets.length > 0 ? (
              bets.map((bet, index) => (
                <div key={index} className="bg-gray-800 p-4 rounded-lg shadow-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-white">Bet on {bet.team}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-400">
                    <span>Amount: <span className="text-white">${bet.amount}</span></span>
                    <span>Odds: <span className="text-white">{bet.odds}</span></span>
                  </div>
                  <div className="mt-2 flex justify-between items-center text-sm text-gray-400">
                    <span>Potential Returns</span>
                    <span className="text-white">
                      ${calculatePotentialReturns(bet.amount, bet.odds).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No current bets.</p>
            )}
          </div>
        </div>
      </div>

      {/* Avatar Selection Modal */}
      {isAvatarModalOpen && (
        <AvatarSelectionModal
          onClose={() => setAvatarModalOpen(false)}
          onAvatarSelect={handleAvatarSelect}
        />
      )}
    </>
  );
};

export default ProfileMenu;