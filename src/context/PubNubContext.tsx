"use client"

import { Channel, Chat, Message, User } from "@pubnub/chat";
import React, { ReactNode, useEffect, useState } from "react";

// Define the type for PollResults
type PollResults = {
  Home: number;
  Away: number;
  Tie: number;
  Total: number;
};

type Trivia = {
  question: string,
  answers: string[]
}

export interface PubNubType {
  chat: Chat | undefined;
  user: User | undefined;
  channel: Channel | undefined;
  communities: Channel[];
  pollChannel: Channel | undefined;
  playbyplayState: any;
  gameState: any;
  pollResults: any;
  isIntermission: boolean,
  pollResultSubmitted: boolean,
  videoSyncData: {startTimeInSeconds: number, endTimeInSeconds: number} | null,
  sportsBookData: { [key: string]: any },
  activeChannel: Channel | undefined,
  yourCommunities: Channel[],
  createUser: (username: string, profileImg: string) => Promise<void>;
  createChannel: (id: string) => Promise<void>;
  createPollChannel: (id: string) => Promise<void>;
  createCommunity: (
    id: string,
    name: string,
    description: string,
    trivia?: Trivia // Make trivia optional with "?" syntax
  ) => Promise<Channel | undefined>,
  subscribeToGame: (id: string) => Promise<void>;
  subscribeToPoll: (id: string) => Promise<void>;
  subscribeToBetting: (id: string) => Promise<void>;
  subscribeToCoupon: (id: string) => Promise<void>;
  submitPollResult: (vote: "Home" | "Away" | "Tie") => Promise<void>;
  placeBet: (betDetails: BetDetails, coupon: boolean) => Promise<void>;
  setActiveChannel: React.Dispatch<React.SetStateAction<Channel | undefined>>,
  getCommunities: () => Promise<void>
}

// Define bet details
type BetDetails = {
  team: "Home" | "Away";
  amount: number;
  odds: number;
  completed?: boolean; // To mark a bet as completed
};

export const PubNubConext = React.createContext<PubNubType | null>(null);

export const PubNubContextProvider = ({ children }: { children: ReactNode }) => {
  const [chat, setChat] = useState<Chat>();
  const [user, setUser] = useState<User>();
  const [channel, setChannel] = useState<Channel>();
  const [communities, setCommunities] = useState<Channel[]>([]);
  const [yourCommunities, setYourCommunities] = useState<Channel[]>([]);
  const [pollChannel, setPollChannel] = useState<Channel>();
  const [playbyplayState, setplaybyplayState] = useState<any[]>([]);
  const [gameState, setGameState] = useState<any>({});
  const [isIntermission, setIsIntermission] = useState<boolean>(false);
  const [pollResults, setPollResults] = useState<PollResults>({
    Home: 0,
    Away: 0,
    Tie: 0,
    Total: 0,
  });
  const [pollResultSubmitted, setPollResultSubmitted] = useState<boolean>(false);
  const [videoSyncData, setVideoSyncData] = useState<{startTimeInSeconds: number, endTimeInSeconds: number} | null>(null);
  const [sportsBookData, setSportsBookData] = useState<{[key: string]: any}>({});
  const [activeChannel, setActiveChannel] = useState<Channel | undefined>(channel);

  // Initialize PubNub chat and set the user balance
  const initChat = async () => {
    console.log("INIT CHAT RUNS");
    const userId = `user_${Math.floor(Math.random() * 1000)}_${Date.now()}`;
    try {
      const chat = await Chat.init({
        publishKey: process.env.NEXT_PUBLIC_PUBNUB_PUBLISH_KEY,
        subscribeKey: process.env.NEXT_PUBLIC_PUBNUB_SUBSCRIBE_KEY,
        userId: userId,
        typingTimeout: 5000,
        storeUserActivityTimestamps: true,
        storeUserActivityInterval: 300000 /* 5 minutes */,
      });

      setChat(chat);
      let currentUser = chat.currentUser;

      // Set initial user balance if not already set
      if (!currentUser.custom?.balance) {
        currentUser = await chat.currentUser.update({
          custom: { balance: 250, bets: JSON.stringify([]), coupon: 1.0 } // Initialize balance and bets in the custom field
        });
        setUser(currentUser); // Update user state with the new balance
      } else {
        setUser(currentUser);
      }
    } catch (e) {
      console.log(e);
      console.error("Failed to initialize PubNub:", e);
    }
  };

  const createUser = async (username: string, profileImg: string) => {
    // console.log("Running create User");
    if (chat === undefined) {
      throw new Error("This function must be used within a PubNubProvider");
    }

    var newUser;

    try{
      newUser = await chat.currentUser.update({
        name: username,
        profileUrl: profileImg
      });
    }
    catch(e){
      console.log("Failed to updated user: ", e);
    }

    setUser(newUser);
  }

  const createChannel = async (id: string) => {
    let channel = await getChannel(id);
    setActiveChannel(channel);
    setChannel(channel);
  }

  const createPollChannel = async (id: string) => {
    let channel = await getChannel(id);
    setPollChannel(channel);
  }

  const getChannel = async (id: string): Promise<Channel> => {
    if(chat === undefined){
      throw new Error("This function must be used within a PubNubProvider");
    }
    let newChannel: Channel | null;

    newChannel = await chat.getChannel(id);

    if(newChannel === null){
      // We want to create a public conversation to let users engage in open conversation with many people.
      // Unlike group chats, anyone can join public channels.
      newChannel = await chat.createPublicConversation({
        channelId: id,
        channelData: {
          name: `${id}`,
          description: "Custom Channel",
        },
      });
    }

    return newChannel;
  }

  // const getCommunity = async (id: string): Promise<Channel | null> => {
  //   if(chat === undefined){
  //     throw new Error("This function must be used within a PubNubProvider");
  //   }
  //   let newCommunity: Channel | null;

  //   newCommunity = await chat.getChannel(id);

  //   return newCommunity;
  // }

  const getCommunities = async (): Promise<void> => {
    if (chat === undefined) {
      throw new Error("This function must be used within a PubNubProvider");
    }

    const filterList = [
      "Publib Conversation - chatroom",
      "betting-play-by-play-2023-11-14-OKC-SAS",
      "betting-play-by-play-nets-magic-test",
      "play-by-play-2023-11-14-OKC-SAS",
      "play-by-play-nets-magic-test",
      "poll-play-by-play-2023-11-14-OKC-SAS",
      "poll-play-by-play-nets-magic-test",
      "betting-play-by-play-nets-magic",
      "play-by-play-nets-magic",
      "poll-play-by-play-nets-magic"
    ];

    try {
      const channelData = await chat.getChannels({
        filter: "type=='public'",
        limit: 50,
      });

      // Exclude channels that are in the filterList
      const communities = channelData.channels.filter(channel => !filterList.includes(channel.name || ''));

      setCommunities(communities); // Set filtered communities in state
    } catch (error) {
      console.error("Error fetching communities:", error);
    }
  };

  const createCommunity = async (
    id: string,
    name: string,
    description: string,
    trivia?: Trivia // Make trivia optional with "?" syntax
  ): Promise<Channel | undefined> => {

    if (chat === undefined) {
      throw new Error("This function must be used within a PubNubProvider");
    }

    let channel: Channel | undefined;

    try {
      // Create the custom data object
      const customData: { user: string; trivia_question?: string; trivia_answers?: string } = {
        user: chat.currentUser.id,
      };

      // If trivia is provided, flatten it and add it to the custom data
      if (trivia) {
        customData.trivia_question = trivia.question;
        customData.trivia_answers = trivia.answers.join(", "); // Store answers as a comma-separated string
      }

      // Create the channel with the provided data
      channel = await chat.createPublicConversation({
        channelId: id,
        channelData: {
          name: name,
          description: description,
          custom: customData,
        },
      });
    } catch (error) {
      console.log("Failed to create the community: ", error);
    }

    if (channel) {
      setCommunities((prevState: any) => [...prevState, channel]);
      setYourCommunities((prevState: any) => [...prevState, channel]);
    }

    return channel;
  };

  function promiseTimeout(delayms: number) {
    return new Promise(function (resolve, reject) {
      setTimeout(resolve, delayms);
    })
  }

  const updatePlayStates = (newPlay: any) => {
    setplaybyplayState((prevState: any) => [...prevState, newPlay]);
  };

  const subscribeToBetting = async (id: string) => {
    if(!chat) return;

    let betChannel: Channel | null;

    betChannel = await getChannel(id);

    betChannel.join(async (message: Message) => {
      try {
        const messageContent = message.content.text;
        const parsedData = JSON.parse(messageContent);

        // console.log("Data Received");
        // console.log(parsedData);

        // Assuming parsedData has a structure like { sportsbook: string, odds: any }
        const sportsbook = parsedData.sportsbook;

        // Update the current data for this sportsbook in the state
        setSportsBookData(prevData => ({
          ...prevData,
          [sportsbook]: parsedData.odds,
        }));

        // Now sportsBookData[sportsbook] will hold the latest data for that sportsbook

      } catch (error) {
        console.error("Failed to parse bet data:", error);
      }
    });

    return;
  }

  const subscribeToCoupon = async (id: string) => {
    if(!chat) return;

    let couponChannel: Channel | null;

    couponChannel = await getChannel(id);

    couponChannel.join(async (message: Message) => {
      try {
        console.log("Coupon message content");
        console.log(message.content.text);

        let discount: number;

        /// Find out which discount you should get on your next bet
        switch (message.content.text) {
          case "1/10":
            discount = 0.90;
            break;
          case "1/5":
            discount = 0.80;
            break;
          case "1/2":
            discount = 0.5;
            break;
          default:
            discount = 1.0;
            break;
        }

        // Update the user's balance and bets in user.custom
      const updatedUser = await chat.currentUser.update({
        custom: {
          balance: user?.custom.balance,
          bets: user?.custom.bets,
          coupon: discount
        },
      });
      }
      catch(e){
        console.log(e);
      }
    });
  }

  const subscribeToGame = async (id: string) => {
    if (!chat) return;

    let gameChannel: Channel | null;

    gameChannel = await getChannel(id);

    gameChannel.join(async (message: Message) => {
      console.log("Messaged received");
      try {
        const messageContent = message.content.text;
        const parsedData = JSON.parse(messageContent);

        console.log(parsedData);

        if (parsedData.restart) {
          await calculateResults()
          setIsIntermission(true);
          setGameState({});
          setplaybyplayState([]);
          await promiseTimeout(3000);
          return;
        }
        else if(!isIntermission){
          setIsIntermission(false);
        }

        // Store video sync data if available
        if (parsedData.videoSyncTime) {
          const { videoStartTimeInSeconds, videoEndTimeInSeconds } = parsedData.videoSyncTime;
          setVideoSyncData({ startTimeInSeconds: videoStartTimeInSeconds, endTimeInSeconds: videoEndTimeInSeconds });
        }

        updatePlayStates(parsedData.play);
        setGameState(parsedData.gameState);
      } catch (error) {
        console.error("Failed to parse message content:", error);
      }
    });

    return;
  };

  const subscribeToPoll = async (id: string) => {
    if(!chat) return;

    let pollChannel: Channel | null;

    pollChannel = await getChannel(id);

    await fetchPollHistory(id);

    pollChannel.join(async (message: Message) => {
      try {
        const messageContent = message.content.text;

        if (messageContent.includes("Home") || messageContent.includes("Away") || messageContent.includes("Tie")) {
          setPollResults(prevResults => {
            // Create a new object based on the previous state
            const updatedResults = {
              ...prevResults,
              Total: prevResults.Total + 1, // Increment the total vote count
            };

            // Update vote counts based on the new vote
            if (messageContent.includes("Home")) {
              updatedResults.Home += 1;
            } else if (messageContent.includes("Away")) {
              updatedResults.Away += 1;
            } else if (messageContent.includes("Tie")) {
              updatedResults.Tie += 1;
            }

            // Return the new results object
            return updatedResults;
          });
        }
      } catch (error) {
        console.error("Failed to process poll message:", error);
      }
    });

    return;
  }

  const submitPollResult = async (vote: "Home" | "Away" | "Tie") => {
    if (!pollChannel) return;
    try {
      const message = vote;
      await pollChannel.sendText(message, {
        storeInHistory: true,
      });
    } catch (error) {
      console.error("Failed to submit poll result:", error);
    }

    setPollResultSubmitted(true);
  };

  const fetchPollHistory = async (id: string) => {

    let pollChannel: Channel | null;

    pollChannel = await getChannel(id);

    try {
      const history = await pollChannel.getHistory({
        count: 100, // Adjust the count as needed
      });

      const messages = history?.messages || [];
      const voteCounts = {
        Home: 0,
        Away: 0,
        Tie: 0,
        total: 0,
      };

      for (let i = 0; i < messages.length; i++) {
        const content = messages[i].content.text;

        if (content.includes("Home")) {
          voteCounts.Home += 1;
        } else if (content.includes("Away")) {
          voteCounts.Away += 1;
        } else if (content.includes("Tie")) {
          voteCounts.Tie += 1;
        }

        voteCounts.total += 1;
      }

      setPollResults({
        Home: voteCounts.Home,
        Away: voteCounts.Away,
        Tie: voteCounts.Tie,
        Total: voteCounts.total
      });
    } catch (error) {
      console.error("Failed to fetch poll history:", error);
    }
  };

  // Place a bet and update the user context using user.custom
  const placeBet = async (betDetails: BetDetails, coupon: boolean) => {
    if (!user || !chat) return;

    var betDetailsAmount = betDetails.amount;

    if(coupon){
      betDetailsAmount *= user.custom?.coupon ?? 1.0;
    }

    const currentBalance = user.custom?.balance || 250;
    if (currentBalance < betDetailsAmount) {
      console.error("Insufficient balance");
      return;
    }

    try {
      // Subtract the bet amount from the user's balance
      const newBalance = currentBalance - betDetailsAmount;

      // Retrieve and update the bets from user.custom
      const currentBets = user.custom?.bets ? JSON.parse(user.custom.bets) : [];

      // Add the new bet to the array
      const updatedBets = [...currentBets, betDetails];

      // Update the user's balance and bets in user.custom
      const updatedUser = await chat.currentUser.update({
        custom: {
          balance: newBalance,
          bets: JSON.stringify(updatedBets),
          coupon: coupon ? 1.0 : user.custom?.coupon
        },
      });

      // Update the user state with the new data
      setUser(updatedUser);
    } catch (error) {
      console.error("Failed to place bet:", error);
    }
  };

  // Calculate results when the game reaches intermission and mark bets as completed
  const calculateResults = async () => {
    if (!playbyplayState.length || !user || !chat) return;

    const lastPlay = playbyplayState[playbyplayState.length - 1] || {};
    const homeScore = lastPlay.HomeTeamScore || 0;
    const awayScore = lastPlay.AwayTeamScore || 0;

    let updatedUser = user;
    const currentBets = JSON.parse(updatedUser?.custom?.bets || '[]') as BetDetails[];
    let currentBalance = user?.custom?.balance || 250;

    // Loop through each bet and calculate if the user won or lost
    const updatedBets = currentBets.map((bet: BetDetails) => {
      if (!bet.completed) {
        if (
          (bet.team === "Home" && homeScore > awayScore) ||
          (bet.team === "Away" && awayScore > homeScore)
        ) {
          // User wins, calculate return based on odds
          const potentialReturn = bet.amount * (bet.odds > 0 ? 1 + bet.odds / 100 : 1 - 100 / bet.odds);
          currentBalance += potentialReturn;
        }
        // Mark the bet as completed
        return { ...bet, completed: true };
      }
      return bet;
    });

    // Update user balance and store the updated bets in user.custom
    updatedUser = await chat.currentUser.update({
      custom: { balance: currentBalance, bets: JSON.stringify(updatedBets) },
    });

    // Update the user state with the new data
    setUser(updatedUser);
  };

  // Initialize the PubNub instance
  useEffect(() => {
    if (!chat) {
      initChat();
    }
  }, [chat, initChat]);

  return (
    <PubNubConext.Provider
      value={{
        chat,
        user,
        channel,
        pollChannel,
        playbyplayState,
        gameState,
        pollResults,
        isIntermission,
        pollResultSubmitted,
        videoSyncData,
        sportsBookData,
        communities,
        activeChannel,
        yourCommunities,
        createUser,
        createChannel,
        subscribeToGame,
        subscribeToPoll,
        submitPollResult,
        createPollChannel,
        subscribeToBetting,
        subscribeToCoupon,
        placeBet,
        createCommunity,
        setActiveChannel,
        getCommunities
      }}
    >
      {children}
    </PubNubConext.Provider>
  );
}
