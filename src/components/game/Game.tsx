'use client'

import GameHeader from "./components/GameHeader"
import Card from "../Card"
import StatsComponent from "./components/Stats"
import ChatComponent from "../chat/Chat"
import TimelineComponent from "./components/TimelineComponent"
import PollingComponent from "./components/PollingComponent"
import YouTubeVideoComponent from "./components/YoutubeVideoComponent"
import BettingComponent from "./components/BettingComponent"

export default function GameComponent () {
  return (
    <div className="flex flex-col h-full w-full">
      <GameHeader/>
      <div className="flex flex-1 mt-4 flex-col lg:flex-row">
        <div className="lg:w-2/3 w-full mb-4 lg:mb-0">
          <Card className="mb-4 w-full">
            <BettingComponent/>
          </Card>
          <Card className="mb-4 w-full lg:h-[700px] h-[350px]">
            <YouTubeVideoComponent/>
          </Card>
          <Card className="mb-4 w-full">
            <StatsComponent/>
          </Card>
        </div>
        <div className="lg:w-1/3 w-full lg:ml-4 mt-4 lg:mt-0">
          <Card>
            <div className="w-full rounded-lg">
              <ChatComponent/>
            </div>
          </Card>
          <Card className="mt-4">
            <div className="w-full rounded-lg">
              <PollingComponent/>
            </div>
          </Card>
          <Card className="mt-4">
            <TimelineComponent/>
          </Card>
        </div>
      </div>
    </div>
  )
}