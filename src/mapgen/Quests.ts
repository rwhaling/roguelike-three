import GameState from "../gamestate"
import { RoomContents } from "./Spawner"

export type QuestStatus = "unavailable" | "available" | "accepted" | "ready" | "completed"

export interface Quest {
    name: string
    status: QuestStatus
    biome: string
    depth: number
    room: RoomContents[]
    questItem: string
    questMonster: string
    itemCount: number
    giver: string
    giveDescription: string
    handInDescription: string
    rewardFunction: (game:GameState) => void
}

export let quests: {[key:string]: Quest} = {
    "amulet": {
        name:"amulet",
        status: "available",
        biome:"dungeon",
        depth:1,
        room: [
            ["questmonster", "a bat", 1.0],
            ["questitem", "amulet", 1.0],
            ["item", "r", 1.0],
            ["item", "r", 1.0],       
            ["item", "r", 1.0]
        ],
        questItem: "amulet",
        questMonster: null,
        itemCount: 1,
        giver: "count",
        giveDescription: "bring me the amulet of Yendor",
        handInDescription: "quickly, give me the amulet!",
        rewardFunction: (game) => {
            console.log("amulet quest COMPLETED")
        }
    }
}

