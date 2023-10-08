import { RNG } from "rot-js";
import Digger from "rot-js/lib/map/digger";
import { Room } from "rot-js/lib/map/features";
import { makeMonster } from "../entities/monster";
import { makePlayer } from "../entities/player";
import GameState from "../gamestate";
import { createBeing } from "./MapGen";

export function spawnLevel(game:GameState, digger:Digger, freeCells) {

    let rooms = digger.getRooms();

    let shuffledRooms = rooms
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)
    
    let firstRoom = shuffledRooms[0];
    let middleRooms = shuffledRooms.slice(1,-1);
    let lastRoom = shuffledRooms[shuffledRooms.length - 1];

    game.player = createBeing(game, makePlayer, makeFreeCells(firstRoom));
    generateItem(game, "<", makeFreeCells(firstRoom));
    game.display.setPlayerPos(game.player._x, game.player._y);
    game.monsters = [];

    for (let room of middleRooms) {
        let cells = makeFreeCells(room);
        game.monsters.push(
            createBeing(game, makeMonster, cells),
            createBeing(game, makeMonster, cells)
        )
    }

    let lastRoomCells = makeFreeCells(lastRoom);

    game.monsters.push(
        createBeing(game, makeMonster, lastRoomCells),
        createBeing(game, makeMonster, lastRoomCells),
        createBeing(game, makeMonster, lastRoomCells),
        createBeing(game, makeMonster, lastRoomCells)
    )

    generateItem(game, ">", lastRoomCells);

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

function generateItem(game, item, freeCells) {
    const key = takeFreeCell(freeCells);
    // the first chest contains the amulet
    // add either a treasure chest
    // or a piece of gold to the map
    game.items[key] = item;
}
