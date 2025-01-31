import { RNG } from "rot-js";
import Digger from "rot-js/lib/map/digger";
import { Room } from "rot-js/lib/map/features";
import { makeMonster, Monster } from "../entities/monster";
import GameState from "../gamestate";
import { posFromKey } from "../utils"
import { getCell, ItemContent, QuestItemContent } from "./Level";
import { Quest } from "./Quests";

export interface LevelSpawner {
    level: number
    default: RoomContents[]
    last: RoomContents[]
    rooms: RoomContents[][]
}

// export type RoomContents = MonsterSpawner | ItemSpawner

export type RoomContents = ["item" | "monster" | "questitem" | "questmonster", string, number]

// export interface MonsterSpawner {
//     kind: "MonsterSpawner"
//     name: string
//     weight: number
// }

// export interface ItemSpawner {
//     kind: "ItemSpawner"
//     name: string
//     weight: number
// }

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

export function spawnLevelFrom(game:GameState, digger:Digger, spawner: LevelSpawner, quest:Quest) {
    let rooms = digger.getRooms();
    // hack
    game.monsters = [];

    let shuffledRooms = rooms
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)

    let lastRoomI = shuffledRooms.length - 1;

    let spawnRooms = spawner.rooms.slice()

    for (let [i,room] of shuffledRooms.entries()) {
        var cells = makeFreeCells(room);
        game.level.roomItems[i] = [];
        if (i == 0) {
            spawnRoomFrom(game, cells, spawnRooms[i], game.level.roomItems[i] )
            game.player = placePlayer(game,cells);
            generateItem(game, "<", cells);
        } else if (i < spawnRooms.length) {
            spawnRoomFrom(game, cells, spawnRooms[i], game.level.roomItems[i])
        } else if (i == spawnRooms.length) {
            if (quest) {
                spawnRoomFrom(game, cells, quest.room, game.level.roomItems[i])
            } else {
                spawnRoomFrom(game, cells, spawner.default, game.level.roomItems[i])
            }
            // placeholder, todo spawn quest room
        } else if (i == lastRoomI) {
            spawnRoomFrom(game, cells, spawner.last, game.level.roomItems[i])
            generateItem(game, ">", cells)
        } else {
            spawnRoomFrom(game, cells, spawner.default, game.level.roomItems[i])
        }
        // console.log("spawned room", room, i, game.level.roomItems[i])
    }
    game.level.rooms = shuffledRooms;
}

export function spawnRoomFrom(game:GameState, cells, contents: RoomContents[], roomItems: [number,number][]) {
    let placedmonster: Monster = null;
    for (let s of contents) {
        let roll = RNG.getUniform()
        if (s[0] == "monster") {
            if (roll < s[2]) {
                placeMonster(game, s[1], cells)
            }
        } else if (s[0] == "item") {
            if (roll < s[2]) {
                let i = generateItem(game, s[1], cells)
                roomItems.push([i.x,i.y]);
            }
        } else if (s[0] == "questitem") {
            if (roll < s[2]) {
                if (placedmonster) {
                    placedmonster.loot = ["Q", s[1], 1]
                    placedmonster = null
                } else {
                    let i = generateQuestItem(game, s[1], cells)
                    roomItems.push([i.x,i.y]);    
                }
            }
        } else if (s[0] == "questmonster") {
            if (roll < s[2]) {
                let m = placeMonster(game, s[1], cells);
                placedmonster = m;
            }
        }
    }
}

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

function generateItem(game, item, freeCells): ItemContent {
    const key = takeFreeCell(freeCells);
    const pos = posFromKey(key);
    let cell = getCell(game.level, pos[0], pos[1])
    let i:ItemContent = { 
        kind: "ItemContent",
        x: pos[0],
        y: pos[1],
        item: item
    }
    cell.contents.push(i)
    // the first chest contains the amulet
    // add either a treasure chest
    // or a piece of gold to the map
    game.items[key] = item;
    return i;
}

function generateQuestItem(game, quest, freeCells): QuestItemContent {
    const key = takeFreeCell(freeCells);
    const pos = posFromKey(key);
    let cell = getCell(game.level, pos[0], pos[1])
    let i:QuestItemContent = { 
        kind: "QuestItemContent",
        x: pos[0],
        y: pos[1],
        item: quest
    }
    cell.contents.push(i)
    // the first chest contains the amulet
    // add either a treasure chest
    // or a piece of gold to the map
    game.items[key] = "Q";
    return i;
}