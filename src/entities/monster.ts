import { v4 as uuidv4 } from 'uuid';
import GameState from "../gamestate";
import { combat, damage, walkable } from "../core/GameLogic"
import { RNG } from "rot-js/lib"
import { Entity, fullMap, targetPath } from "../core/Pathfinding";
import { Particle } from '../display/DisplayLogic';
/*******************
     *** The monster ***
     *******************/

export enum BehaviorState {
  INACTIVE, ENGAGED, RETURNING
}

export enum MonsterAI {
  MELEE, RANGED
}

type MonsterData = [[number, number], MonsterType, MonsterAI]

export class Monster {
  id: string
  // spawn point x, y
  spawnPointX: number
  spawnPointY: number
  _x: number
  _y: number
  character: string
  name: string
  baseTile: [number, number]
  stats: { [key: string]: number }
  lastArrow: [number, number]
  ai: MonsterAI
  awake: boolean
  behaviorState: BehaviorState
  minChaseRadius: number
  aggroOnSight: number
  currentAggro: number
  // minChaseRadius
  // aggroOnSight
  // currentAggro
  act: () => void
}

type MonsterType = "melee_1" | "melee_2" | "melee_3" | "melee_4" | "melee_boss_1" | "critter_1" | "critter_2" | "critter_3" | "ranged_1" | "ranged_2"

function _monsterStats(typ: MonsterType): { [key:string]:number} {
  switch (typ) {
    case "melee_1": { 
      return {  
        "hp": 8,
        "baseDAM": 2,
        "varDAM": 4,
        "STR": 0,
        "DEF": 0,
        "AGI": 5,
        "DEX": 0,
        "xpValue": 2
      }
    }
    case "melee_2": {
      return {
        "hp": 9,
        "baseDAM": 2,
        "varDAM": 5,
        "STR": 0,
        "DEF": 1,
        "AGI": 6,
        "DEX": 0,
        "xpValue": 3
      }
    }
    case "melee_3": {
      return {
        "hp": 10,
        "baseDAM": 3,
        "varDAM": 5,
        "STR": 0,
        "DEF": 2,
        "AGI": 7,
        "DEX": 1,
        "xpValue": 4
      }
    }
    case "melee_4": {
      return {
        "hp": 12,
        "baseDAM": 3,
        "varDAM": 6,
        "STR": 0,
        "DEF": 3,
        "AGI": 7,
        "DEX": 2,
        "xpValue": 6
      }
    }
    case "melee_boss_1": {
      return {
        "hp": 20,
        "baseDAM": 4,
        "varDAM": 5,
        "STR": 0,
        "DEF": 3,
        "AGI": 7,
        "DEX": 2,
        "xpValue": 10
      }
    }
    case "critter_1": {
      return {
        "hp": 2,
        "baseDAM": 1,
        "varDAM": 3,
        "STR": 0,
        "DEF": 0,
        "AGI": 2,
        "DEX": 2,
        "xpValue": 1
      }
    }
    case "critter_2": {
      return {
        "hp": 3,
        "baseDAM": 1,
        "varDAM": 4,
        "STR": 0,
        "DEF": 1,
        "AGI": 3,
        "DEX": 2,
        "xpValue": 1
      }
    }
    case "critter_3": {
      return {
        "hp": 4,
        "baseDAM": 2,
        "varDAM": 5,
        "STR": 0,
        "DEF": 2,
        "AGI": 4,
        "DEX": 3,
        "xpValue": 3
      }
    }
    case "ranged_1": {
      return {
        "hp": 5,
        "baseDAM": 1,
        "varDAM": 3,
        "STR": 0,
        "DEF": 0,
        "AGI": 2,
        "DEX": 0,
        "xpValue": 2,
        "ammo": 1
      }
    }
    case "ranged_2": {
      return {
        "hp": 7,
        "baseDAM": 2,
        "varDAM": 4,
        "STR": 0,
        "DEF": 0,
        "AGI": 4,
        "DEX": 0,
        "xpValue": 4,
        "ammo": 1
      }
    }
  }
}

function getMonsterData(monsterName:string):MonsterData {
  switch (monsterName) {
    case "a goblin": 
      return [[0, 96], "melee_1", MonsterAI.MELEE]
    case "a rat":
      return [[64, 256], "critter_1", MonsterAI.MELEE]
    case "a snake":
      return [[192,224], "critter_2", MonsterAI.MELEE]
    case "a goblin peltast":
      return [[128,96], "melee_2", MonsterAI.MELEE]
    case "a skeleton":
      return [[0, 128], "melee_2", MonsterAI.MELEE]
    case "a skeleton warrior":
      return [[64,128], "melee_3", MonsterAI.MELEE]
    case "a spider":
      return [[0,256], "critter_3", MonsterAI.MELEE]
    case "a bat":
      return [[128,224], "critter_2", MonsterAI.MELEE]
    case "a goblin mage":
      return [[64, 96], "ranged_1", MonsterAI.RANGED]
    case "a zombie":
      return [[64, 160], "melee_1", MonsterAI.MELEE]
    case "a skeleton mage":
      return [[128, 128], "ranged_2", MonsterAI.RANGED]
    case "a death knight":
      return [[192, 160], "melee_4", MonsterAI.MELEE]
    case "a reaper":
      return [[128, 320], "melee_boss_1", MonsterAI.MELEE]
  }
}
  
// basic ROT.js entity with position and stats
export function makeMonster(game:GameState, name, x, y): Monster {
    let [tile, monsterType, ai] = getMonsterData(name)
    let stats = _monsterStats(monsterType)
    return {
        // monster position
        id: uuidv4(),
        spawnPointX: x,
        spawnPointY: y,
        _x: x,
        _y: y,
        // which tile to draw the player with
        character: "M",
        // the name to display in combat
        name: name,
        baseTile: tile,
        // the monster's stats
        stats: stats,
        lastArrow: [1,0],
        // called by the ROT.js scheduler
        ai: ai,
        awake: false,
        behaviorState: BehaviorState.INACTIVE,
        minChaseRadius: 15,
        aggroOnSight: 18,
        currentAggro: 0,
        act: () => null
    }
}
    
// the ROT.js scheduler calls this method when it is time
// for the monster to act
export function monsterAct(game:GameState, m:Monster, player_path:any[], activeMonsters:{ [key:string]:Entity }) {

  if (m.behaviorState == BehaviorState.INACTIVE) {
    // this should happen before pathfinding
    // update state to engaged when player does viz checks
    // prevent heavy ai compute
    if (player_path.length <= 6) {
      console.log("INACTIVE: should activate");
      m.behaviorState = BehaviorState.ENGAGED;
      m.awake = true;
    }
  }

  if (m.behaviorState == BehaviorState.ENGAGED) {
    if (m.ai == MonsterAI.RANGED) {
      return ranged_engaged_behavior(game, m, player_path, activeMonsters)
    } else {
      return melee_engaged_behavior(game, m, player_path, activeMonsters)
    }
  }

  if (m.behaviorState == BehaviorState.RETURNING) {
    // TODO: inefficient, should bound
    return return_behavior(game, m)
  }
}

function ranged_engaged_behavior(game: GameState, m:Monster, player_path:any[], activeMonsters:{ [key:string]:Entity }) {
  let p = game.player;

  let spawn_dist = Math.abs(m.spawnPointX - m._x) + Math.abs(m.spawnPointY - m._y);
  if (spawn_dist >= m.minChaseRadius && m.currentAggro == 0) {
    console.log("ACTIVE: will RETURN");
    m.behaviorState = BehaviorState.RETURNING;
  } else if (player_path.length > 3) {
    let oldPos: [number, number] = [m._x, m._y];
    let newKey = `${player_path[0][0]},${player_path[0][1]}`
    if (newKey in activeMonsters) { 
      return
    }
    // the player is safe for now so update the monster position
    // to the first step on the path and redraw
    let delta: [number, number] = [player_path[0][0] - m._x, player_path[0][1] - m._y ];
    console.log("moving monster");
    console.log(delta);
    m.lastArrow = delta;

    m._x = player_path[0][0];
    m._y = player_path[0][1];
    // let newKey = m._x + "," + m._y;
    let newPos: [number, number] = [m._x, m._y];
    let animation = {
        id: m.id,
        startPos: oldPos,
        endPos: newPos,
        startTime: game.lastFrame,
        endTime: game.lastFrame + 250
    }
    game.animatingEntities[m.id] = animation;
  } else if (player_path.length <= 3) {

    // either attack or reload
    if (m.stats["ammo"] == 0) {
      m.stats["ammo"] = 1
      return
    }
    
    let angle = Math.atan2(  m._y - p._y,  m._x - p._x );
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

    console.log(`spawning arrow with ${angle} (${angle / Math.PI}) [${orientation}] from monster at`,m._x, m._y, `target at`,p._x,p._y);
    let id = uuidv4();
    
    let particle:Particle = {
      id: id,
      char: "A",
      orientation: orientation,
      startPos: [m._x, m._y],
      endPos: [p._x, p._y],
      startTime: game.lastFrame,
      endTime: game.lastFrame + 300
    }
    game.particles.push(particle);
    let damageRoll = RNG.getUniformInt(m.stats.baseDAM, m.stats.baseDAM + m.stats.varDAM);
    damage(game, m, p, damageRoll);
    m.stats["ammo"] -= 1;

  }
}

function melee_engaged_behavior(game: GameState, m:Monster, player_path:any[], activeMonsters:{ [key:string]:Entity }) {
  let p = game.player;

  let spawn_dist = Math.abs(m.spawnPointX - m._x) + Math.abs(m.spawnPointY - m._y);
  if (spawn_dist >= m.minChaseRadius && m.currentAggro == 0) {
    console.log("ACTIVE: will RETURN");
    m.behaviorState = BehaviorState.RETURNING;
  } else if (player_path.length > 1) {
    // draw whatever was on the last tile the monster was on
    // let oldKey = m._x + "," + m._y;
    let oldPos: [number, number] = [m._x, m._y];
    let newKey = `${player_path[0][0]},${player_path[0][1]}`
    if (newKey in activeMonsters) { 
      return
    }
    // the player is safe for now so update the monster position
    // to the first step on the path and redraw
    let delta: [number, number] = [player_path[0][0] - m._x, player_path[0][1] - m._y ];
    console.log("moving monster");
    console.log(delta);
    m.lastArrow = delta;

    m._x = player_path[0][0];
    m._y = player_path[0][1];
    // let newKey = m._x + "," + m._y;
    let newPos: [number, number] = [m._x, m._y];
    let animation = {
        id: m.id,
        startPos: oldPos,
        endPos: newPos,
        startTime: game.lastFrame,
        endTime: game.lastFrame + 250
    }
    game.animatingEntities[m.id] = animation;

  } else if (player_path.length == 1) {
    combat(game, m, p);
    return
  }
}

function return_behavior(game: GameState, m: Monster) {
  let spawn_point = { _x: m.spawnPointX, _y: m.spawnPointY }
  let return_path = targetPath(game, m, spawn_point as Entity, [], fullMap(game,));

  if (return_path.length == 0) {
    console.log("RETURNING: will inactivate");
    m.behaviorState = BehaviorState.INACTIVE;
    return
  }

  let oldPos: [number, number] = [m._x, m._y];
  // the player is safe for now so update the monster position
  // to the first step on the path and redraw
  let delta: [number, number] = [return_path[0][0] - m._x, return_path[0][1] - m._y ];
  console.log("moving monster");
  console.log(delta);
  m.lastArrow = delta;

  m._x = return_path[0][0];
  m._y = return_path[0][1];
  // let newKey = m._x + "," + m._y;
  let newPos: [number, number] = [m._x, m._y];
  let animation = {
      id: m.id,
      startPos: oldPos,
      endPos: newPos,
      startTime: game.lastFrame,
      endTime: game.lastFrame + 250
  }
  game.animatingEntities[m.id] = animation;
  return

}