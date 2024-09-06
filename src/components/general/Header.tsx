'use client'

import React, { useState } from 'react';
import Image from 'next/image';
import ProfileMenu from './ProfileMenu'; // Import the ProfileMenu component
import CreateCommunityModal from './CreateCommunityModal'; // Import the new CreateCommunityModal component

const Header: React.FC = () => {
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isCommunityModalOpen, setCommunityModalOpen] = useState(false);

  const toggleProfileMenu = () => {
    setProfileMenuOpen(!isProfileMenuOpen);
  };

  const toggleCommunityModal = () => {
    setCommunityModalOpen(!isCommunityModalOpen);
  };

  return (
    <>
      <div className="bg-gray-800 text-white p-4 flex flex-wrap justify-between items-center w-full">
        <div className="flex items-center mb-2 sm:mb-0">
          <Image src="/icons/PubNub/pubnub-logo.png" alt="PubNub" width={32} height={32} className="mr-2 pt-1" />
          <span className="text-lg sm:text-xl font-semibold pl-2">Sports Media & Entertainment</span>
        </div>
        <div className="flex flex-wrap items-center space-x-2 sm:space-x-4">
          <button
            className="bg-blue-600 px-3 py-2 rounded-lg text-xs sm:text-sm mb-2 sm:mb-0"
            onClick={toggleCommunityModal} // Open the modal on click
          >
            Create Community
          </button>
          <div className="flex items-center space-x-2">
            <button className="relative">
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
              <Image src="/icons/PubNub/notifications_none.svg" alt="Notifications" width={20} height={20} />
            </button>
            <button>
              <Image src="/icons/PubNub/alternate_email.svg" alt="Mentions" width={20} height={20} />
            </button>
            <button onClick={toggleProfileMenu}>
              <Image src="/icons/PubNub/person_outline.svg" alt="Profile" width={20} height={20} />
            </button>
          </div>
        </div>
      </div>

      {isProfileMenuOpen && <ProfileMenu onClose={toggleProfileMenu} />}
      {isCommunityModalOpen && <CreateCommunityModal onClose={toggleCommunityModal} />}
    </>
  );
};

export default Header;