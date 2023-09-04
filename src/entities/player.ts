
export class Player {
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
    dirty: boolean;

    constructor(moves: PlayerMove[]) {
        this.moves = moves;
        this.selectedMove = 0;
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
}

export class PlayerMove {
    name: string
    enabled: boolean
}

// creates a player object with position, inventory, and stats
export function makePlayer(game, x:number, y:number):Player {
    return {
        // player's position
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
            if (!game.arrowListener) {
                game.arrowListener = true;
            }
        },
    }
}
  


  