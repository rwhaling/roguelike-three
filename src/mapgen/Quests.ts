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
        depth:1,
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
        status: "unavailable",
        biome:"dungeon",
        depth:3,
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
        depth:6,
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
        giveDescription: "bring me 2 swords from skeleton warriors in crypt level 2",
        handInDescription: "thank you!",
        rewardFunction: (game) => {
            console.log("swords quest COMPLETED")
        }
    },
    "armor": {
        name:"armor",
        status: "unavailable",
        biome:"crypt",
        depth:3,
        room: [
            ["questmonster", "a skeleton warrior", 1.0],
            ["questitem", "armor", 1.0],
            ["questmonster", "a skeleton warrior", 1.0],
            ["questitem", "armor", 1.0],
            ["questmonster", "a skeleton warrior", 1.0],
            ["questitem", "armor", 1.0],
            ["questmonster", "a skeleton warrior", 1.0],
            ["questitem", "armor", 1.0],

            ["item", "g", 1.0],
            ["item", "g", 1.0],
            ["item", "r", 1.0]
        ],
        questItem: "skeleton warrior armor",
        questMonster: null,
        itemCount: 4,
        giver: "count",
        giveDescription: "bring me 4 sets of armor from skeleton warriors in crypt level 3",
        handInDescription: "thank you!",
        rewardFunction: (game) => {
            console.log("swords quest COMPLETED")
        }
    },
    "crown": {
        name:"crown",
        status: "unavailable",
        biome:"crypt",
        depth:5,
        room: [
            ["questmonster", "a skeleton king", 1.0],
            ["questitem", "crown", 1.0],
            ["monster", "a skeleton warrior", 1.0],
            ["monster", "a skeleton warrior", 1.0],
            ["monster", "a skeleton mage", 1.0],
            ["monster", "a skeleton mage", 1.0],
            ["item", "g", 1.0],
            ["item", "g", 1.0],
            ["item", "r", 1.0]
        ],
        questItem: "skeleton king's crown",
        questMonster: null,
        itemCount: 1,
        giver: "count",
        giveDescription: "bring me the crown of the skeleton king in crypt level 4",
        handInDescription: "thank you!",
        rewardFunction: (game) => {
            console.log("swords quest COMPLETED")
        }
    },
}

let questDependencies = {
    "armor":["swords"],
    "shields":["staves"],
    "crown":["amulet"]
}

export function updateQuestStatus() {
    let doneQuests = Object.values(quests).filter( q => q.status === "completed").map( q => q.name);
    console.log("checking quest status.  completed:", doneQuests)
    for (let i in quests) {
        let quest = quests[i];
        if (quest.status === "unavailable" && quest.name in questDependencies) {
            let deps = questDependencies[quest.name]
            let shouldFlip = true
            for (let dep of deps) {
                if (!doneQuests.includes(dep)) {
                    shouldFlip = false
                    console.log(`dependency not satisfied for ${quest.name}:${dep}`)
                    break
                }
            }
            if (shouldFlip) {
                quest.status = "available"
                console.log("flipped quest status to available", quest)
            }
        }
    }
}