import { PubNubContextProvider } from "@/context/PubNubContext";
import Game from "../game";
import Header from "@/components/general/Header";
import GameNavBar from "@/components/game/components/GameNavBar";

export default function Page() {
  return (
    <main className="flex w-full min-h-screen flex-col items-center justify-center bg-black">
      <Header/>
      <GameNavBar/>
      <div className="p-12 w-full">
        <Game/>
      </div>
    </main>
  );
}