const PubNub = require('pubnub');
require('dotenv').config();

const pubnub = new PubNub({
  publishKey: process.env.PUBNUB_PUBLISH_KEY,  // Loaded from .env
    subscribeKey: process.env.PUBNUB_SUBSCRIBE_KEY,  // Loaded from .env
    secretKey: process.env.PUBNUB_SECRET_KEY,  // Loaded from .env
    userId: "SIM"
});

function PromiseTimeout(delayms) {
  return new Promise(function (resolve, reject) {
    setTimeout(resolve, delayms);
  });
}

const sendMessage = async (channel, message) => {
  try {
    await pubnub.publish({
      channel: channel.id, // the channel name
      message: message,
      storeInHistory: true // option to store the message in history
    });
    await channel.sendText(JSON.stringify(message), {
      storeInHistory: true
    });
  } catch (error) {
    console.log("Publish failed: ", error);
  }
};

const createChannel = async (chat, id) => {
  try {
    channel = await chat.createPublicConversation({ channelId: id });
  } catch (error) {
    console.log("Channel already exists or error creating:", error);
    channel = await chat.getChannel(id);
  }

  return channel;
}

module.exports = { PromiseTimeout, sendMessage, createChannel };