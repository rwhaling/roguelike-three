import GameState from "../gamestate"
import { RoomContents } from "./Spawner"

export type QuestStatus = "unavailable" | "available" | "accepted" | "ready" | "completed"

export interface Quest {
    id: string
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
    "tutorial": {
        id: "tutorial",
        name:"Into the Barrow",
        status:"ready",
        biome:"dungeon",
        depth:1,
        room: [
            ["monster","a goblin", 1.0],
            ["item","g", 1.0]
        ],
        questItem: "",
        questMonster: null,
        itemCount: 0,
        giver: "Steward",
        giveDescription: "Descend into the barrow, and return to tell the tale!",
        handInDescription: "So you’ve been down into the barrow, eh?  Piles of treasure in there, but evil, too. If you’re going back, make sure to stock up on food - the old ruins go deep, you’ll need supplies. Might want to talk to the master-at-arms in the barracks, too - your gear might need some work.",
        rewardFunction: (game) => {
            console.log("tutorial quest COMPLETED")
        }
    },
    // "staves": {
    //     name:"Fetch Goblin Staves",
    //     status: "available",
    //     biome:"dungeon",
    //     depth:1,
    //     room: [
    //         ["questmonster", "a goblin mage", 1.0],
    //         ["questitem", "staves", 1.0],
    //         ["questmonster", "a goblin mage", 1.0],
    //         ["questitem", "staves", 1.0],
    //         ["item", "g", 1.0],
    //         ["item", "f", 1.0],       
    //         ["item", "r", 1.0]
    //     ],
    //     questItem: "a goblin mage staff",
    //     questMonster: null,
    //     itemCount: 2,
    //     giver: "Quartermaster",
    //     giveDescription: "bring me 2 staffs from goblin mages in dungeon level 1",
    //     handInDescription: "thank you!",
    //     rewardFunction: (game) => {
    //         console.log("staves quest COMPLETED")
    //     }
    // },
    "shields": {
        id: "shields",
        name:"Fetch Goblin Shields",
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
        giver: "Quartermaster",
        giveDescription: "You might have seen the goblin elites further down in the barrow - mean little guys, and those spears are no joke.\n\nIf you can bring me two of their shields, I can use it to reinforce that board you’ve got - if you’re serious about this line of work, you’ll need it.\n\nMight want to train some first, though.",
        handInDescription: "There you go.\n\nStay safe down there.",
        rewardFunction: (game) => {
            console.log("staves quest COMPLETED")
        }
    },
    "amulet": {
        id: "amulet",
        name:"Seek the Amulet of Yendor!",
        status: "unavailable",
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
        giver: "The Count",
        giveDescription: "Oh, another adventurer?  If you’re looking for work, there’s an old amulet deep in the barrow - bring it back and I’ll pay you well.  Well?  What are you waiting for?",
        handInDescription: "Magnificent.  A mysterious warrior had it, you say?  Hmm, can’t imagine how anyone could have been living down there alone.\n\n",
        rewardFunction: (game) => {
            console.log("amulet quest COMPLETED")
        }
    },
    "armor": {
        id: "armor",
        name:"Skeleton Warrior Armor",
        status: "unavailable",
        biome:"crypt",
        depth:1,
        room: [
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
        itemCount: 2,
        giver: "Quartermaster",
        giveDescription: "Have you been in the old crypt?\n\nThe ancient warriors down there have this armor, never seen an alloy quite like it.\n\nBring me a few pieces of that armor, and we can see about making some proper protection for you!",
        handInDescription: "Look at that - cold iron.\n\nLet’s take it over to the smith.",
        rewardFunction: (game) => {
            console.log("armor quest COMPLETED")
        }
    },
    // "armor": {
    //     name:"armor",
    //     status: "unavailable",
    //     biome:"crypt",
    //     depth:3,
    //     room: [
    //         ["questmonster", "a skeleton warrior", 1.0],
    //         ["questitem", "armor", 1.0],
    //         ["questmonster", "a skeleton warrior", 1.0],
    //         ["questitem", "armor", 1.0],
    //         ["questmonster", "a skeleton warrior", 1.0],
    //         ["questitem", "armor", 1.0],
    //         ["questmonster", "a skeleton warrior", 1.0],
    //         ["questitem", "armor", 1.0], 

    //         ["item", "g", 1.0],
    //         ["item", "g", 1.0],
    //         ["item", "r", 1.0]
    //     ],
    //     questItem: "skeleton warrior armor",
    //     questMonster: null,
    //     itemCount: 4,
    //     giver: "count",
    //     giveDescription: "bring me 4 sets of armor from skeleton warriors in crypt level 3",
    //     handInDescription: "thank you!",
    //     rewardFunction: (game) => {
    //         console.log("swords quest COMPLETED")
    //     }
    // },
    "crown": {
        id: "crown",
        name:"Yendor's Crown",
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
        giver: "The Count",
        giveDescription: "Ready for more?  Splendid, it’s so rare to see a good work ethic these days.\n\nMy scholars tell me of an old crown in the deepest part of the crypt, that once belonged to the old witch-king Yendor.",
        handInDescription: "Fine work.  Now begone!",
        rewardFunction: (game) => {
            console.log("swords quest COMPLETED")
        }
    },
}

let questDependencies = {
    "shields":["tutorial"],
    "amulet":["tutorial"],
    "armor":["shields"],
    "crown":["amulet"],
}

export function updateQuestStatus() {
    let doneQuests = Object.values(quests).filter( q => q.status === "completed").map( q => q.id);
    console.log("checking quest status.  completed:", doneQuests)
    for (let i in quests) {
        let quest = quests[i];
        if (quest.status === "unavailable" && quest.id in questDependencies) {
            let deps = questDependencies[i]
            let shouldFlip = true
            for (let dep of deps) {
                if (!doneQuests.includes(dep)) {
                    shouldFlip = false
                    console.log(`dependency not satisfied for ${i}:${dep}`)
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