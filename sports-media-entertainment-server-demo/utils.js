function PromiseTimeout(delayms) {
  return new Promise(function (resolve, reject) {
    setTimeout(resolve, delayms);
  });
}

const sendMessage = async (channel, message) => {
  try {
    // console.log("PUBLISHING MESSAGE");
    const result = await channel.sendText(message, {
      storeInHistory: true
    });
    // console.log("Message published: ", result.timetoken);
  } catch (error) {
    console.log("Publish failed: ", error);
  }
}

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