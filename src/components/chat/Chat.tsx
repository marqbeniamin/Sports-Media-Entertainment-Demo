'use client'

import React, { ChangeEvent, useContext, useEffect, useRef, useState } from 'react';
import ChatHeader from './components/ChatHeader';
import { Channel, Chat, Message, User } from '@pubnub/chat';
import { PubNubConext, PubNubType } from '@/context/PubNubContext';
import { RotatingLines } from "react-loader-spinner";
import MessageComponent from './components/MessageComponent';
import { SendHorizontal } from "lucide-react";

export default function ChatComponent () {

  const {
    chat,
    user,
    channel
  } = useContext(PubNubConext) as PubNubType

  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [storedUsers, setStoredUsers] = useState<Map<string, User>>(new Map());
  const [endTimetoken, setEndTimetoken] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [presenceCount, setPresenceCount] = useState<number>(0);
  const [fetchingHistory, setFetchingHistory] = useState<boolean>(false);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [init, setInit] = useState<boolean>(false);

  const [disconnectMessageStream, setDisconnectMessageStream] = useState<
    (() => void) | undefined
  >();
  const [disconnectPresenseStream, setDisconnectPresenseStream] = useState<
    (() => void) | undefined
  >();

  // Inside your component function
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function initChat() {
      if(!channel || !chat || !user) return
      if(init) return

      console.log("Running init");

      setInit(true);

      // Join channel, able to listen to incoming messages
      await channel.join((message: Message) => {
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

      // Join presence stream to listen when people hav joined the channel
      const presenceStream = await channel.streamPresence(
        (userIds: string[]) => {
          setPresenceCount(userIds.length);
        },
      );

      setDisconnectPresenseStream(() => presenceStream);

      // Fetch the history from the PubNub channel
      await fetchHistory(channel);
    }

    initChat();

    return () => {
      // This function will run when the component unmounts
      disconnectMessageStream?.(); // Disconnect the message stream on the channel
      disconnectPresenseStream?.(); // Disconnect the presense stream on the channel
    };
  }, [
    channel,
    chat,
    storedUsers,
    disconnectPresenseStream,
    disconnectMessageStream
  ])

  /// Used to update individual messages
  useEffect(() => {
    if (!chatMessages || chatMessages.length == 0) return
    return Message.streamUpdatesOn(chatMessages, setChatMessages);
  }, [chatMessages])

    /// Fetch history from the current channel
  /// Stroe all the current users in the stored users
  const fetchHistory = async (channel: Channel) => {
    console.log("Fetching History");
    if (!hasMore || fetchingHistory) return;

    console.log("Currently fetching");
    console.log(fetchingHistory);
    setFetchingHistory(true);
    console.log(fetchingHistory);

    const history = await channel?.getHistory({
      count: 20,
      startTimetoken: endTimetoken,
    });

    setHasMore(history.isMore);
    if (history.messages.length !== 0) {
      // Collect all unique user IDs from the messages
      const uniqueUserIds = Array.from(
        new Set(history.messages.map((message) => message.userId)),
      );

      // Prepare a list of user IDs for which user details need to be fetched
      const userIdsToFetch = uniqueUserIds.filter(
        (userId) => !storedUsers.has(userId),
      );

      // Fetch details only for users not already in the cache
      const fetchUserDetailsPromises = userIdsToFetch.map(async (userId) => {
        const userDetails = (await chat?.getUser(userId)) ?? new User();
        // Update the cache as soon as user details are fetched
        return userDetails;
      });

      // Wait for all the user details to be fetched and cached
      Promise.all(fetchUserDetailsPromises).then((users: User[]) => {
        const newStoredUsers = new Map(storedUsers);
        for (const user of users) {
          newStoredUsers.set(user.id, user);
        }
        setStoredUsers(newStoredUsers);

        const messages = history.messages;
        const messages_length = messages.length;

        // Offset the scroll position depending on how many messages are loaded in
        const scroll_offset = messages_length * 10;

        // Offset the scroll position
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = scroll_offset;
        }

        console.log("Setting Chat Messages");
        console.log(messages);
        // Update chat messages with enriched data
        setChatMessages((prevMessages) => [...messages, ...prevMessages]);

        // Set the timetoken for the next fetch
        setEndTimetoken(messages[0].timetoken);
      });
    }

    console.log("setting fetch");

    setFetchingHistory(false);
  };

  /// Handle the chat input field (Send Message)
  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (channel && inputMessage) {
      try {
        await channel.sendText(inputMessage, {
          storeInHistory: true,
        });
      } catch (e) {
        console.log("Failed to send message: ", e);
      }

      setInputMessage("");
    }
  };

  /// Handle the scroll of the chat
  // const handleScroll = async (e: React.UIEvent<HTMLElement>) => {
  //   const scrollTop = (e.target as HTMLElement).scrollTop;
  //   if (scrollTop === 0) {
  //     // Fetch more messages when scrolled to top
  //     if (channel) {
  //       await fetchHistory(channel);
  //     }
  //   }
  // };

  /// Handle changes to the chat input field
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputMessage(event.target.value);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-200 rounded-lg shadow-md">
      <ChatHeader precenseCount={presenceCount} />
      <div className="relative w-full flex flex-col flex-grow bg-gray-800 rounded-b-lg h-full max-h-[500px]"> {/* Set a max height here */}
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
        <div className="px-4 pb-4">
          <form onSubmit={handleFormSubmit} className="relative">
            <input
              name="message"
              className="h-10 pr-8 w-full rounded-md border border-gray-700 bg-gray-700 px-3 py-2 text-sm text-white shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              type="text"
              value={inputMessage}
              onChange={handleInputChange}
            />
            <div className="absolute bottom-0 right-2 top-0 flex w-5 items-center justify-center">
              <button
                className="text-gray-400 hover:text-white transition"
                type="submit"
              >
                <SendHorizontal className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};