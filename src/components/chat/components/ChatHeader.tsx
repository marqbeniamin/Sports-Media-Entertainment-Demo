'use client';

import React from 'react';
import { FaCog, FaTimes } from 'react-icons/fa';

type MessageProps = {
  precenseCount: number;
};

const ChatHeader: React.FC<MessageProps> = ({ precenseCount }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-800 text-gray-200 rounded-t-lg shadow-md">
      <div className="flex items-center space-x-3">
        <h2 className="text-lg font-semibold text-white">Chatroom</h2>
        <span className="text-xs bg-green-500 text-white rounded-full px-2 py-1">
          {precenseCount} Online
        </span>
      </div>
      <div className="flex items-center space-x-4">
        <button className="text-gray-400 hover:text-gray-300">
          <FaCog className="w-5 h-5" />
        </button>
        <button className="text-gray-400 hover:text-gray-300">
          <FaTimes className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;