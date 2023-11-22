import { RNG } from "rot-js";
import Digger from "rot-js/lib/map/digger";
import { Room } from "rot-js/lib/map/features";
import { makeMonster } from "../entities/monster";
import GameState from "../gamestate";
import { posFromKey } from "../utils"

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
    return m;
}

export function spawnLevel(game:GameState, digger:Digger, freeCells) {

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
            game.player = placePlayer(game,cells);
            generateItem(game, "<", cells);
            generateItem(game, "g", cells);
            generateItem(game, "*", cells);
            generateItem(game, "r", cells); // arrow
        } else if (i == 1) {
            game.monsters.push(
                placeMonster(game, "a goblin", cells),
                placeMonster(game, "a rat", cells)
            )
            generateItem(game, "g", cells);
            generateItem(game, "*", cells);
            generateItem(game, "f", cells); // food
    
        } else if (i < lastRoomI) {
            game.monsters.push(
                placeMonster(game, "a goblin", cells),
                placeMonster(game, "a snake", cells)
            )
            generateItem(game, "g", cells);
            generateItem(game, "*", cells);
            generateItem(game, "r", cells); // arrow

        } else if (i == lastRoomI) {
            game.monsters.push(
                placeMonster(game, "a goblin", cells),
                placeMonster(game, "a goblin peltast", cells),
                placeMonster(game, "a goblin", cells)
            )
            generateItem(game, "g", cells);
            generateItem(game, "g", cells); 
            generateItem(game, "f", cells); // food
            generateItem(game, ">", cells);

        }
    }
    
    // let firstRoom = shuffledRooms[0];
    // let middleRooms = shuffledRooms.slice(1,-1);
    // let lastRoom = shuffledRooms[shuffledRooms.length - 1];

    // game.player = createBeing(game, placePlayer, makeFreeCells(firstRoom));
    // generateItem(game, "<", makeFreeCells(firstRoom));
    // // first room - 1 gold, 1 arrows, 1 empty

    // game.display.setPlayerPos(game.player._x, game.player._y);
    // game.monsters = [];

    // let foodRoom = RNG.getUniformInt(0,middleRooms.length - 1);

    // for (let [i,room] of middleRooms.entries()) {
    //     let cells = makeFreeCells(room);
    //     game.monsters.push(
    //         createBeing(game, makeMonster, cells),
    //         createBeing(game, makeMonster, cells)
    //     )
    //     // middle rooms: gold, arrows, 1 food
    // }

    // let lastRoomCells = makeFreeCells(lastRoom);

    // game.monsters.push(
    //     createBeing(game, makeMonster, lastRoomCells),
    //     createBeing(game, makeMonster, lastRoomCells),
    //     createBeing(game, makeMonster, lastRoomCells)
    // )
    // // last room: gold, food, empty

    // generateItem(game, ">", lastRoomCells);

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
