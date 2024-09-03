import React from 'react';
import MessageInput from './MessageInput';

const ChatFooter: React.FC = () => {
  return (
    <div className="p-3 sm:p-4 bg-gray-200 rounded-b-lg">
      <MessageInput />
    </div>
  );
};

export default ChatFooter;