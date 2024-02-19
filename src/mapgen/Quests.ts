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
    "staves": {
        name:"staves",
        status: "available",
        biome:"dungeon",
        depth:2,
        room: [
            ["questmonster", "a goblin mage", 1.0],
            ["questitem", "staves", 1.0],
            ["questmonster", "a goblin mage", 1.0],
            ["questitem", "staves", 1.0],
            ["item", "g", 1.0],
            ["item", "f", 1.0],       
            ["item", "r", 1.0]
        ],
        questItem: "a goblin mage staff",
        questMonster: null,
        itemCount: 2,
        giver: "count",
        giveDescription: "bring me 2 staffs from goblin mages in dungeon level 2",
        handInDescription: "thank you!",
        rewardFunction: (game) => {
            console.log("staves quest COMPLETED")
        }
    },
    "shields": {
        name:"shields",
        status: "available",
        biome:"dungeon",
        depth:4,
        room: [
            ["questmonster", "a goblin peltast", 1.0],
            ["questitem", "shields", 1.0],
            ["questmonster", "a goblin peltast", 1.0],
            ["questitem", "shields", 1.0],
            ["item", "g", 1.0],
            ["item", "f", 1.0],       
            ["item", "r", 1.0]
        ],
        questItem: "a goblin peltast shield",
        questMonster: null,
        itemCount: 2,
        giver: "count",
        giveDescription: "bring me 2 shields from goblin peltasts in dungeon level 4",
        handInDescription: "thank you!",
        rewardFunction: (game) => {
            console.log("staves quest COMPLETED")
        }
    },
    "amulet": {
        name:"amulet",
        status: "available",
        biome:"dungeon",
        depth:1,
        room: [
            ["questmonster", "a death knight", 1.0],
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
    },
    "swords": {
        name:"swords",
        status: "available",
        biome:"crypt",
        depth:1,
        room: [
            ["questmonster", "a skeleton warrior", 1.0],
            ["questitem", "swords", 1.0],
            ["questmonster", "a skeleton warrior", 1.0],
            ["questitem", "swords", 1.0],
            ["item", "g", 1.0],
            ["item", "g", 1.0],
            ["item", "r", 1.0]
        ],
        questItem: "a skeleton warrior sword",
        questMonster: null,
        itemCount: 2,
        giver: "count",
        giveDescription: "bring me 2 swords from skeleton warrios in crypt level 1",
        handInDescription: "thank you!",
        rewardFunction: (game) => {
            console.log("swords quest COMPLETED")
        }
    },

}

