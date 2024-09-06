'use client';

import React, { useContext } from 'react';
import { Search, Globe } from 'lucide-react'; // Added Globe icon from lucide-react
import { PubNubConext, PubNubType } from '@/context/PubNubContext';

type ChatHeaderProps = {
  chatRoomName: string;
  precenseCount: number;
  onToggleSearch: () => void; // Add prop to handle search toggle
};

const ChatHeader: React.FC<ChatHeaderProps> = ({ precenseCount, chatRoomName, onToggleSearch }) => {
  const {
    channel,       // Global chat channel
    activeChannel, // Currently active chat channel
    setActiveChannel
  } = useContext(PubNubConext) as PubNubType;

  // Function to go back to the global chat
  const goToGlobalChat = () => {
    setActiveChannel(channel); // Set the active channel to the global channel
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-800 text-gray-200 rounded-t-lg shadow-md">
      <div className="flex items-center space-x-3">
        <h2 className="text-lg font-semibold text-white">{chatRoomName == "Publib Conversation - chatroom" ? "Global Chat" : chatRoomName}</h2>
        <span className="text-xs bg-green-500 text-white rounded-full px-2 py-1">
          {precenseCount} Online
        </span>
      </div>
      <div className="flex items-center space-x-4">
        {/* Show Globe icon only if user is not in the global chat */}
        {activeChannel?.id !== channel?.id && (
          <button
            onClick={goToGlobalChat}
            className="text-gray-400 hover:text-gray-300"
            title="Go to Global Chat"
          >
            <Globe className="w-5 h-5" />
          </button>
        )}

        {/* Search Icon */}
        <button onClick={onToggleSearch} className="text-gray-400 hover:text-gray-300" title="Search">
          <Search className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;