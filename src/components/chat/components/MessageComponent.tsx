import { Message } from '@pubnub/chat';
import React from 'react';
import Image from "next/image";

type MessageProps = {
  message: Message;
  username: string;
  profileUrl: string | undefined;
};

const MessageComponent: React.FC<MessageProps> = ({ username, message, profileUrl }) => {
  return (
    <div className="flex flex-row items-start space-x-3 mb-4">
        <Image
          src={profileUrl ?? "/avatar/default.png"}
          alt={`Avatar Basketball`}
          width={40}
          height={40}
          className="object-cover rounded-full"
        />
      <span className='text-sm text-blue-600 p-0 m-0'>{username}:</span>
      <span className='text-sm p-0 m-0'>{message.content.text}</span>
    </div>
  );
};

export default MessageComponent;