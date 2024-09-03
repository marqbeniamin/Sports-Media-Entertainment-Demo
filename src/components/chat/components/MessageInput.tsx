import React from 'react';

const MessageInput: React.FC = () => {
  return (
    <div className="flex items-center space-x-1 sm:space-x-2">
      <input
        type="text"
        placeholder="Type a message..."
        className="flex-1 p-1 sm:p-2 border border-gray-300 rounded-lg text-xs sm:text-sm"
      />
      <button className="px-2 py-1 sm:px-3 sm:py-2 bg-primary text-white rounded-lg text-xs sm:text-sm">
        Send
      </button>
    </div>
  );
};

export default MessageInput;