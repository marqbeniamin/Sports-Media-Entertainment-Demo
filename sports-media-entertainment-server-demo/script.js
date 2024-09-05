const { Chat } = require("@pubnub/chat");
const { simulateGame } = require('./simulateGame');
const { simulatePreGameBetting } = require('./simulatePreBetting');
const { createChannel } = require('./utils');
require('dotenv').config();

const main = async () => {
  const chat = await Chat.init({
    publishKey: process.env.PUBNUB_PUBLISH_KEY,  // Loaded from .env
    subscribeKey: process.env.PUBNUB_SUBSCRIBE_KEY,  // Loaded from .env
    secretKey: process.env.PUBNUB_SECRET_KEY,  // Loaded from .env
    userId: "SIM"
  });

  const channelId = 'play-by-play-nets-magic-test';
  const pollChannelId = 'poll-play-by-play-nets-magic-test';
  const bettingChannelId = 'betting-play-by-play-nets-magic-test';

  let channel = await chat.getChannel(channelId);
  let pollChannel = await chat.getChannel(pollChannelId);
  let bettingChannel = await chat.getChannel(bettingChannelId);

  if (channel === null) {
    channel = await createChannel(chat, channelId);
  }

  if (pollChannel === null) {
    pollChannel = await createChannel(chat, pollChannelId);
  }

  if (bettingChannel === null) {
    bettingChannel = await createChannel(chat, bettingChannelId);
  }

  simulatePreGameBetting(bettingChannel);
  await simulateGame(chat, channel, pollChannel, bettingChannel);
}

main();