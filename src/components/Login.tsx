"use client";

import { useContext, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PubNubConext, PubNubType } from "@/context/PubNubContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { createUser, createChannel, createPollChannel, subscribeToGame, subscribeToPoll, subscribeToBetting } = useContext(PubNubConext) as PubNubType;

  const handleLogin = async () => {
    if (username && avatar) {
      try {
        await createUser(username, `/avatar/${avatar}`);
        await createChannel("chatroom");
        await createPollChannel("poll-play-by-play-2023-11-14-OKC-SAS");
        await subscribeToGame('play-by-play-2023-11-14-OKC-SAS');
        await subscribeToPoll('poll-play-by-play-2023-11-14-OKC-SAS');
        await subscribeToBetting('betting-play-by-play-2023-11-14-OKC-SAS');
        router.push("/game");
      } catch (e) {
        setError("Failed to login. Please try again.");
      }
    } else {
      setError("Please enter a username and select an avatar.");
    }
  };

  return (
    <div className="flex h-screen w-screen bg-gray-900 text-gray-200 p-8">
      <div className="flex flex-col lg:flex-row w-full max-w-7xl mx-auto my-auto p-8 bg-gray-800 rounded-lg shadow-lg">
        {/* Left Section: Login Form */}
        <div className="lg:w-1/2 w-full mb-8 lg:mb-0">
          <h1 className="text-4xl font-bold mb-8 text-white">Join the stream!</h1>

          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mb-4 w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-base text-white"
          />

          <h2 className="text-lg font-semibold mb-4 text-gray-300">Select an Avatar</h2>
          <div className="flex space-x-4 mb-8">
            {["001-avatar.png", "002-avatar.png", "003-avatar.png", "004-avatar.png", "005-avatar.png", "006-avatar.png", "007-avatar.png", "008-avatar.png", "default.png"].map((avatarOption) => (
              <div
                key={avatarOption}
                className={`rounded-full border-2 ${
                  avatar === avatarOption ? "border-blue-500" : "border-transparent"
                } cursor-pointer`}
                onClick={() => setAvatar(avatarOption)}
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

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <button
            onClick={handleLogin}
            className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-base"
          >
            Login
          </button>
        </div>

        {/* Right Section: Client Logos */}
        <div className="lg:w-1/2 w-full flex flex-col justify-center items-center">
          <h2 className="text-xl font-semibold mb-6 text-white">Trusted by</h2>
          <div className="grid grid-cols-2 gap-8 justify-center items-center">
            <Image src="/logos/clients/dazn.png" alt="Client 1 Logo" width={150} height={150} className="object-contain" />
            <Image src="/logos/clients/stageit.png" alt="Client 2 Logo" width={180} height={180} className="object-contain" />
            <Image src="/logos/clients/livelike.png" alt="Client 3 Logo" width={200} height={200} className="object-contain" />
            <Image src="/logos/clients/vfairs.png" alt="Client 4 Logo" width={150} height={150} className="object-contain" />
          </div>
        </div>
      </div>
    </div>
  );
}