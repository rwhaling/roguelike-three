import RNG from "rot-js/lib/rng";
import Digger from "rot-js/lib/map/digger";
import GameState from "../gamestate";

// these map tiles are walkable
const walkable = [".", "*", "g"]

// these map tiles should not be replaced by room edges
const noreplace = walkable.concat(["M", "╔", "╗", "╚", "╝", "═", "║"]);

    // guess what, this generates the game map
export function genMap(game:GameState, width, height, tileOptions, minimap?): [string[], string[], Digger] {
    // we're using the ROT.js Digger tilemap
    // there are lots of interesting dungeon
    // generation algorithms here:
    // http://ondras.github.io/rot.js/manual/#map
    // http://ondras.github.io/rot.js/manual/#map/maze
    // http://ondras.github.io/rot.js/manual/#map/cellular
    // http://ondras.github.io/rot.js/manual/#map/dungeon    
    const digger = new Digger(
            width,
            height, {
                roomWidth: [8, 18],
                roomHeight: [6, 15],
                corridorLength: [3,12],
                dugPercentage: 0.35,
            });
    // list of floor tiles that can be walked on
    // but don't have anything on them yet
    const freeCells: string[] = [];
    // list of non-floor tiles that can't be traversed
    // which we'll put scenery on
    const zeroCells:  string[] = [];

    // the way the ROT.js map generators work is they
    // call this callback for every tile generated with
    // the `value` set to the type of space at that point
    const digCallback = function(x, y, value) {
        const key = x + "," + y;
        if (value) {
        // store this in the non-walkable cells list
            zeroCells.push(key);
        } else {
            // on our map we want to draw a "walkable" tile
            // here which is represented by a dot
            game.map[key] = ".";

            // draw the minimap
            // minimap.draw(x,y,"","","white");

            // store this in the walkable cells list
            freeCells.push(key);
        }
    }
    // kick off the map creation algorithm to build
    // the basic map shape with rooms and corridors
    digger.create(digCallback.bind(game));

    // now we spawn generators for populating other stuff
    // in the map - you can read each of these below
    generateItems(game, freeCells);
    // generateScenery(game.map, zeroCells);
    generateRooms(game.map, digger);

    return [zeroCells, freeCells, digger];

    // // finally we put the player and one monster on their
    // // starting tiles, which must be from the walkable list
    // game.player = createBeing(makePlayer, freeCells);
    // game.monsters = [createBeing(makeMonster, freeCells)];

    // // hopefully moves the viewport?
    // game.display.setPlayerPos(game.player._x, game.player._y);
    // game.display._dirty = true;

}
  

// here we are creating the treasure chest items
// TODO: remove
function generateItems(game, freeCells) {
    for (let i=0; i<5; i++) {
        const key = takeFreeCell(freeCells);
        // the first chest contains the amulet
        if (!i) {
        game.amulet = key;
        game.items[key] = "*";
        } else {
        // add either a treasure chest
        // or a piece of gold to the map
        game.items[key] = RNG.getItem(["*", "g"]);
        }
    }
}
  
// randomly choose one cell from the freeCells array
// remove it from the array and return it
function takeFreeCell(freeCells) {
    const index = Math.floor(
        RNG.getUniform() * freeCells.length);
    const key = freeCells.splice(index, 1)[0];
    return key;
}
  
    // to make the map look a bit cooler we'll generate
    // walls around the rooms
function generateRooms(map, mapgen) {
    const rooms = mapgen.getRooms();
    // return;
    for (let rm=0; rm<rooms.length; rm++) {
        const room = rooms[rm];
    
        const l=room.getLeft() - 1;
        const r=room.getRight() + 1;
        const t=room.getTop() - 1;
        const b=room.getBottom() + 1;

        // place the room corner tiles
        map[l + "," + t] = "╔";
        map[r + "," + t] = "╗";
        map[l + "," + b] = "╚";
        map[r + "," + b] = "╝";

        // you can also use a single corner tile for every
        // corner if you prefer that look
        /*map[l + "," + t] = "o";
        map[r + "," + t] = "o";
        map[l + "," + b] = "o";
        map[r + "," + b] = "o";*/

        // the next four loops just generate each side of the room
        for (let i=room.getLeft(); i<=room.getRight(); i++) {
            const j = i + "," + t;
            const k = i + "," + b;
            if (noreplace.indexOf(map[j]) == -1) {
                map[j] = "═";
            }
            if (noreplace.indexOf(map[k]) == -1) {
                map[k] = "═";
            }
        }

        for (let i=room.getTop(); i<=room.getBottom(); i++) {
            const j = l + "," + i;
            const k = r + "," + i;
            if (noreplace.indexOf(map[j]) == -1) {
                map[j] = "║";
            }
            if (noreplace.indexOf(map[k]) == -1) {
                map[k] = "║";
            }
        }

        // you can also do something more interesting with
        // the doors of the room if you want
        // room.getDoors(console.log);
    }
}