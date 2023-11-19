import { v4 as uuidv4 } from 'uuid';
import { RNG } from "rot-js/lib";
import { combat, damage, init, checkItem, unload, walkable } from "../core/GameLogic";
import GameState from '../gamestate';
import { sfx } from "../sound/sfx";
import { hideToast, renderTown, showScreen, toast } from '../ui/ui';
import { getTownState } from "../core/TownLogic";
import { Monster } from "./monster";
import { dijkstraMap, Entity, getActiveMonsters, getBoundingBox, get_neighbors, manhattan } from '../core/Pathfinding';

interface Buff {
    duration: number,
    displayName: string,
    stats: { [key: string]: number }
}

export class Player {
    id: string
    in_map: boolean
    _x: number
    _y: number
    lastArrow: [number, number]
    character: string
    name: string
    inventory: [string, string][]
    buffs: Buff[]
    stats: { [key: string]: number }
    baseStats: { [key: string]: number }
    
    controls: PlayerControls
    act: any
}

export function applyBuff(player:Player, buff: Buff) {
    player.buffs = [buff];
    updateStats(player);
}

export function updateBuffs(player:Player) {
    player.buffs.forEach( b => b.duration -= 1 );
    let removeBuffs = player.buffs.filter( b => b.duration == 0 );
    for (let b of removeBuffs) {
        console.log("removing buff", b);
    }

    player.buffs = player.buffs.filter( b => b.duration > 0 );
    updateStats(player);
}

function updateStats(player:Player) {
    let temp_stats = { ...player.baseStats };
    for (let buff of player.buffs ) {
        for (let k in buff.stats) {
            temp_stats[k] += buff.stats[k];
        }
    }
    for (let k in temp_stats) {
        player.stats[k] = temp_stats[k];
    }
    // player.stats = temp_stats;
}

function monsterAt(game:GameState, x:number, y:number):Monster {
    for (let m of game.monsters) {
        if (m._x == x && m._y == y) {
            return m
        }
    }
}

export class PlayerControls {
    moves: PlayerMove[]
    skills: PlayerMove[]
    selectedMove: number
    currentTarget: string;
    dirty: boolean;

    constructor(moves: PlayerMove[], skills: PlayerMove[]) {
        this.moves = moves;
        this.skills = skills; 
        this.selectedMove = 0;
        this.currentTarget = null;
        this.dirty = true;
    }

    movePlayer(game,dir):boolean {
        const p = game.player;
        game.player.lastArrow = dir;
        console.log(dir);
        let target_x = p._x + dir[0];
        let target_y = p._y + dir[1];
        console.log(`dir: ${dir} moving player from ${p._x},${p._y} to ${target_x},${target_y}`);

        hideToast(false);

        const targetKey = `${target_x},${target_y}`;

        if (walkable.indexOf(game.map[targetKey]) == -1) { 
            console.log("can't move to ", targetKey, " WAITing instead");
            return this.tempAttemptSkillByName(game, game.player, "WAIT");
        }

        let contains_monster = monsterAt(game, target_x, target_y);
        console.log("tile monster check returned: ", contains_monster);
        if (contains_monster != null) {
            console.log("bumping ATK ", contains_monster);
            return this.attemptMoveWithTarget(game, game.player, "ATK", contains_monster.id);
        }
      
        // movePlayerTo(game, p._x + dir[0], p._y + dir[1]);

        let oldPos = [p._x, p._y]

        p._x = target_x;
        p._y = target_y;
      
        let newPos = [p._x, p._y]
        let animation = {
            id: p.id,
            startPos: oldPos,
            endPos: newPos,
            startTime: game.lastFrame,
            endTime: game.lastFrame + 200
        }
        // Game.animating[newKey] = animation;
        game.animatingEntities[p.id] = animation;
      
        game.engine.unlock();
        // play the "step" sound
        sfx["step"].play();
        // check if the player stepped on an item
        checkItem(game,p);
      


        return true;
    }
      

    selectMove(dir:number) {
        let currentMove = this.moves[this.selectedMove] 
        // let selectedMovePosition = this.moves.map((m) => m.name).indexOf(this.selectedMove);
        console.log(`current selected move: ${currentMove} at pos ${this.selectedMove}, increment: ${dir}`);
        let newPosition = this.selectedMove + dir;
        let movesLen = this.moves.length + this.skills.length;
        if (newPosition < 0) {
            this.selectedMove = movesLen - 1;
        } else if (newPosition >= movesLen) {
            this.selectedMove = 0
        } else {
            this.selectedMove = newPosition;
        }
        this.dirty = true;
    }

    selectMoveByName(name) {
        let moveIndex = this.moves.concat(...this.skills).map( (m) => m.name ).indexOf(name);
        this.selectedMove = moveIndex;
    }

    cycleTarget(game:GameState, player:Player, dir:number) {
        let currentTarget = game.player.controls.currentTarget
        let awakeTargets = game.monsters.filter( (m) => m.awake).map( (m) => m.id);
        let currentTargetIndex = awakeTargets.indexOf(currentTarget);
        console.log("currentTargetIndex:",currentTargetIndex,"awake targets:",awakeTargets)
        let newTargetIndex = currentTargetIndex + dir;
        if (newTargetIndex < 0) { 
          game.player.controls.currentTarget = awakeTargets[awakeTargets.length - 1];
        } else if (newTargetIndex >= awakeTargets.length) {
          game.player.controls.currentTarget = awakeTargets[0];
        } else {
          game.player.controls.currentTarget = awakeTargets[newTargetIndex];
        }
    
    }

    selectTargetById(game, player, id) {
        let target = game.monsters.filter( (m) => m.id == id )[0];
        console.log("selected new target: ",target)
        this.currentTarget = id;
    }

    attemptMoveWithTarget(game, player, move, target):boolean {
        this.selectMoveByName(move);
        this.selectTargetById(game, player, target);
        return this.attemptAction(game,player)
    }

    tempAttemptSkillByName(game,player,name):boolean {
        let prevMove = this.selectedMove;
        this.selectMoveByName(name);
        let ret = this.attemptAction(game,player);
        this.selectedMove = prevMove;
        return ret;
    }

    // findClosestTarget(game, player)

    attemptAction(game, player):boolean {
        let currentMove = this.moves.concat(...this.skills)[this.selectedMove];
        // let selectedMovePosition = this.moves.map((m) => m.name).indexOf(this.selectedMove);
        console.log(`attempting current selected move at pos ${this.selectedMove}`,currentMove);
        let actionRet = false;
        if (currentMove.ready == false) {
            return false;
        }
        let tmpTarget = null;


        // new algo
        // get active monsters
        // get bounding box
        // get dijkstra map
        
        let activeMonsters = getActiveMonsters(game, 16);
        let entities: Entity[] = [game.player];
        for (let [pos,m] of Object.entries(activeMonsters)) {
            entities.push(m);
        }
        let boundingBox = getBoundingBox(entities,3);
        let paths = dijkstraMap(game, [game.player],[], boundingBox);
        console.log("dijkstra map:", paths);
        for (let [pos,m] of Object.entries(activeMonsters)) {
            console.log("distance to monster at ",pos, paths[pos]);
        }
        let target;
        if (player.controls.currentTarget == null) {
            console.log("auto targeting");
            let targets = Object.values(activeMonsters).sort( (a,b) => {
                let k_a = `${a._x},${a._y}`;
                let k_b = `${b._x},${b._y}`;
                return paths[k_a] - paths[k_b]
            })
            console.log("candidate targets:", targets)
            target = targets[0];
        } else {
            target = Object.values(activeMonsters).filter( (m) => m.id == player.controls.currentTarget )[0];
        }

        console.log("targeting",target);

        if (currentMove.name == "ATK") {
            actionRet = attackAction(game,player,target);
        } else if (currentMove.name == "BASH") {
            actionRet = bashAction(game,player,target);
        } else if (currentMove.name == "BOW") {
            actionRet = bowAction(game,player, target);
        } else if (currentMove.name == "AIM") {
            actionRet = aimAction(game,player);
        } else if (currentMove.name == "DASH") {
            actionRet = dashAction(game,player, target, paths);
        } else if (currentMove.name == "DFND") {
            actionRet = defendAction(game,player);
        } else if (currentMove.name == "USE") {
            actionRet = useAction(game,player);
        } else if (currentMove.name == "EAT") {
            actionRet = eatAction(game,player);
        } else if (currentMove.name == "WAIT") {
            actionRet = waitAction(game, player);
        }
        if (actionRet) {
            setTimeout(function() {
                game.engine.unlock();
            }, 250);

            for (let m of this.moves.concat(...this.skills)) {
                if (m.stats.currentCooldown > 0) {
                    m.stats.currentCooldown -= 1;
                    if (m.stats.currentCooldown == 0) {
                        m.ready = true; 
                        // what about ammo/eat checks?
                    }
                } else if (m.name == "EAT" && player.stats.food > 0) {
                    // hack, only takes affect after an action
                    // should do at start of turn
                    m.ready = true;
                } else if (m.name == "BOW" && player.stats.arrows > 0) {
                    m.ready = true;
                }
            }                
        }
        player.controls.dirty = true;
        return actionRet;
        // should check if move succeeded
    }
}

function attackAction(game, player, target):boolean {
    console.log("invoking ATK");
    if (manhattan(player,target) > 1) {
        toast(game, "out of range");
        return false;
    }
    // let target = game.monsters.filter( (m) => m.id == player.controls.currentTarget )[0];
    combat(game, player, target);
    return true;
}

function bashAction(game, player:Player, target): boolean {
    console.log("invoking BASH");
    if (manhattan(player,target) > 1) {
        toast(game, "out of range");
        return false;
    }
    applyBuff(player, {
        duration: 1,
        displayName: "BASH",
        stats: {
            "STR":3
        }
    });

    // let target = game.monsters.filter( (m) => m.id == player.controls.currentTarget )[0];
    combat(game, player, target);

    applyBuff(player, {
        duration: 5,
        displayName: "BASH",
        stats: {
            "STR":1
        }
    });

    player.controls.moves[1].ready = false;
    player.controls.moves[1].stats.currentCooldown = player.controls.moves[1].stats.cooldown;
    return true;
}

function bowAction(game, player:Player, target): boolean {
    if (manhattan(player,target) > 5) {
        toast(game, "out of range");
        return false;
    }

    if (target) {
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

        player.stats.arrows -= 1;
        console.log("remaining arrows:", player.stats.arrows)
        if (player.stats.arrows == 0) {
            console.log("out of arrows");
            player.controls.moves[2].ready = false;
        }

    }
    return true;  
}

function aimAction(game, player): boolean {
    console.log("applying AIM");
    applyBuff(player, {
        duration: 5,
        displayName: "AIM",
        stats: {
            "DEX":4
        }
    });
    player.controls.moves[3].ready = false;
    player.controls.moves[3].stats.currentCooldown = player.controls.moves[3].stats.cooldown;

    return true;
}

function dashAction(game, player, target, paths):boolean {
    console.log("invoking DASH");
    let activeMonsters = getActiveMonsters(game, 16)
    let obstacles = Object.values(activeMonsters).map( m =>
        `${m._x},${m._y}`
    );
    let neighbors = get_neighbors([target._x,target._y]);
    let min_dist = 99
    let move_to: [number, number] = null;

    for (let [nx, ny] of neighbors) {
        let k_n = `${nx},${ny}`
        let path = paths[k_n]
        if (k_n in obstacles) {
            continue
        } else if (move_to != null && min_dist < path) {
            continue
        } else {
            move_to = [nx, ny]
            min_dist = path
        }
    }
    if (min_dist > 4) {
        toast(game, "out of range");
        return false;
    }

    applyBuff(player, {
        duration: 5,
        displayName: "DASH",
        stats: {
            "AGI":4
        }
    });
    // let target = game.monsters.filter( (m) => m.id == player.controls.currentTarget )[0];
    combat(game, player, target);
    combat(game, player, target);


    let oldPos = [player._x, player._y]

    player._x = move_to[0];
    player._y = move_to[1];
  
    let animation = {
        id: player.id,
        startPos: oldPos,
        endPos: move_to,
        startTime: game.lastFrame,
        endTime: game.lastFrame + 100
    }
    // Game.animating[newKey] = animation;
    game.animatingEntities[player.id] = animation;

    player.controls.moves[4].ready = false;
    player.controls.moves[4].stats.currentCooldown = player.controls.moves[4].stats.cooldown;

    return true;
}

function defendAction(game, player):boolean {
    console.log("applying DEFEND");
    applyBuff(player, {
        duration: 5,
        displayName: "DFND",
        stats: {
            "DEF":1
        }
    });
    player.controls.moves[5].ready = false;
    player.controls.moves[5].stats.currentCooldown = player.controls.moves[1].stats.cooldown;
    return true;
}

function useAction(game, player): boolean {
    console.log("applying USE");
    let locKey = `${game.player._x},${game.player._y}`
    let items = game.items[locKey];
    for (let i of items) {
        console.log(`item at ${locKey}: `, i)
        if (i == "<") {
            console.log("stairs up")
            unload(game);
            renderTown(game, getTownState(game, "town"));
            showScreen("town", null);
            init(game);
        } else if (i == ">") {
            console.log("stairs down")
            unload(game);
            init(game);
        }
    }
    return false;
}

function waitAction(game, player): boolean {
    console.log("WAITing");
    return true
}

function eatAction(game, player:Player): boolean {
    console.log("applying EAT");
    player.stats.hp = player.stats.maxHP;
    player.stats.food -= 1;
    if (player.stats.food == 0) {
        player.controls.skills[1].ready = false;
    }
    return false
}

export interface PlayerMove {
    name: string
    enabled: boolean
    ready: boolean
    stats: { [key: string]: number }
}

export function placePlayer(game, id, x, y):Player {
    game.player._x = x;
    game.player._y = y;
    game.player.in_map = true;
    return game.player;
}

// creates a player object with position, inventory, and stats
export function makePlayer(game):Player {
    return {
        // player's position
        id: uuidv4(),
        in_map: false,
        _x: null,
        _y: null,
        lastArrow: [1,0],
        // which tile to draw the player with
        character: "@",
        // the name to display in combat
        name: "you",
        // what the player is carrying
        inventory: [
        // ["x", "Axe (+5)"],
        // ["p", "Potion"]
        ],
        // the player's stats
        buffs: [],

        stats: {"hp": 30, 
                "maxHP": 30,
                "baseDAM": 2,
                "varDAM": 4,
                "STR": 0,
                "DEF": 0,
                "AGI": 2,
                "DEX": 0,
                "xp": 1, 
                "gold": 0,
                "arrows": 5,
                "maxArrows":5,
                "food": 2,
                "maxFood": 2},

        baseStats: {"maxHP": 30, 
                    "baseDAM": 2,
                    "varDAM": 4,
                    "STR": 0,
                    "DEF": 0,
                    "AGI": 2,
                    "DEX": 0,
                    "maxArrows":5,
                    "maxFood": 2},
        // the ROT.js scheduler calls this method when it is time
        // for the player to act
        // what this does is lock the engine to take control
        // and then wait for input from the user

        controls: new PlayerControls([
            {name: "ATK", enabled: true, ready: true, stats: { cooldown: 0, currentCooldown: 0 } },
            {name: "BASH", enabled: true, ready: true, stats: { cooldown: 5, currentCooldown: 0 } },
            {name: "BOW", enabled: true, ready: true, stats: { cooldown: 0, currentCooldown: 0 } },
            {name: "AIM", enabled: false, ready: false, stats: { cooldown: 5, currentCooldown: 0 } },
            {name: "DASH", enabled: true, ready: true, stats: { cooldown: 5, currentCooldown: 0 } },
            {name: "DFND", enabled: true, ready: true, stats: { cooldown: 0, currentCooldown: 0 } },
        ], [ 
            {name: "USE", enabled: true, ready: true, stats: { cooldown: 0, currentCooldown: 0 } },
            {name: "EAT", enabled: true, ready: true, stats: { cooldown: 0, currentCooldown: 0 } },
            {name: "SEARCH", enabled: false, ready: false, stats: { cooldown: 0, currentCooldown: 0 } },
            {name: "WAIT", enabled: true, ready: true, stats: { cooldown: 0, currentCooldown: 0 } },
            {name: "RUN", enabled: false, ready: false, stats: { cooldown: 0, currentCooldown: 0 } },
            {name: "HELP", enabled: false, ready: false, stats: { cooldown: 0, currentCooldown: 0 } },
        ]),
        act: () => {
            game.engine.lock();
            updateBuffs(game.player);
            game.player.controls.dirty = true;
            if (!game.arrowListener) {
                game.arrowListener = true;
            }
        },
    }
}
  


  