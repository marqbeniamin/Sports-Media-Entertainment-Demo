const fs = require('fs');
const { PromiseTimeout, sendMessage } = require('./utils');

const simulatePreGameBetting = async (bettingChannel) => {
  const preGameBettingData = JSON.parse(fs.readFileSync('nets_vs_magic_2022/Pre-Game Line Movement_ Nets_Magin_3.15.2022.json', 'utf8'));

  // Organize all sportsbooks data at the beginning
  const organizedData = preGameBettingData.map(game => {
    const sportsbooks = {};
    game.PregameOdds.forEach((odds, index) => {
      const sportsbook = odds.Sportsbook;

      if (!sportsbooks[sportsbook]) {
        sportsbooks[sportsbook] = [];
      }
      sportsbooks[sportsbook].push(odds);
    });
    return { gameId: game.GameId, sportsbooks };
  });

  while (true) { // Continuous loop
    for (const gameData of organizedData) {
      const sportsbookKeys = Object.keys(gameData.sportsbooks);
      const maxLength = Math.max(...sportsbookKeys.map(key => gameData.sportsbooks[key].length));

      for (let j = 0; j < maxLength; j++) {
        const messages = [];

        sportsbookKeys.forEach((sportsbook, idx) => {
          const oddsList = gameData.sportsbooks[sportsbook];
          const oddsIndex = j % oddsList.length; // Loop through data continuously
          const odds = oddsList[oddsIndex];

          messages.push({
            gameId: gameData.gameId,
            sportsbook: sportsbook,
            odds: odds,
          });
        });

        // Send the message for each sportsbook at this point in time
        for (const message of messages) {
          // console.log(`Sending odds for Sportsbook ${message.sportsbook}: ${JSON.stringify(message)}`);
          await sendMessage(bettingChannel, JSON.stringify(message));
        }

        await PromiseTimeout(20000); // Pause for 2 seconds between each betting data message
      }
    }
  }
}

module.exports = { simulatePreGameBetting };