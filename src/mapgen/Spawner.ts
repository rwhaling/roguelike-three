import { RNG } from "rot-js";
import Digger from "rot-js/lib/map/digger";
import { Room } from "rot-js/lib/map/features";
import { makeMonster } from "../entities/monster";
import GameState from "../gamestate";
import { posFromKey } from "../utils"

interface LevelSpawner {
    level: number
    default: RoomSpawner
    last: RoomSpawner
    rooms: RoomSpawner[]
}

interface RoomSpawner {
    position: number | "default" | "last"
    contents: RoomContents[]
}

type RoomContents = MonsterSpawner | ItemSpawner

interface MonsterSpawner {
    kind: "MonsterSpawner"
    name: string
    weight: number
}

interface ItemSpawner {
    kind: "ItemSpawner"
    name: string
    weight: number
}

export let level1: LevelSpawner = {
    level: 1,
    default: {
        position: "default",
        contents: [
            {
                kind: "MonsterSpawner",
                name: "a goblin",
                weight: 0.5
            },
            {
                kind: "MonsterSpawner",
                name: "a rat",
                weight: 0.75
            },
            {
                kind: "MonsterSpawner",
                name: "a snake",
                weight: 0.75
            },
            {
                kind: "ItemSpawner",
                name: "g",
                weight: 1.0
            },
            {
                kind: "ItemSpawner",
                name: "*",
                weight: 1.0
            },
            {
                kind: "ItemSpawner",
                name: "r",
                weight: 1.0
            },
        ]
    },
    last: {
        position: "last",
        contents: [
            {
                kind: "MonsterSpawner",
                name: "a goblin",
                weight: 1.0
            },
            {
                kind: "MonsterSpawner",
                name: "a goblin",
                weight: 1.0
            },
            {
                kind: "MonsterSpawner",
                name: "a goblin peltast",
                weight: 1.0
            },
            {
                kind: "ItemSpawner",
                name: "g",
                weight: 1.0
            },
            {
                kind: "ItemSpawner",
                name: "g",
                weight: 1.0
            },
            {
                kind: "ItemSpawner",
                name: "r",
                weight: 1.0
            }
        ]
    },
    rooms: [{
        position: 1,
        contents: [
            {
                kind: "ItemSpawner",
                name: "g",
                weight: 1.0
            },
            {
                kind: "ItemSpawner",
                name: "*",
                weight: 1.0
            },
            {
                kind: "ItemSpawner",
                name: "r",
                weight: 1.0
            }
        ]
    }]
}

function placePlayer(game, freeCells) {
    const key = takeFreeCell(freeCells);
    const pos = posFromKey(key);
    game.player._x = pos[0];
    game.player._y = pos[1];
    game.player.in_map = true;
    return game.player;
}

function placeMonster(game, name, freeCells) {
    const key = takeFreeCell(freeCells);
    const pos = posFromKey(key);
    let m = makeMonster(game, name, pos[0], pos[1]);
    game.monsters.push(m);
    return m;
}

export function spawnLevelFrom(game:GameState, digger:Digger, spawner: LevelSpawner) {
    let rooms = digger.getRooms();
    // hack
    game.monsters = [];

    let shuffledRooms = rooms
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)

    let lastRoomI = shuffledRooms.length - 1;

    for (let [i,room] of shuffledRooms.entries()) {
        var cells = makeFreeCells(room);
        if (i == 0) {
            spawnRoomFrom(game, cells, spawner.rooms[i])
            game.player = placePlayer(game,cells);
            generateItem(game, "<", cells);
        }
        if (i < spawner.rooms.length) {
            spawnRoomFrom(game, cells, spawner.rooms[i])
        } else if (i == lastRoomI) {
            spawnRoomFrom(game, cells, spawner.last)
            generateItem(game, ">", cells)
        } else {
            spawnRoomFrom(game, cells, spawner.default)
        }
    }
}

export function spawnRoomFrom(game:GameState, cells, spawner: RoomSpawner) {
    for (let s of spawner.contents) {
        if (s.kind == "MonsterSpawner") {
            placeMonster(game, s.name, cells)
        } else if (s.kind == "ItemSpawner") {
            generateItem(game, s.name, cells)
        }
    }
}

// export function spawnLevel(game:GameState, digger:Digger, freeCells) {

//     let rooms = digger.getRooms();
//     // hack
//     game.monsters = [];

//     let shuffledRooms = rooms
//         .map(value => ({ value, sort: Math.random() }))
//         .sort((a, b) => a.sort - b.sort)
//         .map(({ value }) => value)

//     let lastRoomI = shuffledRooms.length - 1;

//     for (let [i,room] of shuffledRooms.entries()) {
//         var cells = makeFreeCells(room);
//         if (i == 0) {
//             game.player = placePlayer(game,cells);
//             generateItem(game, "<", cells);
//             generateItem(game, "g", cells);
//             generateItem(game, "*", cells);
//             generateItem(game, "r", cells); // arrow
//         } else if (i == 1) {
//             game.monsters.push(
//                 placeMonster(game, "a goblin", cells),
//                 placeMonster(game, "a rat", cells)
//             )
//             generateItem(game, "g", cells);
//             generateItem(game, "*", cells);
//             generateItem(game, "f", cells); // food
    
//         } else if (i < lastRoomI) {
//             game.monsters.push(
//                 placeMonster(game, "a goblin", cells),
//                 placeMonster(game, "a snake", cells)
//             )
//             generateItem(game, "g", cells);
//             generateItem(game, "*", cells);
//             generateItem(game, "r", cells); // arrow

//         } else if (i == lastRoomI) {
//             game.monsters.push(
//                 placeMonster(game, "a goblin", cells),
//                 placeMonster(game, "a goblin peltast", cells),
//                 placeMonster(game, "a goblin", cells)
//             )
//             generateItem(game, "g", cells);
//             generateItem(game, "g", cells); 
//             generateItem(game, "f", cells); // food
//             generateItem(game, ">", cells);

//         }
//     }
// }

function makeFreeCells(room:Room): string[] {
    let roomCells: string[] = []
    for (let x=room.getLeft(); x<=room.getRight(); x++) {
        for (let y=room.getTop(); y<=room.getBottom(); y++) {
            roomCells.push(`${x},${y}`)
        }
    }
    return roomCells
}

function takeFreeCell(freeCells) {
    const index = Math.floor(
        RNG.getUniform() * freeCells.length);
    const key = freeCells.splice(index, 1)[0];
    return key;
}

function generateItem(game, item, freeCells) {
    const key = takeFreeCell(freeCells);
    // the first chest contains the amulet
    // add either a treasure chest
    // or a piece of gold to the map
    game.items[key] = item;
}
