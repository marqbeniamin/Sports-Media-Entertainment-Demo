'use client'

import React, { ChangeEvent, useContext, useEffect, useRef, useState } from 'react';
import { Channel, Message, User } from '@pubnub/chat';
import { PubNubConext, PubNubType } from '@/context/PubNubContext';
import { SendHorizontal, Search } from "lucide-react";
import ChatHeader from './components/ChatHeader';
import CommunitySearch from './components/CommunitySearch';
import { RotatingLines } from 'react-loader-spinner';
import MessageComponent from './components/MessageComponent';
import TriviaQuestion from './components/TriviaQuestion';

export default function ChatComponent () {
  const {
    chat,
    user,
    channel,
    activeChannel,
    setActiveChannel
  } = useContext(PubNubConext) as PubNubType;

  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [storedUsers, setStoredUsers] = useState<Map<string, User>>(new Map());
  const [endTimetoken, setEndTimetoken] = useState<string | undefined>();
  const [presenceCount, setPresenceCount] = useState<number>(0);
  const [fetchingHistory, setFetchingHistory] = useState<boolean>(false);
  const [inputMessage, setInputMessage] = useState<string>("");

  const [disconnectMessageStream, setDisconnectMessageStream] = useState<
    (() => void) | undefined
  >();
  const [disconnectPresenseStream, setDisconnectPresenseStream] = useState<
    (() => void) | undefined
  >();

  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);

  // Store trivia data (if available)
  const [triviaQuestion, setTriviaQuestion] = useState<string | null>(null);
  const [triviaAnswers, setTriviaAnswers] = useState<string[]>([]);
  const [canChat, setCanChat] = useState<boolean>(true);

  // Inside your component function
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function initChat() {
      if (!activeChannel || !chat || !user) return;

      // Reset functions
      reset();

      // Extract and set trivia data if it exists in the custom data
      const customData = activeChannel.custom as any;
      if (customData?.trivia_question && customData?.trivia_answers) {
        setTriviaQuestion(customData.trivia_question);
        setTriviaAnswers(customData.trivia_answers.split(", "));
        setCanChat(false);
      } else {
        setTriviaQuestion(null);
        setTriviaAnswers([]);
        setCanChat(true);
      }

      // Join channel, able to listen to incoming messages
      await activeChannel.join((message: Message) => {
        // Cache the stored user if a new user has sent a message
        if (!storedUsers.has(message.userId)) {
          chat?.getUser(message.userId).then((user) => {
            if (user != null) {
              setStoredUsers((users) => {
                const updatedUsers = new Map(users);
                updatedUsers.set(user.id, user);
                return updatedUsers;
              });
            }
          });

          // Callback function that adds incoming messages to the chatMessages state
          setChatMessages((prevMessages) => [...prevMessages, message]);

          // Scroll the chat to the bottom if you receive a message
          setTimeout(() => {
            if (chatContainerRef.current) {
              chatContainerRef.current.scrollTop =
                chatContainerRef.current.scrollHeight;
            }
          }, 200);
        }
      });

      // Join presence stream to listen when people have joined the channel
      const presenceStream = await activeChannel.streamPresence(
        (userIds: string[]) => {
          setPresenceCount(userIds.length);
        },
      );

      setDisconnectPresenseStream(() => presenceStream);

      // Fetch the history from the PubNub channel
      await fetchHistory(activeChannel);
    }

    initChat();

    return () => {
      // Disconnect when the component unmounts or changes
      disconnectMessageStream?.();
      disconnectPresenseStream?.();
    };
  }, [activeChannel]);

  /// Used to update individual messages
  useEffect(() => {
    if (!chatMessages || chatMessages.length == 0) return
    return Message.streamUpdatesOn(chatMessages, setChatMessages);
  }, [chatMessages]);

  const reset = () => {
    setChatMessages([]);
    setPresenceCount(0);
  }

  /// Fetch history from the current channel
  const fetchHistory = async (channel: Channel) => {
    if (fetchingHistory) return;
    setFetchingHistory(true);

    const history = await channel?.getHistory({ count: 20 });

    if (history.messages.length !== 0) {
      const uniqueUserIds = Array.from(new Set(history.messages.map((message) => message.userId)));
      const userIdsToFetch = uniqueUserIds.filter((userId) => !storedUsers.has(userId));

      // Fetch and cache users
      const fetchUserDetailsPromises = userIdsToFetch.map(async (userId) => {
        const userDetails = (await chat?.getUser(userId)) ?? new User();
        return userDetails;
      });

      Promise.all(fetchUserDetailsPromises).then((users: User[]) => {
        const newStoredUsers = new Map(storedUsers);
        for (const user of users) {
          newStoredUsers.set(user.id, user);
        }
        setStoredUsers(newStoredUsers);

        const messages = history.messages;
        const scrollOffset = messages.length * 10;

        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = scrollOffset;
        }

        setChatMessages((prevMessages) => [...messages, ...prevMessages]);
      });
    }

    setFetchingHistory(false);
  };

  const handleJoinCommunity = async (community: Channel) => {
    try {
      setActiveChannel(community)

      setIsSearchActive(false); // Close the search view
    } catch (e) {
      console.error("Error joining community:", e);
      setActiveChannel(channel); // Fallback to the main channel
    }
  };

  // Handle trivia question answer submission
  const handleCorrectAnswer = () => {
    setCanChat(true);
  };

  const handleIncorrectAnswer = () => {
    setCanChat(false);
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (activeChannel && inputMessage) {
      try {
        await activeChannel.sendText(inputMessage, { storeInHistory: true });
      } catch (e) {
        console.log("Failed to send message: ", e);
      }

      setInputMessage("");
    }
  };

  /// Handle changes to the chat input field
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputMessage(event.target.value);
  };

  // Toggle the search view
  const toggleSearch = () => {
    setIsSearchActive(prev => !prev);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-200 rounded-lg shadow-md relative">
      {/* Header with higher z-index to avoid being covered by Trivia */}
      <div className="relative z-30">
        <ChatHeader
          precenseCount={presenceCount}
          onToggleSearch={toggleSearch}
          chatRoomName={activeChannel?.name ?? "Chatroom"}
        />
      </div>

      {/* Conditional rendering: Chat vs Search */}
      {!isSearchActive ? (
        <div className="relative w-full flex flex-col flex-grow bg-gray-800 rounded-b-lg h-full max-h-[500px] min-h-[500px]"> {/* Set a max height here */}
          <div className="flex-grow overflow-y-auto px-4 py-5 custom-scrollbar" ref={chatContainerRef}>
            {fetchingHistory ? (
              <div className="w-full h-20 flex justify-center items-center">
                <RotatingLines width="40" strokeColor="grey" />
              </div>
            ) : (
              chatMessages.map((message) => (
                <MessageComponent
                  key={message.timetoken + message.userId}
                  username={storedUsers.get(message.userId)?.name ?? ""}
                  profileUrl={storedUsers.get(message.userId)?.profileUrl}
                  message={message}
                />
              ))
            )}
          </div>
          {/* Conditionally render the input only if the user is allowed to chat */}
          {canChat && (
            <div className="px-4 pb-4">
              <form onSubmit={handleFormSubmit} className="relative">
                <input
                  name="message"
                  className="h-10 pr-8 w-full rounded-md border border-gray-700 bg-gray-700 px-3 py-2 text-sm text-white shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="text"
                  value={inputMessage}
                  onChange={handleInputChange}
                />
                <div className="absolute bottom-0 right-2 top-0 flex w-5 items-center justify-center">
                  <button className="text-gray-400 hover:text-white transition" type="submit">
                    <SendHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      ) : (
        <CommunitySearch onJoinCommunity={handleJoinCommunity} />
      )}

      {/* Trivia Overlay */}
      {triviaQuestion && !canChat && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-95 z-20 rounded-lg flex items-center justify-center">
          <div className="absolute bottom-0 left-0 right-0  z-10">
            <TriviaQuestion
              question={triviaQuestion}
              answers={triviaAnswers}
              onCorrectAnswer={handleCorrectAnswer}
              onIncorrectAnswer={handleIncorrectAnswer}
              ownerId={activeChannel?.custom?.user ?? ""}
              currentUserId={user?.id ?? ""}
            />
          </div>
        </div>
      )}
    </div>
  );
};