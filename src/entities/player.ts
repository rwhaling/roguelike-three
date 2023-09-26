import { v4 as uuidv4 } from 'uuid';
import { RNG } from "rot-js/lib";
import { combat, damage } from "../core/GameLogic";

export class Player {
    id: string
    _x: number
    _y: number
    lastArrow: [number, number]
    character: string
    name: string
    inventory: [string, string][]
    stats: { [key: string]: number }
    
    controls: PlayerControls

    act: any
}

export class PlayerControls {
    moves: PlayerMove[]
    selectedMove: number
    currentTarget: string;
    dirty: boolean;

    constructor(moves: PlayerMove[]) {
        this.moves = moves;
        this.selectedMove = 0;
        this.currentTarget = null;
        this.dirty = true;
    }

    selectMove(dir:number) {
        let currentMove = this.moves[this.selectedMove] 
        // let selectedMovePosition = this.moves.map((m) => m.name).indexOf(this.selectedMove);
        console.log(`current selected move: ${currentMove} at pos ${this.selectedMove}, increment: ${dir}`);
        let newPosition = this.selectedMove + dir;
        let movesLen = this.moves.length;
        if (newPosition < 0) {
            this.selectedMove = movesLen - 1;
        } else if (newPosition >= movesLen) {
            this.selectedMove = 0
        } else {
            this.selectedMove = newPosition;
        }
        this.dirty = true;
    }

    attemptMove(game, player) {
        let currentMove = this.moves[this.selectedMove] 
        // let selectedMovePosition = this.moves.map((m) => m.name).indexOf(this.selectedMove);
        console.log(`attempting current selected move at pos ${this.selectedMove}`,currentMove);
        if (currentMove.name == "ATK") {
            let target = game.monsters.filter( (m) => m.id == player.controls.currentTarget )[0];
            combat(game, player, target);
            setTimeout(function() {
                game.engine.unlock();
            }, 250);          
        } else if (currentMove.name == "BOW") {
            bowAction(game,player);
            setTimeout(function() {
                game.engine.unlock();
            }, 250);
        }
    }
}



function bowAction(game, player) {
    if (player.controls.currentTarget) {
        let target = game.monsters.filter( (m) => m.id == player.controls.currentTarget )[0];
        let angle = Math.atan2(  game.player._y - target._y,  game.player._x - target._x );
  //          let angle = Math.atan2(  target._y - Game.player._y,  target._x - Game.player._x );
        let orientation = 0;
        let frac = angle / Math.PI;
        if (frac < 0) {
          frac += 1
        }
  
        if (frac < 1/16) {
          orientation = 0;
        } else if (frac < 3/16) {
          orientation = 1;
        } else if (frac < 5/16) {
          orientation = 2;
        } else if (frac < 7/16) {
          orientation = 3;
        } else if (frac < 9/16) {
          orientation = 4;
        } else if (frac < 11/16) {
          orientation = 5;
        } else if (frac < 13/16) {
          orientation = 6;
        } else if (frac < 15/16) {
          orientation = 7
        }
  
        console.log(`spawning arrow with ${angle} (${angle / Math.PI}) [${orientation}] from player at`,player._x, player._y, `target at`,target._x,target._y);
        let id = uuidv4();
  
        let particle = {
          id: id,
          char: "A",
          orientation: orientation,
          startPos: [player._x, player._y],
          endPos: [target._x, target._y],
          startTime: game.lastFrame,
          endTime: game.lastFrame + 300
        }
        game.particles.push(particle);

        let damageRoll = RNG.getItem([1,2,3,4,5,6])!;
        damage(game, player, target, damageRoll);

    }
    return;  
}

export class PlayerMove {
    name: string
    enabled: boolean
}

// creates a player object with position, inventory, and stats
export function makePlayer(game, id:string, x:number, y:number):Player {
    return {
        // player's position
        id: id,
        _x: x,
        _y: y,
        lastArrow: [1,0],
        // which tile to draw the player with
        character: "@",
        // the name to display in combat
        name: "you",
        // what the player is carrying
        inventory: [
        ["x", "Axe (+5)"],
        ["p", "Potion"]
        ],
        // the player's stats
        stats: {"hp": 10, "xp": 1, "gold": 0},
        // the ROT.js scheduler calls this method when it is time
        // for the player to act
        // what this does is lock the engine to take control
        // and then wait for input from the user

        controls: new PlayerControls([
            {name: "ATK", enabled: true},
            {name: "BASH", enabled: true},
            {name: "BOW", enabled: true},
            {name: "AIM", enabled: false},
            {name: "DASH", enabled: false},
            {name: "DFND", enabled: true},
            {name: "RUN", enabled: true}
        ]),
        act: () => {
            game.engine.lock();
            game.player.controls.dirty = true;
            if (!game.arrowListener) {
                game.arrowListener = true;
            }
        },
    }
}
  


  