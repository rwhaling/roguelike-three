import GameState from "../gamestate";
import { combat, walkable } from "../core/GameLogic"
import { Path } from "rot-js/lib"
/*******************
     *** The monster ***
     *******************/

export enum BehaviorState {
  INACTIVE, ENGAGED, RETURNING
}

export class Monster {
  id: string
  // spawn point x, y
  spawnPointX: number
  spawnPointY: number
  _x: number
  _y: number
  character: string
  name: string
  stats: { [key: string]: number }
  lastArrow: [number, number]
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
  
// basic ROT.js entity with position and stats
export function makeMonster(game:GameState, id, x, y): Monster {
    return {
        // monster position
        id: id,
        spawnPointX: x,
        spawnPointY: y,
        _x: x,
        _y: y,
        // which tile to draw the player with
        character: "M",
        // the name to display in combat
        name: "a goblin",
        // the monster's stats
        stats: {  "hp": 8,
                "baseDAM": 2,
                "varDAM": 4,
                "STR": 0,
                "DEF": 0,
                "AGI": 5,
                "DEX": 0,
        },
        lastArrow: [1,0],
        // called by the ROT.js scheduler
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
export function monsterAct(game:GameState, m:Monster, player_path:any[], activeMonsters:{ [key:string]:Monster }) {
  // reference to the monster itself
  //HACK
  // const m = game.monsters.filter( (i) => i.id == id)[0];
  // the monster wants to know where the player is
  const p = game.player;
  // reference to the game map
  const map = game.map;
  // reference to ROT.js display
  const display = game.display;

  // new algorithm
  // if inactive:
      // check distance to player
      // activate
  // if active:
      // check aggro
      // check distance from spawn point
      // possibly flip to returning
      // else get distance from player
      // pursue or attack
  // if returning:
      // get path to spawn point
      // move there
  // check distance to spawn point

  // const passableCallback = function(x, y) {
  //   return (walkable.indexOf(map[x + "," + y]) != -1);
  // }
  // const monster_astar = new Path.AStar(m._x, m._y, passableCallback, {topology:4});
  // const player_path: any[] = [];
  // const player_path_callback = (x,y) => {
  //   player_path.push([x, y]);
  // }
  // monster_astar.compute(p._x, p._y, player_path_callback);
  // player_path.pop();
  // player_path.reverse();

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
    let spawn_dist = Math.abs(m.spawnPointX - m._x) + Math.abs(m.spawnPointY - m._y);
    if (spawn_dist >= m.minChaseRadius && m.currentAggro == 0) {
      console.log("ACTIVE: will RETURN");
      m.behaviorState = BehaviorState.RETURNING;
    } else if (player_path.length > 1) {
      // draw whatever was on the last tile the monster was one
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

  if (m.behaviorState == BehaviorState.RETURNING) {
    // TODO: inefficient, should bound
    let spawn_path_i = 0;
    const passableCallback = function(x, y) {
      spawn_path_i += 1;
      return (walkable.indexOf(map[x + "," + y]) != -1);
    }
  
    const monster_astar = new Path.AStar(m._x, m._y, passableCallback, {topology:4});
 
    const spawn_path: any[] = [];
    const spawn_path_callback = (x,y) => {
      spawn_path.push([x,y]);
    }
    monster_astar.compute(m.spawnPointX, m.spawnPointY, spawn_path_callback);
    console.log("computed spawn path in ",spawn_path_i," cycles");
    spawn_path.pop();
    spawn_path.reverse();  

    if (spawn_path.length == 0) {
      console.log("RETURNING: will inactivate");
      m.behaviorState = BehaviorState.INACTIVE;
      return
    }

    let oldPos: [number, number] = [m._x, m._y];
    // the player is safe for now so update the monster position
    // to the first step on the path and redraw
    let delta: [number, number] = [spawn_path[0][0] - m._x, spawn_path[0][1] - m._y ];
    console.log("moving monster");
    console.log(delta);
    m.lastArrow = delta;

    m._x = spawn_path[0][0];
    m._y = spawn_path[0][1];
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

  // // in this whole code block we use the ROT.js "astar" path finding
  // // algorithm to help the monster figure out the fastest way to get
  // // to the player - for implementation details check out the doc:
  // // http://ondras.github.io/rot.js/manual/#path
  // const astar = new Path.AStar(p._x, p._y, passableCallback, {topology:4});
  // const path: any[] = [];
  // const pathCallback = function(x:number, y:number) {
  //   path.push([x, y]);
  // }
  // astar.compute(m._x, m._y, pathCallback);

  // // ignore the first move on the path as it is the starting point
  // path.shift();

  // if the distance from the monster to the player is less than one
  // square then initiate combat
}
