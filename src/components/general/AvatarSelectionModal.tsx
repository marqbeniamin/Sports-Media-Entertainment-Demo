import React, { useState } from 'react';
import Image from 'next/image';

const AvatarSelectionModal: React.FC<{ onClose: () => void, onAvatarSelect: (avatar: string) => void }> = ({ onClose, onAvatarSelect }) => {
  const [selectedAvatar, setSelectedAvatar] = useState<string>("");

  const handleAvatarSelection = (avatar: string) => {
    setSelectedAvatar(avatar);
    onAvatarSelect(avatar);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-800 rounded-lg shadow-lg p-8 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4 text-gray-300">Select an Avatar</h2>
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {["001-avatar.png", "002-avatar.png", "003-avatar.png", "004-avatar.png", "005-avatar.png", "006-avatar.png", "007-avatar.png", "008-avatar.png", "default.png"].map((avatarOption) => (
            <div
              key={avatarOption}
              className={`rounded-full border-2 ${selectedAvatar === avatarOption ? "border-blue-500" : "border-transparent"} cursor-pointer`}
              onClick={() => handleAvatarSelection(avatarOption)}
            >
              <Image
                src={`/avatar/${avatarOption}`}
                alt={`Avatar ${avatarOption}`}
                width={64}
                height={64}
                className="object-cover rounded-full"
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarSelectionModal;