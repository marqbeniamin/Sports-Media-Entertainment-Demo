const fs = require('fs');
const { PromiseTimeout, sendMessage } = require('./utils');

const simulateGame = async (channel) => {
  const gameData = JSON.parse(fs.readFileSync('nets_vs_magic_2022/Play by Play_Nets_Magic_3.15.2022.json', 'utf8'));
  const plays = gameData['Plays'];
  const homeID = gameData['Game']['HomeTeamID'];
  const awayID = gameData['Game']['AwayTeamID'];

  const syncDuration = 1700;
  const timeoutDuration = 1700;

  // console.log(`Team IDs: ${homeID} vs ${awayID}`);

  let gameState = {};
  let simulatedElapsedTime = 0;

  const updateGameState = (currentGameState, play) => {
    let newGameState = { ...currentGameState };

    const type = play['Type'];
    switch (type) {
      case 'FieldGoalMade':
        const points = play['Points'];
        if (points == 2) {
          newGameState.twoPoints[play['TeamID'] == homeID ? 'home' : 'visitor'] += 1;
        } else {
          newGameState.threePoints[play['TeamID'] == homeID ? 'home' : 'visitor'] += 1;
        }
        break;
      case 'FreeThrowMade':
        newGameState.freeThrows[play['TeamID'] == homeID ? 'home' : 'visitor'] += 1;
        break;
      case 'Timeout':
        newGameState.timeouts[play['TeamID'] == homeID ? 'home' : 'visitor'] += 1;
        break;
      case 'PersonalFoul':
      case 'ShootingFoul':
      case 'LooseBallFoul':
      case 'TechnicalFoul':
      case 'OffensiveFoul':
      case 'FlagrantFoul':
        newGameState.fouls[play['TeamID'] == homeID ? 'home' : 'visitor'] += 1;
        break;
      default:
        break;
    }

    return newGameState;
  }

  const calculateVideoSyncTime = (play) => {
    if (play.videoStartMinutes !== undefined && play.videoStartSeconds !== undefined) {
      const videoStartTimeInSeconds = parseInt(play.videoStartMinutes) * 60 + parseInt(play.videoStartSeconds);
      const videoEndTimeInSeconds = play.videoEndMinutes ? (parseInt(play.videoEndMinutes) * 60 + parseInt(play.videoEndSeconds)) : null;

      return { videoStartTimeInSeconds, videoEndTimeInSeconds };
    }
    return null;
  }

  while (true) {
    gameState = {
      sequence: 0,
      homeID,
      awayID,
      fouls: {
        home: 0,
        visitor: 0
      },
      timeouts: {
        home: 0,
        visitor: 0
      },
      threePoints: {
        home: 0,
        visitor: 0
      },
      twoPoints: {
        home: 0,
        visitor: 0
      },
      freeThrows: {
        home: 0,
        visitor: 0
      },
    };

    simulatedElapsedTime = 0;

    for (let i = 0; i < plays.length; i++) {
      const play = plays[i];
      const playTimeRemaining = (play['TimeRemainingMinutes'] * 60) + play['TimeRemainingSeconds'];

      const videoSyncTime = calculateVideoSyncTime(play);

      if (videoSyncTime) {
        const message = {
          play,
          gameState,
          simulatedElapsedTime,
          videoSyncTime
        };

        await sendMessage(channel, message);

        const syncDuration = videoSyncTime.videoEndTimeInSeconds - videoSyncTime.videoStartTimeInSeconds;

        let freeThrowPoints = 0;
        while (i < plays.length - 1) {
          const nextPlay = plays[i + 1];
          const nextPlayTimeRemaining = (nextPlay['TimeRemainingMinutes'] * 60) + nextPlay['TimeRemainingSeconds'];

          if (nextPlayTimeRemaining !== playTimeRemaining) {
            break;
          }

          if (nextPlay.Type === 'FreeThrowMade') {
            freeThrowPoints += nextPlay.Points;
            gameState = updateGameState(gameState, nextPlay);
          }

          i++;
        }

        if (freeThrowPoints > 0) {
          const freeThrowMessage = {
            gameState,
            updateType: 'FreeThrowsProcessed',
            points: freeThrowPoints
          };
          await sendMessage(channel, freeThrowMessage);
        }

        await PromiseTimeout((syncDuration) * syncDuration);
      } else {
        gameState = updateGameState(gameState, play);

        const message = {
          play,
          gameState,
          simulatedElapsedTime
        };

        await sendMessage(channel, message);

        if (i < plays.length - 1) {
          const nextPlay = plays[i + 1];
          const nextPlayTimeRemaining = (nextPlay ? (nextPlay['TimeRemainingMinutes'] * 60) + nextPlay['TimeRemainingSeconds'] : 0);

          const differenceInSeconds = playTimeRemaining - nextPlayTimeRemaining;

          simulatedElapsedTime += differenceInSeconds;

          await PromiseTimeout(differenceInSeconds * syncDuration);
        }
      }
    }

    // Intermission logic
    console.log("INTERMISSION REACHED");

    // Restarting the game in 2 minutes
    await sendMessage(channel, { restart: true });

    await PromiseTimeout(2 * 60 * timeoutDuration);
    // After intermission, reset `i` to start the game again
  }
}

module.exports = { simulateGame };