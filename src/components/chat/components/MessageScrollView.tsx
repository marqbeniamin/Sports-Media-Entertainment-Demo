import React from 'react';
import MessageComponent from './MessageComponent';

const MessageScrollView: React.FC = () => {
  return (
    <div className="flex-1 p-4 bg-gray-100 overflow-y-auto">
      {/* <MessageComponent profilePicture="/path/to/profile1.jpg" name="Alice" message="Hello, how are you?" />
      <MessageComponent profilePicture="/path/to/profile2.jpg" name="Bob" message="I'm doing well, thanks! How about you?" />
      <MessageComponent profilePicture="/path/to/profile3.jpg" name="Charlie" message="I'm great! Thanks for asking." /> */}
      {/* Add more <Message /> components as needed */}
    </div>
  );
};

export default MessageScrollView;