const { Chat } = require("@pubnub/chat");
const { simulateGame } = require('./simulateGame');
const { createChannel } = require('./utils'); // assuming createChannel is in utils.js

const main = async () => {
  const chat = await Chat.init({
    publishKey: 'pub-c-88b8ad7c-3270-45f8-97ce-f82a451b58ac',
    subscribeKey: 'sub-c-722c2adb-390f-4153-849a-fa5700e5eaf2',
    secretKey: 'sec-c-OGJhOGRhOGMtNGY4NC00MTM0LThhZjEtYWY3ZTg2MDU3M2U3',
    userId: "SIM"
  });

  const channelId = 'play-by-play-2023-11-14-OKC-SAS';
  const pollChannelId = 'poll-play-by-play-2023-11-14-OKC-SAS';

  let channel = await chat.getChannel(channelId);
  let pollChannel = await chat.getChannel(pollChannelId);

  if (channel === null) {
    channel = await createChannel(chat, channelId);
  }

  if (pollChannel === null) {
    pollChannel = await createChannel(chat, pollChannelId);
  }

  await simulateGame();
}

main();


